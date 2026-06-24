# Handoff

## 2026-06-24

### 已完成

- 前台新增 `runtime-config.js`，默认 `API_BASE` 为空，未配置 Worker 时不发上传请求。
- 隐私页升级为“隐私与测试数据”设置中心：
  - 匿名使用体验数据
  - 匿名训练反馈
  - 周期阶段汇总
  - 删除已上传测试数据
  - 清除本机数据
- 新增独立“提交体验反馈”页面；文字反馈每条单独授权才上传。
- 前端移除硬编码后台密码，忽略并清理旧 `nvxun_adminAuth`。
- 后台入口仍为 `#/admin`，改为 Worker 登录 + `sessionStorage` token。
- 新增 Cloudflare Worker + D1 后端：
  - public APIs: consent/event/training-feedback/product-feedback/delete-my-data
  - admin APIs: login/logout/summary/feedback
  - D1 schema、wrangler 配置、部署文档
- Worker 不保存原始 participantId，使用 secret HMAC 后写入 D1。
- 后台只展示匿名汇总和单条授权文字反馈，不展示本地原始数据。

### 已验证

- API 未配置时，默认无授权不发任何 fetch。
- 隐私页默认三个授权开关均为 false。
- API 未配置时，后台显示“后台服务尚未配置”，不会展示本地数据。
- 旧 `nvxun_adminAuth` 存在时仍不能进入后台，并会被清除。
- 开启匿名使用体验数据后，可上传 consent 与允许事件。
- 未单独勾选文字授权时，体验反馈不上传文字。
- 单条勾选文字授权后，只上传该条文字反馈。
- 开启匿名训练反馈后，保存训练反馈上传结构化选项。
- 未开启周期汇总授权时，训练反馈 payload 不包含 `cyclePhase` 字段。
- 删除云端测试数据只发送当前匿名 `participantId`。
- 错误后台密码不能进入，正确 Worker mock token 可进入后台汇总页。
- 浏览器控制台正常验证路径无 error。
- `app.js` 与 `backend/worker.js` 通过 `node --check`。
- 公开文件中搜索不到后台演示密码。

### 待部署

- 创建 Cloudflare D1。
- 执行 `backend/schema.sql`。
- 设置 Worker secrets：`ADMIN_DEMO_PASSWORD`、`ADMIN_SESSION_SECRET`。
- 更新 `backend/wrangler.toml` 的 D1 `database_id`。
- 部署 Worker。
- 将 `runtime-config.js` 的 `API_BASE` 改为 Worker 地址。

### 0.3 增量完成

- GitHub Pages 在未配置 API_BASE 时明确显示本机演示模式，不发同步请求，也不把未配置后端表现为错误。
- 新增 nvxun_cycleProfile 和单独的周期档案页面；适用用户必须完成档案后才能进入今日打卡。
- 周期页和推荐结果都会展示基于填写信息的预计阶段、可信度、训练提示与非医疗化说明。
- 推荐逻辑同时使用周期阶段、用户主观感受、今日状态、训练水平和目标，并保持原有训练库和记录流程。
- Worker 增加周期档案/产品反馈事件，以及 premenstrual 和 unknown 阶段枚举。
