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

    if (!key) {
        return new Response('Missing share key', { status: 400 });
    }

    if (request.method === 'GET') {
        try {
            // Get the key and its metadata to check expiration
            const kvGetResult = await kv.getWithMetadata(key);

            if (kvGetResult.value === null) {
                return new Response('Content not found', { status: 404 });
            }

            const storedDataString = kvGetResult.value;
            const metadata = kvGetResult.metadata;

            let storedData;
            try {
                storedData = JSON.parse(storedDataString);
            } catch (e) {
                // If JSON.parse fails, assume it's old plain text content
                console.warn(`Could not parse JSON for key ${key}:`, e);
                storedData = {
                    content: storedDataString,
                    passwordHash: null,
                    createdAt: '未知',
                    burnAfterReading: false
                };
            }

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

            const headers = { 'Content-Type': 'text/plain; charset=utf-8' };
            if (storedData.burnAfterReading) {
                headers['X-Burn-After-Reading'] = 'true';
            }
            // Add expiration timestamp to headers if available
            if (metadata && metadata.expiration) {
                headers['X-Expires-At'] = metadata.expiration.toString();
            }

            // If we are here, either no password was required or the correct one was provided.
            const response = new Response(storedData.content, {
                status: 200,
                headers: headers
            });

            // If burn after reading is enabled, delete the content after sending the response
            if (storedData.burnAfterReading) {
                context.waitUntil(kv.delete(key));
            }

            return response;

        } catch (error) {
            console.error('Failed to retrieve content:', error);
            return new Response(`Server Error: ${error.message}`, { status: 500 });
        }
    } else if (request.method === 'DELETE') {
        try {
            await kv.delete(key);
            return new Response('Content deleted', { status: 200 });
        } catch (error) {
            console.error('Failed to delete content:', error);
            return new Response(`Server Error: ${error.message}`, { status: 500 });
        }
    } else {
        return new Response('Method Not Allowed', { status: 405 });
    }
}
