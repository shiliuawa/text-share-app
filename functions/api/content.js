export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    if (!kv) {
        return new Response('错误: KV 命名空间未绑定', { status: 500 });
    }

    if (request.method === 'GET') {
        try {
            const content = await kv.get('clipboard-content') || '';
            return new Response(content, {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            return new Response(`读取 KV 失败: ${error.message}`, { status: 500 });
        }
    } else if (request.method === 'POST') {
        try {
            const content = await request.text();
            await kv.put('clipboard-content', content);
            return new Response('保存成功', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            return new Response(`保存 KV 失败: ${error.message}`, { status: 500 });
        }
    } else {
        return new Response('方法不支持', { status: 405 });
    }
}