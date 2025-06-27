import { createHash } from 'crypto';

export async function onRequest(context) {
    const { env, request } = context;
    const kv = env.CLIPBOARD_KV;
    const url = new URL(request.url);

    const shareId = url.searchParams.get('id');
    const clipboardKey = url.searchParams.get('key');

    if (!kv) {
        return new Response('错误: KV 命名空间未绑定', { status: 500 });
    }

    // Handle password-protected shares
    if (shareId) {
        try {
            const metadataString = await kv.get(`share_metadata_${shareId}`);
            if (!metadataString) {
                return new Response('分享链接无效或已过期', { status: 404 });
            }
            const metadata = JSON.parse(metadataString);
            const originalKey = metadata.originalKey;
            const passwordHash = metadata.passwordHash;

            if (passwordHash) {
                // This is a password-protected share
                if (request.method === 'POST') {
                    // User is submitting a password
                    const { password } = await request.json();
                    const hashedInput = createHash('sha256').update(password).digest('hex');

                    if (hashedInput === passwordHash) {
                        // Password correct, serve content
                        const content = await kv.get(originalKey) || '';
                        return new Response(JSON.stringify({ content }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } else {
                        return new Response('密码错误', { status: 401 });
                    }
                } else if (request.method === 'GET') {
                    // Serve password input page
                    return new Response(`
                        <!DOCTYPE html>
                        <html lang="zh-CN">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>输入密码</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; background-color: #f4f4f4; }
                                .container { background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                                input[type="password"] { padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; width: 200px; }
                                button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                                button:hover { background-color: #0056b3; }
                                #message { margin-top: 10px; color: red; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>请输入密码</h1>
                                <input type="password" id="passwordInput" placeholder="密码">
                                <button onclick="submitPassword()">提交</button>
                                <div id="message"></div>
                            </div>
                            <script>
                                async function submitPassword() {
                                    const password = document.getElementById('passwordInput').value;
                                    const messageDiv = document.getElementById('message');
                                    try {
                                        const response = await fetch(window.location.href, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ password })
                                        });
                                        if (response.ok) {
                                            const { content } = await response.json();
                                            document.body.innerHTML = `
                                                <div class="container">
                                                    <h1>共享剪贴板内容</h1>
                                                    <pre style="text-align: left; white-space: pre-wrap; word-break: break-all;">${content.replace(/</g, '&lt;')}</pre>
                                                </div>
                                            `;
                                        } else {
                                            const errorText = await response.text();
                                            messageDiv.textContent = errorText || '密码错误';
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        messageDiv.textContent = '请求失败';
                                    }
                                }
                            </script>
                        </body>
                        </html>
                    `, {
                        status: 200,
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
            } else {
                // No password set for this shareId, serve content directly
                const content = await kv.get(originalKey) || '';
                return new Response(`
                    <!DOCTYPE html>
                    <html lang="zh-CN">
                    <head>
                        <meta charset="UTF-8">
                        <title>共享剪贴板</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            pre { background: #f4f4f4; padding: 10px; white-space: pre-wrap; }
                        </style>
                    </head>
                    <body>
                        <h1>共享剪贴板: ${originalKey}</h1>
                        <pre>${content.replace(/</g, '&lt;')}</pre>
                    </body>
                    </html>
                `, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                });
            }
        } catch (error) {
            console.error('处理分享链接失败:', error);
            return new Response(`服务器错误: ${error.message}`, { status: 500 });
        }
    } else if (clipboardKey) {
        // Handle public shares (existing logic)
        try {
            const content = await kv.get(clipboardKey) || '';
            return new Response(`
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <title>共享剪贴板</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        pre { background: #f4f4f4; padding: 10px; white-space: pre-wrap; }
                    </style>
                </head>
                <body>
                    <h1>共享剪贴板: ${clipboardKey}</h1>
                    <pre>${content.replace(/</g, '&lt;')}</pre>
                </body>
                </html>
            `, {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
            });
        } catch (error) {
            return new Response('读取失败', { status: 500 });
        }
    } else {
        return new Response('缺少分享参数', { status: 400 });
    }
}
