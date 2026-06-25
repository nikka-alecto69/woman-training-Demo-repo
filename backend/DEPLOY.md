# 女训匿名测试后台部署

后端使用 Cloudflare Worker + Cloudflare D1。仓库中不提交真实密码、session secret 或 D1 凭据。

## 1. 创建 D1 数据库

```bash
cd backend
wrangler d1 create nvxun_research
```

把输出中的 `database_id` 填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "nvxun_research"
database_id = "妳的 D1 database_id"
```

## 2. 执行数据库 schema

```bash
wrangler d1 execute nvxun_research --file=./schema.sql
```

本地开发可使用：

```bash
wrangler d1 execute nvxun_research --local --file=./schema.sql
```

## 3. 设置 Worker secrets

请使用 Wrangler 交互输入，不要把真实值写入任何仓库文件。

```bash
wrangler secret put ADMIN_DEMO_PASSWORD
wrangler secret put ADMIN_SESSION_SECRET
```

- `ADMIN_DEMO_PASSWORD`：由项目负责人提供的演示后台密码，部署者手动输入。
- `ADMIN_SESSION_SECRET`：至少 32 字符的随机字符串，用于管理员 token 和匿名参与者 hash。

`.dev.vars.example` 只提供字段名示例。复制为 `.dev.vars` 仅用于本地开发，`.dev.vars` 不应提交到 Git。

## 4. 本地启动 Worker

```bash
cp .dev.vars.example .dev.vars
wrangler dev
```

本地调试时把前台 `runtime-config.js` 配置为 Wrangler 输出的本地地址，例如：

```js
window.NVXUN_CONFIG = {
  API_BASE: "http://127.0.0.1:8787"
};
```

## 5. 部署 Worker

```bash
wrangler deploy
```

部署后访问：

```text
https://妳的-worker.workers.dev/v1/health
```

应返回：

```json
{"ok":true}
```

## 6. 配置 GitHub Pages 前台

把 `runtime-config.js` 中的 `API_BASE` 改成 Worker 地址：

```js
window.NVXUN_CONFIG = {
  API_BASE: "https://妳的-worker.workers.dev"
};
```

`runtime-config.js` 只能放公开 Worker 地址，不能放密码、密钥或数据库凭据。

## 7. 部署后 curl 验证（必须全部通过）

部署完成后依次执行（将 `$API_BASE` 替换为妳的 Worker 域名，例如 `https://nvxun-research-api.xxx.workers.dev`）：

```bash
# 1. Health check（无需 origin，应返回 200 + JSON）
curl -si "$API_BASE/v1/health"

# 2. CORS 预检（应返回 204 + Access-Control-Allow-Origin 头）
curl -si -X OPTIONS "$API_BASE/v1/consent" \
  -H "Origin: https://nikka-alecto69.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"

# 3. 最小合法 consent payload（应返回 200 {"ok":true}）
curl -si -X POST "$API_BASE/v1/consent" \
  -H "Origin: https://nikka-alecto69.github.io" \
  -H "Content-Type: application/json" \
  -d '{"participantId":"test-local-only-xxxxxxxx","consentVersion":"1","anonymousAnalytics":true,"anonymousTrainingFeedback":false,"cycleAggregate":false,"updatedDate":"2026-06-24"}'

# 4. 最小合法 event payload（应返回 200 {"ok":true}）
curl -si -X POST "$API_BASE/v1/event" \
  -H "Origin: https://nikka-alecto69.github.io" \
  -H "Content-Type: application/json" \
  -d '{"participantId":"test-local-only-xxxxxxxx","consentVersion":"1","eventType":"app_opened","eventDate":"2026-06-24"}'
```

全部返回期望结果后，再进行前台联通验证。

## 7b. 验证前后台联通

1. 打开 GitHub Pages 前台。
2. 进入「隐私」页，确认显示“匿名测试同步已启用”。
3. 默认不开启任何开关时，完成打卡和训练反馈不应上传。
4. 开启「匿名使用体验数据」并保存，刷新后生成一次允许事件。
5. 开启「匿名训练反馈」后保存训练反馈，后台「推荐与训练反馈」应看到汇总变化。
6. 未开启「周期阶段汇总」时，训练反馈 payload 不应包含 `cyclePhase`。
7. 进入 `#/admin`，未登录时应显示登录页。
8. 使用错误密码不能进入后台。
9. 使用 Worker secret 中配置的后台密码登录后，应看到“匿名测试数据概览”。
10. 登出后再次访问 `#/admin`，必须重新登录。

## 数据保留与清理

Worker 配置了 Scheduled Trigger：

```toml
[triggers]
crons = ["17 3 * * *"]
```

它会清理 90 天以前的匿名测试数据、过期管理员 session、旧登录尝试和限流记录。每次普通请求结束时也会触发一次最佳努力清理。

## 安全边界

- Public API 只允许 GitHub Pages origin 与本地开发 origin。
- 所有写入接口校验 Content-Type、payload 大小、字段类型和枚举值。
- 单次 payload 限制为 10KB。
- Worker 不保存 IP 地址、浏览器 UA、设备 ID 或原始 participantId。
- 管理后台只展示汇总指标和单条明确授权的文字反馈，不展示个人级原始记录。

## 8. 0.3 数据边界

前端 runtime-config.js 的 API_BASE 留空时，是完整可用的 GitHub Pages 本机演示模式：不要把它当作错误，也不要为测试用户要求安装任何东西。

Worker 的匿名事件枚举包含 cycle_profile_completed 和 product_feedback_opened。训练反馈可选的 cyclePhase 仅接受：

menstrual | follicular | ovulation | luteal | premenstrual | unknown

不要扩展 payload 来传输 lastPeriodStartDate、periodStartDates、averageCycleLength、averagePeriodLength、cycleDay、daysToNextPeriod、体重、围度、力量训练重量/组数/次数、RPE 或备注。文字反馈也必须逐条取得单独授权。
