export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const kv = env.CLIPBOARD_KV; // KV 绑定名称

        if (url.pathname === '/api/content') {
            if (request.method === 'GET') {
                // 从 KV 获取内容
                const content = await kv.get('clipboard-content') || '';
                return new Response(content, { status: 200 });
            } else if (request.method === 'POST') {
                // 保存内容到 KV
                const content = await request.text();
                await kv.put('clipboard-content', content);
                return new Response('Saved', { status: 200 });
            }
        }

        // 如果不是 API 请求，返回 404
        return new Response('Not Found', { status: 404 });
    }
};