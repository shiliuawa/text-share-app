import { createHash } from 'crypto';

export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    if (request.method !== 'POST') {
        return new Response('方法不支持', { status: 405 });
    }

    try {
        const { clipboardKey, sharePassword } = await request.json();

        if (!clipboardKey) {
            return new Response('缺少剪贴板键', { status: 400 });
        }

        let shareUrl;
        if (sharePassword) {
            // Generate a unique ID for the protected share
            const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const passwordHash = createHash('sha256').update(sharePassword).digest('hex');

            // Store metadata for the protected share
            await kv.put(`share_metadata_${shareId}`, JSON.stringify({
                originalKey: clipboardKey,
                passwordHash: passwordHash
            }));
            shareUrl = `${context.url.origin}/api/share?id=${shareId}`;
        } else {
            // Public share link
            shareUrl = `${context.url.origin}/api/share?key=${clipboardKey}`;
        }

        return new Response(JSON.stringify({ shareUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('创建分享链接失败:', error);
        return new Response(`服务器错误: ${error.message}`, { status: 500 });
    }
}
