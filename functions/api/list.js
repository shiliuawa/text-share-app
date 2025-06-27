export async function onRequest(context) {
    const { env, request } = context;
    const kv = env.CLIPBOARD_KV;
    

    try {
        const keys = (await kv.list()).keys.map(k => k.name);
        return new Response(JSON.stringify(keys), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response('获取列表失败', { status: 500 });
    }
}