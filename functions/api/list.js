export async function onRequest(context) {
    const { env, request } = context;
    const kv = env.CLIPBOARD_KV;
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('未授权', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== env.AUTH_TOKEN) {
        return new Response('无效令牌', { status: 401 });
    }

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