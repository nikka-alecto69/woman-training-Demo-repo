# 女训 / Woman Training Demo

纯前端、移动端优先的女性今日训练决策助手。前台默认只在本机保存数据，可选接入 Cloudflare Worker + D1 做小范围匿名测试汇总。

## 当前能力

- 今日状态打卡与训练推荐
- 周期日历、周期阶段推算与四阶段图交互
- 训练库、动作详情、视频资源入口
- 本地训练反馈、力量记录与身体数据记录
- 隐私与测试数据设置中心
- Cloudflare Worker + D1 匿名测试后台

## 隐私原则

- 默认不开启任何数据上传。
- 用户必须在「隐私」页主动开启匿名测试同步。
- 关闭授权后，后续不再上传；删除已上传数据需要点击「删除已上传的测试数据」。
- 不收集姓名、手机号、邮箱、精确位置或身份信息。
- 不上传原始经期日期、经期区间、体重、围度、力量训练重量/组数/次数。
- 自由文本反馈必须每条单独授权才会上传。
- 不接广告 SDK、第三方埋点 SDK 或 AI API。

## 运行方式

直接打开 `index.html` 即可使用本地功能。也可以发布到 GitHub Pages。

如需启用匿名测试同步：

1. 部署 `backend/` 中的 Cloudflare Worker。
2. 创建并迁移 Cloudflare D1 数据库。
3. 设置 Worker secrets。
4. 将 `runtime-config.js` 中的 `API_BASE` 改为 Worker 地址。

详细步骤见 [backend/DEPLOY.md](backend/DEPLOY.md)。

## 后台入口

后台入口保持为：

```text
https://nikka-alecto69.github.io/woman-training-Demo-repo/#/admin
```

后台不再读取本机 `localStorage` 演示数据。访问后台必须通过 Worker 校验，登录 token 只保存在 `sessionStorage`，过期或登出后失效。

如果 `runtime-config.js` 未配置 Worker 地址，后台会显示“后台服务尚未配置”，不会展示本机原始数据。
