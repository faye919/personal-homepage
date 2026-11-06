# 数字分身后端部署说明（腾讯云函数 SCF）

本目录 `serverless/index.js` 是数字分身的后端，作用：
- 保存 DeepSeek API Key（不暴露给浏览器）；
- 把访客问题转发给 DeepSeek；
- 以"李雨霏数字分身"的身份回答（内置 PERSONA 真实资料 + 说话规则）。

前端通过 HTTPS 调用本函数。部署成功后，把函数访问地址填入
`personal-homepage-v1/script.js` 顶部的 `CHAT_API_URL`。

---

## 前提

- 已注册 DeepSeek 开放平台并创建 API Key（https://platform.deepseek.com/）。
- 已注册腾讯云账号并完成实名认证。

---

## 部署步骤（约 15 分钟）

### 1. 开通云函数

1. 打开腾讯云控制台：https://console.cloud.tencent.com/scf
2. 首次使用按提示开通"云函数"服务。

### 2. 创建函数

1. 点击 **新建函数**。
2. 创建方式选择 **从头开始**，函数类型选择 **事件函数**。
3. 函数名称：`personal-homepage-chat`
4. 地域选择离你近的国内地域（如广州）。
5. 运行环境选择 **Node.js 16.13 或更高版本**（本项目部署时使用 Node.js 24.11）。
6. 执行方法填：`index.main_handler`
7. 点击 **完成** 进入函数详情。

### 3. 上传代码

1. 在函数详情页选择 **函数代码** 标签。
2. 删除默认文件，把本目录的 `index.js` 内容粘贴为 `index.mjs`（ESM 格式，线上文件名以实际部署为准；本仓库本地副本为 `index.js`，内容相同）。
3. 点击 **部署**。

### 4. 配置环境变量（保存 API Key）

1. 在 **函数配置** 标签页 → 找到 **环境变量**。
2. 添加：
   - 键：`DEEPSEEK_API_KEY`
   - 值：你在 DeepSeek 平台创建的 API Key（以 `sk-` 开头）
3. 点击 **保存**。

### 5. 开启函数 URL（让前端能访问）

> 注意：旧版教程里的"API 网关触发器"已于 2025-06-30 停服，请改用**函数 URL**。

1. 在 **触发管理** 标签页 → 点击 **创建触发器**。
2. 触发方式选择 **函数 URL**。
3. 鉴权方式：**无需鉴权**（前端匿名访问；无固定公网 IP 用户建议勾选"安全防护"按需）。
4. 创建完成后，复制 **访问地址**，格式例如：
   `https://1526747307-xxxxx.ap-guangzhou.tencentscf.com`

### 6. 填入前端

打开 `personal-homepage-v1/script.js`，把 `CHAT_API_URL` 的值改成上面的访问地址：

```js
const CHAT_API_URL = 'https://1526747307-xxxxx.ap-guangzhou.tencentscf.com';
```

然后把 `index.html`、`styles.css`、`script.js` 同步上传到 GitHub 仓库，等待 GitHub Pages 自动重新发布。

---

## 当前部署信息（期末报告可引用）

| 项目 | 值 |
|---|---|
| 函数名称 | `personal-homepage-chat` |
| 地域 | 广州（ap-guangzhou） |
| 运行时 | Node.js 24.11（ESM） |
| 访问方式 | 函数 URL（免鉴权） |
| 函数 URL | `https://1526747307-2ny6simneh.ap-guangzhou.tencentscf.com` |
| 模型 | `deepseek-chat`（https://api.deepseek.com/chat/completions） |
| 参数 | temperature 0.8，max_tokens 300，超时 20s |

---

## 测试方法

部署后先直接测试后端（在浏览器地址栏访问无效，必须用 POST 工具或直接在前端页面测试）：

1. 打开发布后的主页：`https://faye919.github.io/personal-homepage/`
2. 进入数字分身聊天区提问，例如"你是哪里人？"
3. 观察回答是否为 AI 生成（不再提示"不在本地资料库"）。

命令行快速测试（Windows PowerShell 下用 curl.exe，不要用 Invoke-RestMethod）：

```powershell
curl.exe -X POST https://1526747307-2ny6simneh.ap-guangzhou.tencentscf.com -H "Content-Type: application/json" -d "{\"message\":\"你是谁？\"}"
```

### 常见问题

| 现象 | 原因 | 处理 |
|---|---|---|
| 前端提示"分身暂时联系不上" | 函数 URL 未开启 / 未部署 / CORS 未生效 | 检查 `CHAT_API_URL` 和函数是否已部署 |
| 函数日志报 `DEEPSEEK_API_KEY 未配置` | 环境变量没加 | 在函数配置里补环境变量 |
| 回答很慢或超时 | DeepSeek 首次请求或额度不足 | 检查账户余额；重试一次 |
| 提示余额不足 | Key 没充值 | 到 DeepSeek 开放平台充值 |
| curl 报 443 或网络错误 | PowerShell 的 Invoke-RestMethod 兼容问题 | 改用 `curl.exe` 测试 |

---

## 安全说明

- API Key 只存在于腾讯云环境变量中，前端代码里没有 Key。
- 函数仅做消息转发，不存储任何聊天记录。
- 若担心恶意调用，可在函数里加简单的次数限制或固定 Token 校验（可另行说明）。
