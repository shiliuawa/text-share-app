# Text Share App

Text Share App 是一个简单而强大的在线文本分享工具，允许用户快速分享文本内容，并提供高级选项如定时删除和阅后即焚。此外，它还包含一个管理员面板，用于管理所有分享的内容。

## 功能特性

-   **快速文本分享**: 轻松粘贴或输入文本，生成可分享的链接。
-   **文件上传**: 支持上传文本文件并自动识别文件后缀名。
-   **自定义删除时间**: 用户可以设置分享内容的自动删除时间，范围从 1 小时到 3 个月。
-   **阅后即焚**: 可选功能，分享内容在被查看一次后自动销毁。
-   **密码保护**: 为分享链接设置密码，增加内容安全性。
-   **动态背景图**: 每次加载页面时从 API 获取随机背景图片，提供视觉上的新鲜感。
-   **默认暗黑模式**: 应用默认以暗黑模式显示，提供更舒适的视觉体验。
-   **过期时间显示**: 在分享页面显示内容的过期时间，方便用户了解内容何时失效。
-   **多语言支持**: 支持中文和英文界面。
-   **管理员面板**: 
    -   通过管理员密码登录。
    -   查看所有分享内容的列表，包括 ID、是否密码保护、创建时间、过期时间、是否阅后即焚等元数据。
    -   删除任何分享内容。
    -   查看和修改任何分享内容的文本、密码和阅后即焚状态。

### 数据兼容性

管理员面板现在能够兼容处理 Cloudflare KV 中存储的旧的非 JSON 格式数据。对于这些旧数据，系统会尝试将其内容作为纯文本显示，并提供默认的元数据（例如，不设密码保护，不阅后即焚）。您可以编辑这些条目，编辑后它们将以新的 JSON 格式存储。

## 技术栈

-   **前端**: HTML, CSS, JavaScript
-   **后端**: Cloudflare Workers (JavaScript)
-   **数据存储**: Cloudflare KV
-   **部署**: Cloudflare Pages

## 设置与部署

### 前提条件

-   Node.js (推荐 LTS 版本)
-   npm 或 Yarn
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/) (Cloudflare Workers 和 Pages 的 CLI 工具)
-   一个 Cloudflare 账户

### 步骤

1.  **克隆仓库**: 
    ```bash
    git clone https://github.com/shiliuawa/text-share-app.git
    cd text-share-app
    ```

2.  **安装依赖**: 
    ```bash
    npm install
    # 或者
    yarn install
    ```

3.  **配置 Cloudflare KV 命名空间**: 
    在 Cloudflare 控制台中创建一个 KV 命名空间，并获取其 ID。然后更新 `wrangler.toml` 文件中的 `kv_namespaces` 部分：
    ```toml
    # wrangler.toml
    kv_namespaces = [
      { binding = "CLIPBOARD_KV", id = "YOUR_KV_NAMESPACE_ID_HERE" }
    ]
    ```

4.  **设置管理员密码**: 
    出于安全考虑，管理员密码哈希应作为环境变量在 Cloudflare Pages 仪表板中设置，而不是直接写入 `wrangler.toml`。
    
    **步骤**: 
    1.  生成一个 SHA256 哈希值作为您的管理员密码。您可以使用在线工具或以下 Node.js 代码片段生成：
        ```javascript
        const crypto = require('crypto');
        const password = 'your_strong_admin_password'; // 替换为您的密码
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        console.log(hash);
        ```
    2.  登录到您的 Cloudflare 账户。
    3.  导航到您的 Pages 项目设置。
    4.  在“环境变量”部分，添加一个新的环境变量：
        -   **名称**: `ADMIN_PASSWORD_HASH`
        -   **值**: 您生成的 SHA256 哈希值
    5.  保存更改并重新部署您的 Pages 项目。

5.  **部署到 Cloudflare Pages**: 
    ```bash
    wrangler pages deploy public
    ```
    或者，如果您已将仓库连接到 Cloudflare Pages，只需将更改推送到 `main` 分支即可触发自动部署：
    ```bash
    git add .
    git commit -m "Initial commit for Text Share App"
    git push
    ```

## 使用指南

### 创建分享

1.  在主页的文本区域输入或粘贴您想要分享的文本。
2.  （可选）点击“高级选项”展开菜单：
    -   **删除时间**: 输入一个数字，并选择时间单位（小时、天、月）。默认单位为“小时”，默认值为 24。内容将在指定时间后自动从服务器删除。
    -   **阅后即焚**: 勾选此选项，内容在被查看一次后将自动销毁。
3.  （可选）在“为分享链接设置密码”输入框中输入密码，以保护您的分享内容。
4.  点击“分享”按钮，生成分享链接。
5.  复制生成的链接并分享给他人。

### 查看分享

-   直接访问分享链接。如果内容受密码保护，系统会提示您输入密码。

### 管理员功能

1.  点击页面右下角的“管理员登录”按钮。
2.  输入您在 `wrangler.toml` 中设置的管理员密码。
3.  登录成功后，您将进入管理员面板。
4.  在管理员面板中，您可以：
    -   点击“刷新分享列表”查看所有当前存在的分享内容及其元数据。
    -   点击每个分享旁边的“查看”按钮，以只读模式查看其内容。
    -   点击“编辑”按钮，修改分享内容、密码和阅后即焚状态，然后点击“保存”更新。
    -   点击“删除”按钮，永久删除某个分享内容。

## 贡献

欢迎贡献！如果您有任何功能建议、错误报告或改进，请随时提交 Issue 或 Pull Request。

## 许可证

[MIT License](LICENSE) (如果适用，请创建 LICENSE 文件)
