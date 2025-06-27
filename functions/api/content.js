import { createHash } from 'crypto';

export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;
    const url = new URL(request.url);
    const key = url.searchParams.get('key') || 'default';
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('未授权', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== env.AUTH_TOKEN) {
        return new Response('无效令牌', { status: 401 });
    }

    if (!kv) {
        return new Response('错误: KV 命名空间未绑定', { status: 500 });
    }

    if (request.method === 'GET') {
        try {
            const content = await kv.get(key) || '';
            const etag = createHash('sha256').update(content).digest('hex');
            const ifNoneMatch = request.headers.get('If-None-Match');

            if (ifNoneMatch && ifNoneMatch === etag) {
                return new Response(null, { status: 304 });
            }

            return new Response(content, {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'ETag': etag
                }
            });
        } catch (error) {
            return new Response(`读取 KV 失败: ${error.message}`, { status: 500 });
        }
    } else if (request.method === 'POST') {
        try {
            const content = await request.text();
            await kv.put(key, content);
            return new Response('保存成功', {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            });
        } catch (error) {
            return new Response(`保存 KV 失败: ${error.message}`, { status: 500 });
        }
    } else if (request.method === 'DELETE') {
        try {
            await kv.delete(key);
            return new Response('删除成功', { status: 200 });
        } catch (error) {
            return new Response(`删除 KV 失败: ${error.message}`, { status: 500 });
        }
    } else {
        return new Response('方法不支持', { status: 405 });
    }
}