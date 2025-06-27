
export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    if (request.method !== 'POST') {
        return new Response('方法不支持', { status: 405 });
    }

    if (!kv) {
        return new Response('错误: KV 命名空间未绑定', { status: 500 });
    }

    try {
        const { keys } = await kv.list();
        const deletePromises = keys.map(key => kv.delete(key.name));
        await Promise.all(deletePromises);

        return new Response('所有剪贴板已删除', { status: 200 });
    } catch (error) {
        console.error('删除所有剪贴板失败:', error);
        return new Response(`服务器错误: ${error.message}`, { status: 500 });
    }
}
