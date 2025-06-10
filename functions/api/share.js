export async function onRequest(context) {
    const { env, request } = context;
    const kv = env.CLIPBOARD_KV;
    const url = new URL(request.url);
    const key = url.pathname.split('/').pop();

    if (!key) {
        return new Response('缺少剪贴板键', { status: 400 });
    }

    try {
        const content = await kv.get(key) || '';
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
                <h1>共享剪贴板: ${key}</h1>
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
}