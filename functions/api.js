export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    if (request.method === 'GET') {
        const content = await kv.get('clipboard-content') || '';
        return new Response(content, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
        });
    } else if (request.method === 'POST') {
        const content = await request.text();
        try {
            await kv.put('clipboard-content', content);
            return new Response('保存成功', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            return new Response(`保存失败: ${error.message}`, { status: 500 });
        }
    } else {
        return new Response('方法不支持', { status: 405 });
    }
}