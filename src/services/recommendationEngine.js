/*
 * 女训 · 推荐引擎 (recommendationEngine)
 * --------------------------------------------------------------------------
 * 纯函数引擎：输入用户上下文 → 输出面向 UI 的循证增强推荐。
 *   - 不直接读 DOM 或 localStorage，便于 Node 单元测试。
 *   - 既有的 calculateRecommendation（打分/dayType/周期推算）保持不变；本引擎在其
 *     之上叠加：强度上限、今日重点、可解释依据、安全提示、生活方式与更年期建议。
 *   - 推荐优先级严格按规则 priority：安全/疼痛 > 疲劳/恢复 > 目标/时间 > 经验 >
 *     周期/更年期 > 偏好/历史。也就是说，"今天是卵泡期"不会覆盖"几乎没睡 + 明显疼痛"。
 */
(function (root, factory) {
  var Knowledge = (typeof require === 'function') ? require('../data/knowledgeClaims.js') : (root && root.NvxunKnowledge);
  var Rules = (typeof require === 'function') ? require('../data/recommendationRules.js') : (root && root.NvxunRules);
  var api = factory(Knowledge, Rules);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.NvxunEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Knowledge, Rules) {
  'use strict';

  var INTENSITY_LABEL = ['恢复 / 低冲击', '轻量', '标准', '进阶'];
  var BEGINNER_LEVELS = ['几乎没接触过健身', '健身初期，偶尔练'];
  var REGULAR_LEVELS = ['每周规律运动 3 次及以上', '有稳定力量训练经验'];
  var PERI_MENO_STAGES = ['正在经历或接近围绝经期', '已经绝经'];

  /**
   * 把原始打卡/画像归一化成规则可直接判断的上下文。
   * @param {import('../types/healthRecommendation.js').UserContext} ctx
   * @returns {import('../types/healthRecommendation.js').NormalizedContext}
   */
  function normalize(ctx) {
    ctx = ctx || {};
    var profile = ctx.profile || {};
    var c = ctx.checkin || {};
    var phaseKey = (ctx.cycleEstimate && ctx.cycleEstimate.phaseKey) || 'unknown';
    var level = profile.trainingLevel || '';
    var sleep = c.sleep || '';
    var energy = c.energy || '';
    var soreness = c.soreness || '';
    var highFatigue = (sleep === '差') || (energy === '低') || (soreness === '明显');
    return {
      sleep: sleep,
      energy: energy,
      pain: c.pain || '无',
      soreness: soreness,
      stressMood: c.stressMood || '',
      trainingIntent: c.trainingIntent || '',
      cycleStatus: c.cycleStatus || '',
      availableTime: c.availableTime || '',
      phaseKey: phaseKey,
      goals: Array.isArray(profile.goals) ? profile.goals : [],
      trainingLevel: level,
      bodyStage: profile.bodyStage || '',
      isBeginner: BEGINNER_LEVELS.indexOf(level) >= 0,
      isRegular: REGULAR_LEVELS.indexOf(level) >= 0,
      highFatigue: highFatigue,
      hasPain: (c.pain && c.pain !== '无'),
      isPerimenoOrMeno: PERI_MENO_STAGES.indexOf(profile.bodyStage) >= 0,
      feedback: ctx.feedback || {}
    };
  }

  /** dayType → 强度上限的基线（与既有打分引擎对齐）。 */
  function baseIntensityFromDayType(dayType) {
    if (dayType === '恢复日') return Rules.INTENSITY.RECOVERY;
    if (dayType === '降载日') return Rules.INTENSITY.LIGHT;
    if (dayType === '冲刺日') return Rules.INTENSITY.ADVANCED;
    return Rules.INTENSITY.STANDARD; // 常规日
  }

  /**
   * 主入口：评估上下文并返回增强推荐。
   * @param {import('../types/healthRecommendation.js').UserContext} ctx
   * @returns {import('../types/healthRecommendation.js').EnrichedRecommendation}
   */
  function evaluate(ctx) {
    var n = normalize(ctx);
    var dayType = (ctx && ctx.dayType) || '常规日';

    var intensity = baseIntensityFromDayType(dayType);
    var duration = null;
    var focus = null;
    var primaryReasons = [];
    var safetyFlags = [];
    var lifestyleTips = { hydration: [], nutrition: [], recovery: [] };
    var menopause = { active: n.isPerimenoOrMeno, tips: [] };
    var appliedRuleIds = [];
    var evidenceNotes = [];
    var seenEvidence = {};

    // 规则按优先级稳定排序后依次应用。
    var ordered = Rules.RULES.slice().sort(function (a, b) { return a.priority - b.priority; });

    ordered.forEach(function (rule) {
      var hit = false;
      try { hit = rule.when(n); } catch (e) { hit = false; }
      if (!hit) return;
      appliedRuleIds.push(rule.id);
      var eff = rule.effect || {};

      if (typeof eff.intensityCap === 'number') intensity = Math.min(intensity, eff.intensityCap);
      if (typeof eff.durationCapMin === 'number') duration = (duration == null) ? eff.durationCapMin : Math.min(duration, eff.durationCapMin);
      if (eff.focus && !focus) focus = eff.focus; // 高优先级先占位

      if (eff.tip && eff.tipBucket) {
        if (eff.tipBucket === 'menopause') menopause.tips.push(eff.tip);
        else if (lifestyleTips[eff.tipBucket]) lifestyleTips[eff.tipBucket].push(eff.tip);
        else lifestyleTips.recovery.push(eff.tip);
      }
      if (eff.safetyFlag && eff.safetyText) safetyFlags.push(eff.safetyText);

      if (rule.userFacingReason) primaryReasons.push(rule.userFacingReason);

      if (rule.claimId && Knowledge) {
        var claim = Knowledge.getClaim(rule.claimId);
        if (claim && !seenEvidence[claim.id]) {
          seenEvidence[claim.id] = true;
          evidenceNotes.push({ text: claim.userFacingReason, source: claim.source, evidenceLevel: claim.evidenceLevel });
        }
      }
    });

    // 兜底：周期信息不足或未记录时，也保证完整、不降级的建议。
    if (!focus) focus = '稳定完成、动作质量优先';
    if (duration == null) duration = intensity <= Rules.INTENSITY.LIGHT ? 20 : 30;

    // 安全/疼痛红旗提示始终带上。
    if (n.pain === '明显' && Knowledge) {
      var red = Knowledge.getClaim('pain.seek_help_red_flags');
      if (red) safetyFlags.push(red.userFacingReason);
    }

    // 只保留 2–4 条最重要的"为什么"。
    primaryReasons = dedupe(primaryReasons).slice(0, 4);

    var disclaimers = buildDisclaimers(n);

    return {
      intensityLevel: intensity,
      intensityLabel: INTENSITY_LABEL[intensity] || '标准',
      focus: focus,
      durationTargetMin: duration,
      primaryReasons: primaryReasons,
      evidenceNotes: evidenceNotes,
      safetyFlags: dedupe(safetyFlags),
      lifestyleTips: {
        hydration: dedupe(lifestyleTips.hydration),
        nutrition: dedupe(lifestyleTips.nutrition),
        recovery: dedupe(lifestyleTips.recovery)
      },
      menopause: { active: menopause.active, tips: dedupe(menopause.tips) },
      appliedRuleIds: appliedRuleIds,
      disclaimers: disclaimers
    };
  }

  function buildDisclaimers(n) {
    var d = Knowledge ? Knowledge.DISCLAIMERS : null;
    if (!d) return [];
    var out = [d.notDiagnosis];
    if (n.phaseKey && n.phaseKey !== 'unknown' && n.phaseKey !== 'not_applicable') out.push(d.cycleVaries);
    if (n.isPerimenoOrMeno) out.push(d.lifestyleNotMedical);
    if (n.pain === '明显') out.push(d.seekHelp);
    return dedupe(out);
  }

  function dedupe(arr) {
    var seen = {}, out = [];
    (arr || []).forEach(function (x) { if (x && !seen[x]) { seen[x] = true; out.push(x); } });
    return out;
  }

  return {
    evaluate: evaluate,
    normalize: normalize,
    INTENSITY_LABEL: INTENSITY_LABEL,
    baseIntensityFromDayType: baseIntensityFromDayType
  };
});
