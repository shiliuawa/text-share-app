
// functions/api/content.js

// Utility to hash passwords, must be identical to the one in create-share-link.js
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!key) {
        return new Response('Missing share key', { status: 400 });
    }

    try {
        const storedDataString = await kv.get(key);

        if (storedDataString === null) {
            return new Response('Content not found', { status: 404 });
        }

        const storedData = JSON.parse(storedDataString);

        // Check if the content is password-protected
        if (storedData.passwordHash) {
            const authHeader = request.headers.get('Authorization') || '';
            const clientPassword = authHeader.replace(/^Bearer\s+/, '');

            if (!clientPassword) {
                // Password is required but was not provided
                return new Response('Password required', { status: 401 });
            }

            const clientPasswordHash = await hashPassword(clientPassword);

            if (clientPasswordHash !== storedData.passwordHash) {
                // Incorrect password provided
                return new Response('Incorrect password', { status: 403 });
            }
        }

        // If we are here, either no password was required or the correct one was provided.
        return new Response(storedData.content, {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('Failed to retrieve content:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
