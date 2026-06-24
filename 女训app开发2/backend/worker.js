const ALLOWED_ORIGINS = new Set(["https://nikka-alecto69.github.io"]);
const DAY_MS = 86400000;
const MAX_BODY = 10 * 1024;
const EVENT_TYPES = new Set(["app_opened","profile_completed","checkin_completed","recommendation_generated","workout_detail_opened","training_feedback_saved","cycle_education_viewed"]);
const DAY_TYPES = new Set(["冲刺日","常规日","降载日","恢复日"]);
const COMPLETION = new Set(["完成","完成一部分","没有完成"]);
const AFTER_FEELING = new Set(["更有精神","正常","更累","有不适"]);
const ACCURACY = new Set(["很准","还可以","不太准"]);
const CYCLE_PHASES = new Set(["menstrual","follicular","ovulation","luteal"]);
const FEEDBACK_TYPES = new Set(["使用问题","推荐体验","功能建议","内容建议","其他"]);

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (origin && !isAllowedOrigin(origin)) return json({ error: "forbidden_origin" }, 403, origin);
    try {
      const url = new URL(request.url);
      if (url.pathname === "/v1/health" && request.method === "GET") return json({ ok: true }, 200, origin);
      if (!origin) return json({ error: "forbidden_origin" }, 403, origin);
      if (url.pathname === "/v1/consent") return handleConsent(request, env, origin);
      if (url.pathname === "/v1/event") return handleEvent(request, env, origin);
      if (url.pathname === "/v1/training-feedback") return handleTrainingFeedback(request, env, origin);
      if (url.pathname === "/v1/product-feedback") return handleProductFeedback(request, env, origin);
      if (url.pathname === "/v1/delete-my-data") return handleDeleteMyData(request, env, origin);
      if (url.pathname === "/v1/admin/login") return handleAdminLogin(request, env, origin);
      if (url.pathname === "/v1/admin/logout") return handleAdminLogout(request, env, origin);
      if (url.pathname === "/v1/admin/summary") return handleAdminSummary(request, env, origin, url);
      if (url.pathname === "/v1/admin/feedback") return handleAdminFeedback(request, env, origin);
      return json({ error: "not_found" }, 404, origin);
    } catch (err) {
      return json({ error: err.status ? err.message : "request_failed" }, err.status || 500, origin);
    } finally {
      ctx.waitUntil(cleanup(env));
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(cleanup(env));
  }
};

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  const allowOrigin = isAllowedOrigin(origin) ? origin : "https://nikka-alecto69.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}

async function readJson(request) {
  if (request.method !== "POST") throw httpError("method_not_allowed", 405);
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) throw httpError("unsupported_media_type", 415);
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > MAX_BODY) throw httpError("payload_too_large", 413);
  const text = await request.text();
  if (text.length > MAX_BODY) throw httpError("payload_too_large", 413);
  try { return JSON.parse(text || "{}"); } catch { throw httpError("invalid_json", 400); }
}

function httpError(message, status) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function participantHash(env, participantId) {
  if (!env.ADMIN_SESSION_SECRET) throw httpError("server_not_configured", 503);
  if (typeof participantId !== "string" || participantId.length < 12 || participantId.length > 80) throw httpError("invalid_participant", 400);
  return hmacHex(env.ADMIN_SESSION_SECRET, `participant:${participantId}`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function publicRateLimit(env, participant_hash, endpoint) {
  const now = Date.now();
  const since = now - 60 * 60 * 1000;
  const found = await env.DB.prepare("SELECT COUNT(*) AS count FROM public_rate_limits WHERE participant_hash = ? AND endpoint = ? AND created_at >= ?").bind(participant_hash, endpoint, since).first();
  if ((found?.count || 0) > 120) throw httpError("rate_limited", 429);
  await env.DB.prepare("INSERT INTO public_rate_limits (participant_hash, endpoint, created_at) VALUES (?, ?, ?)").bind(participant_hash, endpoint, now).run();
}

async function touchParticipant(env, hash, flags = null) {
  const d = today();
  await env.DB.prepare("INSERT OR IGNORE INTO participants (participant_hash, first_seen_date, last_seen_date, consent_analytics, consent_training_feedback, consent_cycle_aggregate) VALUES (?, ?, ?, 0, 0, 0)").bind(hash, d, d).run();
  if (flags) {
    await env.DB.prepare("UPDATE participants SET last_seen_date = ?, consent_analytics = ?, consent_training_feedback = ?, consent_cycle_aggregate = ?, deleted_at = NULL WHERE participant_hash = ?")
      .bind(d, flags.analytics ? 1 : 0, flags.training ? 1 : 0, flags.cycle ? 1 : 0, hash).run();
  } else {
    await env.DB.prepare("UPDATE participants SET last_seen_date = ? WHERE participant_hash = ?").bind(d, hash).run();
  }
}

async function consentFor(env, hash) {
  return env.DB.prepare("SELECT consent_analytics, consent_training_feedback, consent_cycle_aggregate FROM participants WHERE participant_hash = ?").bind(hash).first();
}

async function handleConsent(request, env, origin) {
  const body = await readJson(request);
  const hash = await participantHash(env, body.participantId);
  const flags = {
    analytics: body.anonymousAnalytics === true,
    training: body.anonymousTrainingFeedback === true,
    cycle: body.cycleAggregate === true
  };
  await publicRateLimit(env, hash, "consent");
  await touchParticipant(env, hash, flags);
  await env.DB.prepare("INSERT INTO consent_snapshots (participant_hash, consent_version, anonymous_analytics, anonymous_training_feedback, cycle_aggregate, created_date) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(hash, String(body.consentVersion || "").slice(0, 32), flags.analytics ? 1 : 0, flags.training ? 1 : 0, flags.cycle ? 1 : 0, today()).run();
  return json({ ok: true }, 200, origin);
}

async function handleEvent(request, env, origin) {
  const body = await readJson(request);
  if (!EVENT_TYPES.has(body.eventType)) throw httpError("invalid_event", 400);
  const hash = await participantHash(env, body.participantId);
  await publicRateLimit(env, hash, "event");
  const c = await consentFor(env, hash);
  if (!c?.consent_analytics) throw httpError("consent_required", 403);
  await touchParticipant(env, hash);
  await env.DB.prepare("INSERT INTO analytics_events (participant_hash, event_type, event_date) VALUES (?, ?, ?)").bind(hash, body.eventType, safeDate(body.eventDate)).run();
  return json({ ok: true }, 200, origin);
}

async function handleTrainingFeedback(request, env, origin) {
  const body = await readJson(request);
  if (!COMPLETION.has(body.completion) || !AFTER_FEELING.has(body.afterFeeling) || !ACCURACY.has(body.recommendationAccuracy) || !DAY_TYPES.has(body.dayType)) throw httpError("invalid_feedback", 400);
  const hash = await participantHash(env, body.participantId);
  await publicRateLimit(env, hash, "training-feedback");
  const c = await consentFor(env, hash);
  if (!c?.consent_training_feedback) throw httpError("consent_required", 403);
  const phase = CYCLE_PHASES.has(body.cyclePhase) && c.consent_cycle_aggregate ? body.cyclePhase : null;
  await touchParticipant(env, hash);
  await env.DB.prepare("INSERT INTO training_feedback (participant_hash, submitted_date, day_type, workout_type, completion, after_feeling, recommendation_accuracy, cycle_phase) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(hash, safeDate(body.submittedDate), body.dayType, String(body.workoutType || "").slice(0, 60), body.completion, body.afterFeeling, body.recommendationAccuracy, phase).run();
  return json({ ok: true }, 200, origin);
}

async function handleProductFeedback(request, env, origin) {
  const body = await readJson(request);
  if (!FEEDBACK_TYPES.has(body.feedbackType) || !Number.isInteger(body.satisfaction) || body.satisfaction < 1 || body.satisfaction > 5 || body.textConsent !== true) throw httpError("invalid_product_feedback", 400);
  const hash = await participantHash(env, body.participantId);
  await publicRateLimit(env, hash, "product-feedback");
  await touchParticipant(env, hash);
  await env.DB.prepare("INSERT INTO product_feedback (participant_hash, submitted_date, feedback_type, satisfaction, text) VALUES (?, ?, ?, ?, ?)")
    .bind(hash, safeDate(body.submittedDate), body.feedbackType, body.satisfaction, String(body.text || "").slice(0, 500)).run();
  return json({ ok: true }, 200, origin);
}

async function handleDeleteMyData(request, env, origin) {
  const body = await readJson(request);
  const hash = await participantHash(env, body.participantId);
  await publicRateLimit(env, hash, "delete-my-data");
  await Promise.all([
    env.DB.prepare("DELETE FROM consent_snapshots WHERE participant_hash = ?").bind(hash).run(),
    env.DB.prepare("DELETE FROM analytics_events WHERE participant_hash = ?").bind(hash).run(),
    env.DB.prepare("DELETE FROM training_feedback WHERE participant_hash = ?").bind(hash).run(),
    env.DB.prepare("DELETE FROM product_feedback WHERE participant_hash = ?").bind(hash).run(),
    env.DB.prepare("DELETE FROM public_rate_limits WHERE participant_hash = ?").bind(hash).run(),
    env.DB.prepare("DELETE FROM participants WHERE participant_hash = ?").bind(hash).run()
  ]);
  return json({ ok: true }, 200, origin);
}

async function handleAdminLogin(request, env, origin) {
  const body = await readJson(request);
  await limitAdminLogin(env);
  if (!env.ADMIN_DEMO_PASSWORD || !env.ADMIN_SESSION_SECRET || body.password !== env.ADMIN_DEMO_PASSWORD) {
    await recordAdminAttempt(env, false);
    return json({ ok: false, error: "invalid_login" }, 200, origin);
  }
  await recordAdminAttempt(env, true);
  const token = randomToken();
  const tokenHash = await hmacHex(env.ADMIN_SESSION_SECRET, `admin:${token}`);
  const now = Date.now();
  await env.DB.prepare("INSERT INTO admin_sessions (token_hash, created_at, expires_at, revoked_at) VALUES (?, ?, ?, NULL)").bind(tokenHash, now, now + 8 * 60 * 60 * 1000).run();
  return json({ token, expiresInSeconds: 28800 }, 200, origin);
}

async function requireAdmin(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !env.ADMIN_SESSION_SECRET) throw httpError("unauthorized", 401);
  const tokenHash = await hmacHex(env.ADMIN_SESSION_SECRET, `admin:${token}`);
  const row = await env.DB.prepare("SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ?").bind(tokenHash, Date.now()).first();
  if (!row) throw httpError("invalid_token", 401);
  return tokenHash;
}

async function handleAdminLogout(request, env, origin) {
  const tokenHash = await requireAdmin(request, env);
  await env.DB.prepare("UPDATE admin_sessions SET revoked_at = ? WHERE token_hash = ?").bind(Date.now(), tokenHash).run();
  return json({ ok: true }, 200, origin);
}

async function handleAdminSummary(request, env, origin, url) {
  if (request.method !== "GET") throw httpError("method_not_allowed", 405);
  await requireAdmin(request, env);
  const range = ["7d","30d","all"].includes(url.searchParams.get("range")) ? url.searchParams.get("range") : "30d";
  const where = rangeWhere("submitted_date", range);
  const eventWhere = rangeWhere("event_date", range);
  const overview = await overviewStats(env);
  const training = {
    dayType: await distribution(env, "training_feedback", "day_type", where),
    completion: await distribution(env, "training_feedback", "completion", where),
    afterFeeling: await distribution(env, "training_feedback", "after_feeling", where),
    recommendationAccuracy: await distribution(env, "training_feedback", "recommendation_accuracy", where)
  };
  const cycle = {
    phaseCounts: await distribution(env, "training_feedback", "cycle_phase", `${where} AND cycle_phase IS NOT NULL`),
    completionByPhase: await groupedDistribution(env, "cycle_phase", "completion", where),
    accuracyByPhase: await groupedDistribution(env, "cycle_phase", "recommendation_accuracy", where)
  };
  const product = {
    satisfaction: await distribution(env, "product_feedback", "satisfaction", where),
    type: await distribution(env, "product_feedback", "feedback_type", where)
  };
  return json({ overview, training, cycle, product, analyticsEvents: await distribution(env, "analytics_events", "event_type", eventWhere) }, 200, origin);
}

async function handleAdminFeedback(request, env, origin) {
  if (request.method !== "GET") throw httpError("method_not_allowed", 405);
  await requireAdmin(request, env);
  const { results } = await env.DB.prepare("SELECT submitted_date AS date, feedback_type AS feedbackType, satisfaction, text FROM product_feedback WHERE text IS NOT NULL AND text != '' ORDER BY submitted_date DESC, id DESC LIMIT 50").all();
  return json({ items: results || [] }, 200, origin);
}

function safeDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : today();
}

function randomToken() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function limitAdminLogin(env) {
  const since = Date.now() - 15 * 60 * 1000;
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_login_attempts WHERE attempted_at >= ? AND success = 0").bind(since).first();
  if ((row?.count || 0) >= 10) throw httpError("rate_limited", 429);
}

async function recordAdminAttempt(env, success) {
  await env.DB.prepare("INSERT INTO admin_login_attempts (bucket, attempted_at, success) VALUES ('global', ?, ?)").bind(Date.now(), success ? 1 : 0).run();
}

async function overviewStats(env) {
  const p = await env.DB.prepare("SELECT COUNT(*) AS participants, SUM(consent_analytics) AS analyticsConsent, SUM(consent_training_feedback) AS trainingConsent, SUM(consent_cycle_aggregate) AS cycleConsent FROM participants WHERE consent_analytics = 1 OR consent_training_feedback = 1 OR consent_cycle_aggregate = 1").first();
  const active7 = await env.DB.prepare("SELECT COUNT(*) AS count FROM participants WHERE last_seen_date >= date('now','-6 day')").first();
  const active30 = await env.DB.prepare("SELECT COUNT(*) AS count FROM participants WHERE last_seen_date >= date('now','-29 day')").first();
  const tf = await env.DB.prepare("SELECT COUNT(*) AS count FROM training_feedback").first();
  const pf = await env.DB.prepare("SELECT COUNT(*) AS count FROM product_feedback").first();
  return {
    participants: p?.participants || 0,
    active7: active7?.count || 0,
    active30: active30?.count || 0,
    analyticsConsent: p?.analyticsConsent || 0,
    trainingConsent: p?.trainingConsent || 0,
    cycleConsent: p?.cycleConsent || 0,
    trainingFeedback: tf?.count || 0,
    productFeedback: pf?.count || 0
  };
}

function rangeWhere(column, range) {
  if (range === "7d") return `${column} >= date('now','-6 day')`;
  if (range === "30d") return `${column} >= date('now','-29 day')`;
  return "1 = 1";
}

async function distribution(env, table, column, where) {
  const { results } = await env.DB.prepare(`SELECT ${column} AS label, COUNT(*) AS count FROM ${table} WHERE ${where} GROUP BY ${column} ORDER BY count DESC`).all();
  return (results || []).filter(x => x.label !== null).map(x => ({ label: String(x.label), count: x.count }));
}

async function groupedDistribution(env, groupColumn, valueColumn, where) {
  const { results } = await env.DB.prepare(`SELECT ${groupColumn} AS phase, ${valueColumn} AS value, COUNT(*) AS count FROM training_feedback WHERE ${where} AND ${groupColumn} IS NOT NULL GROUP BY ${groupColumn}, ${valueColumn} ORDER BY ${groupColumn}, count DESC`).all();
  return (results || []).map(x => ({ label: `${x.phase} · ${x.value}`, count: x.count }));
}

async function cleanup(env) {
  const cutoff = new Date(Date.now() - 90 * DAY_MS).toISOString().slice(0, 10);
  const oldAttempts = Date.now() - DAY_MS;
  await Promise.all([
    env.DB.prepare("DELETE FROM consent_snapshots WHERE created_date < ?").bind(cutoff).run(),
    env.DB.prepare("DELETE FROM analytics_events WHERE event_date < ?").bind(cutoff).run(),
    env.DB.prepare("DELETE FROM training_feedback WHERE submitted_date < ?").bind(cutoff).run(),
    env.DB.prepare("DELETE FROM product_feedback WHERE submitted_date < ?").bind(cutoff).run(),
    env.DB.prepare("DELETE FROM admin_login_attempts WHERE attempted_at < ?").bind(oldAttempts).run(),
    env.DB.prepare("DELETE FROM public_rate_limits WHERE created_at < ?").bind(Date.now() - 60 * 60 * 1000).run(),
    env.DB.prepare("DELETE FROM admin_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL").bind(Date.now()).run()
  ]);
}
