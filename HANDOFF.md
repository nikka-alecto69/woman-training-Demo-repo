# Handoff

## 2026-06-25 — v0.6 UI / 信息架构 + 进阶力量日志

代码以 `/* NVXUN_V06 */` 块追加在 app.js 末尾（沿用「后定义覆盖」：`library` / `videoCard` / `videoLibrary` / `trainingRecords` 在此块重新定义，最终生效），其余为就地修改最终生效函数（`result`、`video-recommend` 处理、`render` 映射、`VIDEO_PLATFORMS`）。样式追加在 styles.css 末尾的 `NVXUN V06` 段。

### 本轮主要功能

- **全局文案「他」→「她」**：全文检查后确认项目内不存在独立代词「他」，只有「其她」(=other) 不应改动；新增文案统一使用「她 / 姐妹 / 用户」。
- **视频来源 YouTube → 抖音**：`VIDEO_PLATFORMS` 选项改为抖音；全站无任何 youtube/YouTube 文案；示例视频数据本就是 B 站真实链接，未引入失效链接；用户提交仍只要求 http(s) 前缀，抖音短链 `https://v.douyin.com/...` 可正常保存。
- **首页（今日方案）删除「视频跟练建议」整块**：移除标题、卡片、`全部视频 →` 入口与相关 `videos.filter` 计算；今日方案页聚焦今日状态 / 周期 / 推荐训练 / 重新评估。底部「视频」页与训练详情页匹配视频均保留。
- **训练库分层**：一级分类「力量塑形 / 瑜伽·普拉提 / 放松修复」(chips)，二级筛选（力量：全部/全身/推/拉/蹲/臀腿/核心；瑜伽：核心稳定/活动度/柔韧拉伸/平衡控制；放松：经期舒缓/训练后恢复/睡前放松/轻柔拉伸）。映射基于结构化字段（`type` / `muscle_group` / `actionIds`）为主、标题关键词为辅。器械类型降为卡片标签。顶部文案改为中文。
- **训练卡紧凑网格**：`.workout-grid`（手机两列 / 宽屏三列 / ≤360px 单列，`minmax(0,1fr)` 防溢出），缩图约占卡片高度 ~35%，标题+两行截断描述+部位+最多 3 标签。今日方案页推荐训练同样改为紧凑网格。
- **视频专区重构**：顶部态度文案「由真实训练者共同筛选：动态排序、人工复核、拒绝身材焦虑。」+ 小字「妳的推荐会帮助好内容被更多姐妹看见…」。卡片信息精简为 标题 / 创作者·平台(小字) / 一句合并「适合…」/ 1–2 标签 / 操作；去掉重复的「适合：分类：」。推荐按钮 `👍 推荐这个视频`（亮色 `--positive`），同一浏览器同一视频只累计一次（`videoStore[id].recommendedByMe`），点击后变「✓ 已推荐」。负反馈统一为「内容不合适」（低饱和 `--caution`），仍走原有举报原因 / 待复核 / 隐藏 / 后台审核 / 降权逻辑。
- **进阶力量日志**（记录→训练记录→「进入进阶力量日志」）：多动作快速录入（动作名可从基础动作库 datalist 选择或自填、部位、重量、次数、组数、RPE、备注、增删行），自动计算单动作容量(重量×次数×组数)与总训练容量；缺失/非数字不报错；自重 0kg 可保存但不计入容量。含「近 28 天训练分布」分区热力图（无写实身体图）、原生 SVG「训练容量趋势」（支持 0/1/多条数据、含 aria-label）、与身体数据的可选「个人回顾」（仅并排展示、不做因果或身材评价）。

### 新增 localStorage 键

- `nvxun_strengthLogV1` — 进阶力量日志（动作、重量、次数、组数、RPE、单动作容量、总容量、备注）。

### 本地隐私边界

- `nvxun_strengthLogV1`、身体数据、体重、围度、力量重量/组数/次数、训练容量、热力图数据**仅保存在本机**，不进入任何 Worker / 后台 / 匿名汇总 / 第三方请求。
- `strength.log.saved` 事件不在 `EVENT_UPLOAD_MAP` 中，仅本地记录，不触发上传；jsdom 测试确认保存力量日志期间无任何 fetch 请求。
- 「清除本机全部数据」遍历 `Object.values(STORAGE_KEYS)`，已自动包含 `nvxun_strengthLogV1`（测试确认清除）。匿名授权范围未变。

### 修改的文件

- `app.js`（V06 块 + result/平台/recommend/render 就地修改）
- `styles.css`（V06 样式段 + `--positive` / `--caution` 语义色变量）
- `README.md`、`HANDOFF.md`

### 已执行的检查

- `node --check app.js` ✅ / `node --check backend/worker.js` ✅
- jsdom 全流程自动化 47 项断言全部通过：首页无视频块且用紧凑网格、无独立「他」、训练库三级分类与二级筛选、视频态度文案/按钮/一次性推荐/无重复「适合分类」、抖音选项无 YouTube、进阶力量日志录入与容量计算（1200、含自重 0 容量）、保存期间无 fetch、热力图/趋势 SVG 渲染、清除数据含新键、举报流程仍可达。

### 仍需人工测试

- 真机 375px / ≤360px 下训练卡与视频卡的两列→单列降级、热力图 `color-mix` 颜色深浅、SVG 趋势在不同数据量下的视觉效果。
- 抖音真实分享链接「打开视频」在移动端的跳转表现。
- 长期多次记录后热力图与趋势的可读性。

---

## 2026-06-25 — v0.5 今日方案固定常驻

代码以 `/* NVXUN_V05 */` 块追加在 app.js 末尾（沿用「后定义覆盖」模式新增工具函数），并**就地修改真正最终生效的函数**（`saveCheckin`、最终的 `result`、底部导航 `nav` 与点击处理），不再叠加重复的整段覆盖。

### 改动要点

- 底部导航「今日」升级为常驻「今日方案」。完成今日打卡生成训练建议后，去任何页面再点「今日方案」都回到当天**同一份**推荐，不重新计算、不重新随机。
- 新增本地存储键 `nvxun_todayPlanV1`（version/date/createdAt/checkin/score/dayType/copyKey/phase/cycleEstimate/subjectiveConflict/workoutIds）。只保存训练 id 等推荐结果，**不**保存体重/围度/力量重量组数等身体数据，隐私范围不变。
- `saveCheckin()`：生成建议时一次性选好动作并 `saveTodayPlan()` 持久化。
- 最终 `result()`：优先用 `state.last` →本机持久化方案→（旧数据兜底）`latest()`；兜底命中当天打卡时也会冻结成当天方案，之后保持稳定。
- `nav`/`start` 处理：当天已有方案时，「今日方案」与首页主 CTA 直接回到 result；当天无方案才进入打卡。跨天后 `loadTodayPlan()` 自动失效（date 不等于今天），回到正常打卡。
- result 页新增「重新评估今天的状态」按钮（`data-action="redo-checkin"`），用户可主动重做打卡覆盖当天方案；不会自动触发。
- `nvxun_todayPlanV1` 已纳入 STORAGE_KEYS，「清除本机全部数据」会一并清除。

### 验证（jsdom 全流程自动化）

- `node --check app.js` 通过。
- 28 项断言全部通过：生成后持久化、跳转返回同一份方案、整页刷新后经主 CTA 恢复同一份方案（workoutIds 完全一致）、底部导航标签与高亮、跨天/旧方案自动失效回到打卡、经期阶段引导路径仍正常并持久化、未授权不自动创建 consent。

### 本轮未做 / 待确认

- 原始任务说明在 `nvxun_todayPlanV1` 数据设计后被截断（标题含「记录体验升级」，疑似还有第二/三部分），本轮仅实现已完整给出的「一、今日方案固定常驻」。其余部分待用户补全说明。

---

## 2026-06-24 — v0.4 视频互动/审核 + 经期日历首填

代码以 `/* NVXUN_V04 */` 块追加在 app.js 末尾（沿用 v0.3 的「后定义覆盖」模式），不改动 v0.2/v0.3 既有结构。

### 视频模块（动态内容库 + 互动 + 审核）

- 视频从写死推荐改为动态库：官方预置 + 用户提交，计数/状态存 localStorage `nvxun_videoStore`。
- 视频卡片新增三个按钮：打开视频 / 推荐这个视频 / 这个视频让我不舒服 · 内容不合适。
- 排序：`recommend*5 + click*1 - uncomfortable*8 - report*10 + 官方加权3`，只展示 `status==='approved'` 且未隐藏的视频。
- 阈值：`uncomfortable>=2 || report>=2` → 显示「待复核」标签并降权；`uncomfortable>=3` → 前台隐藏，仅后台可见。
- 用户提交入口「推荐一个妳觉得好用的视频」→ 表单（链接/标题/创作者/平台/场景多选/相关动作/理由/确认勾选）→ `status='pending'`，不直接公开。
- 后台新增「视频审核」tab：待审核 / 被反馈 / 全部，可通过(approved)/隐藏(hidden)/拒绝(rejected)。本机演示模式（API_BASE 未配置）也可进入后台仅做视频审核，并提示「当前为本机演示模式」。
- 动作详情页只显示相关跟练视频（relatedActionId / 场景 / 标题匹配），无匹配显示「暂无对应跟练视频」，不硬塞无关视频。
- 视频库底部固定安全说明；上传/举报不上传用户身份信息；video.* 事件仅本地记录，不触发 Worker 上传（Worker 枚举未含，避免 400）。

### 经期首填改为日历滑选

- 保持 周期 → 今日状态 顺序不变。
- `cycleSetup()` 从手动数字表单改为日历轻点 / 按住滑选；去掉末次日期、平均周期、平均经期等手动录入。
- 解除周期/经期长度限制：季经/年经（周期>45 天或很不规律/不确定）→ 阶段判为「不确定」，改为依据今日状态推荐。
- 提供「暂时想不起来，先跳过」入口（写入 `{skipped:true}`，不阻断流程）。
- `hasCycleProfile()` 改为：已记录至少一天经期或已有档案/跳过即视为完成 → 记录一次后不再重复要求填写。

### 验证（jsdom 全流程自动化）

- 启动无报错；`node --check app.js` 通过。
- 视频：点击计数累加并持久化、推荐计数、举报递增并降权/隐藏、用户提交 pending 不公开、后台审核 approve 生效。
- 排序与阈值纯逻辑单测全部通过。
- 经期：进入今日打卡被引导到日历版 cycle-setup（无手动数字输入）；点选两天→done→生成档案→进入打卡；再次进入不重复提示；跳过路径正常。
- 季经(90 天)→ unknown；规律 28 天→ 正确阶段。

### 本轮未做（按要求）

未爬取平台、未自动公开用户视频、点击量非唯一排序、未上传身份信息、前台不暴露后台入口、争议视频不再高亮、未声称医学认证。

---

## 2026-06-24 — v0.2/v0.3 诊断与修复

### 根因（本次 toast 的真实原因）

**backend/worker.js 是二进制文件（已损坏/编译产物），不是有效的 Cloudflare Worker JS 源码。**

同时存在两个次要问题：
1. `CYCLE_PHASES` 枚举缺少 v0.3 新增的 `premenstrual` 和 `unknown`，导致这两个阶段被 Worker 静默丢弃
2. `EVENT_TYPES` 枚举缺少 `cycle_profile_completed` 和 `product_feedback_opened`，导致 Worker 拒绝这两类事件（返回 400）
3. GitHub Pages 线上地址仍运行旧代码，旧版 `syncTip()` 弹出模糊的"匿名同步暂未完成，已保存在本机"

### 本次修复（代码层面已完成）

#### backend/worker.js — 完全重写
- 从 `女训app开发2/backend/worker.js` 的良好源码迁移，并加入所有 v0.3 变更
- `CYCLE_PHASES` 新增 `premenstrual` 和 `unknown`
- `EVENT_TYPES` 新增 `cycle_profile_completed` 和 `product_feedback_opened`
- `handleAdminLogin` 登录失败改为返回 401（原来返回 200 但带 error 字段）
- CORS 严格匹配 `https://nikka-alecto69.github.io`，本地 localhost 开发也放行
- health endpoint `GET /v1/health` 不需要 origin，可直接 curl 验证
- 通过 `node --check` 语法检查

#### runtime-config.js
- 注释更清晰，明确说明留空 = 本机演示模式，不是错误
- 不含任何占位 Worker 域名（不触发 "YOUR-WORKER" 检测逻辑）

#### backend/DEPLOY.md
- 新增第 7 节"部署后 curl 验证"，提供可直接运行的四条命令：
  health / CORS 预检 / consent / event

### 代码验证结果

| 检查项 | 结果 |
|--------|------|
| `node --check backend/worker.js` | ✅ 通过 |
| `node --check app.js` | ✅ 通过 |
| 公开文件搜索 `nvxun2026` | ✅ 未发现 |
| 公开文件搜索硬编码密码 | ✅ 未发现 |
| CYCLE_PHASES 含 premenstrual/unknown | ✅ 已加入 |
| EVENT_TYPES 含 v0.3 新事件 | ✅ 已加入 |

### 仍需手动完成（等待部署）

以下步骤无法在本地环境自动执行（需要 Cloudflare 账户登录权限）：

```bash
# 0. 安装 wrangler（如未安装）
npm install -g wrangler
wrangler login

# 1. 创建 D1 数据库
cd /path/to/nvxun-mvp-v0.2/backend
wrangler d1 create nvxun_research
# → 把输出的 database_id 填入 wrangler.toml 第 7 行

# 2. 执行 schema
wrangler d1 execute nvxun_research --file=./schema.sql --remote

# 3. 设置 secrets（交互式输入，不写入任何文件）
wrangler secret put ADMIN_DEMO_PASSWORD
wrangler secret put ADMIN_SESSION_SECRET

# 4. 部署 Worker
wrangler deploy
# → 记录输出的 Worker URL：https://nvxun-research-api.xxx.workers.dev

# 5. 验证 Worker（URL 替换为上面的输出）
curl -si "https://nvxun-research-api.xxx.workers.dev/v1/health"
curl -si -X OPTIONS "https://nvxun-research-api.xxx.workers.dev/v1/consent" \
  -H "Origin: https://nikka-alecto69.github.io" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"

# 6. 填入 Worker URL 到前台
# 编辑 runtime-config.js：
# window.NVXUN_CONFIG = { API_BASE: "https://nvxun-research-api.xxx.workers.dev" };

# 7. 推送前台到 GitHub Pages
# git add . && git commit -m "deploy: v0.3 with worker backend" && git push
```

### 预期验证通过后的状态

- `GET /v1/health` → 200 `{"ok":true,"service":"nvxun-anonymous-data","timestamp":"..."}`
- CORS 预检 → 204 + `Access-Control-Allow-Origin: https://nikka-alecto69.github.io`
- 隐私页显示"本机演示模式"（API_BASE 空时）或"匿名测试同步已启用"（配置后）
- 保存授权设置：本机立即保存，如已配置 API 则静默后台同步
- 同步成功：控制台无错误
- 同步失败：控制台打印 `[nvxun sync failed]` + HTTP 状态码，不弹误导性 toast

---

## 2026-06-24 — v0.2/v0.3 首次集成（前次 session）

### 已完成（前次）

- 前台新增 `runtime-config.js`，默认 `API_BASE` 为空，未配置 Worker 时不发上传请求。
- 隐私页升级为"隐私与测试数据"设置中心
- 新增独立"提交体验反馈"页面；文字反馈每条单独授权才上传
- 前端移除硬编码后台密码，忽略并清理旧 `nvxun_adminAuth`
- 后台入口仍为 `#/admin`，改为 Worker 登录 + `sessionStorage` token
- Worker + D1 后端架构定稿

### 待部署（前次遗留，已被本次修复替代）

见上方"仍需手动完成"。
