export async function onRequest(context) {
    const { request, env } = context;
    const PASSWORD = env.CLIPBOARD_PASSWORD;

    if (!PASSWORD) {
        return new Response('服务器未配置密码', { status: 500 });
    }

    if (request.method !== 'POST') {
        return new Response('方法不支持', { status: 405 });
    }

    try {
        const { password } = await request.json();
        if (password === PASSWORD) {
            return new Response('验证成功', { status: 200 });
        } else {
            return new Response('密码错误', { status: 401 });
        }
    } catch (error) {
        return new Response('请求格式错误', { status: 400 });
    }
}