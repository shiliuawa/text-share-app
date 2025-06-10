import { createHash } from 'crypto';

export async function onRequest(context) {
    const { request, env } = context;
    const HASHED_PASSWORD = env.HASHED_PASSWORD;
    const AUTH_TOKEN = env.AUTH_TOKEN;

    if (!HASHED_PASSWORD || !AUTH_TOKEN) {
        return new Response('服务器未配置密码或令牌', { status: 500 });
    }

    if (request.method !== 'POST') {
        return new Response('方法不支持', { status: 405 });
    }

    try {
        const { password } = await request.json();
        const hashedInput = createHash('sha256').update(password).digest('hex');
        if (hashedInput === HASHED_PASSWORD) {
            return new Response(JSON.stringify({ token: AUTH_TOKEN }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response('密码错误', { status: 401 });
        }
    } catch (error) {
        return new Response('请求格式错误', { status: 400 });
    }
}