export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV; // KV 命名空间绑定

    if (request.method === 'GET') {
        // 获取 KV 中的内容
        const content = await kv.get('clipboard-content') || '';
        return new Response(content, { status: 200 });
    } else if (request.method === 'POST') {
        // 保存内容到 KV
        const content = await request.text();
        await kv.put('clipboard-content', content);
        return new Response('保存成功', { status: 200 });
    } else {
        return new Response('方法不支持', { status: 405 });
    }
}