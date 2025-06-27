
export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    if (request.method !== 'POST') {
        return new Response('方法不支持', { status: 405 });
    }

    try {
        const { oldKey, newKey } = await request.json();

        if (!oldKey || !newKey) {
            return new Response('缺少旧名称或新名称', { status: 400 });
        }

        if (oldKey === newKey) {
            return new Response('新旧名称不能相同', { status: 400 });
        }

        // 1. 获取旧键的内容
        const content = await kv.get(oldKey);

        if (content === null) {
            return new Response('原始剪贴板不存在', { status: 404 });
        }

        // 2. 将内容写入新键 (原子操作的一部分)
        // 3. 删除旧键 (原子操作的另一部分)
        // Cloudflare KV transaction support is through `atomic()` method but it's not available in Pages Functions yet.
        // We will perform them sequentially.
        await kv.put(newKey, content);
        await kv.delete(oldKey);

        return new Response('重命名成功', { status: 200 });

    } catch (error) {
        console.error('重命名失败:', error);
        return new Response(`服务器错误: ${error.message}`, { status: 500 });
    }
}
