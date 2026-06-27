// 女训 运行时配置
// 本文件是公开配置文件，不得写入任何密钥、密码或 D1 凭据。
//
// API_BASE 格式要求：
//   - 必须是 Worker 的完整 HTTPS 域名，例如：https://nvxun-research-api.你的子域.workers.dev
//   - 不包含路径、#、斜杠结尾、YOUR-WORKER 等占位符
//   - 留空时前台以本机演示模式运行，数据只保存在浏览器，不会上传
//
// 部署步骤见 backend/DEPLOY.md

window.NVXUN_CONFIG = {
  API_BASE: ""
};
