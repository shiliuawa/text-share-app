
// functions/api/admin/list.js

// Middleware for admin authentication
async function authenticateAdmin(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    // For simplicity, we're using a fixed token. In a real app, validate against a generated token/session.
    if (token !== 'admin_authenticated') { // This token should match what admin/login.js returns
        return new Response('Forbidden', { status: 403 });
    }
    return null; // Authentication successful
}

export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;

    // Authenticate admin
    const authResponse = await authenticateAdmin(request, env);
    if (authResponse) {
        return authResponse;
    }

    if (request.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const listResponse = await kv.list();
        const shares = [];

        for (const key of listResponse.keys) {
            // Fetch metadata for each key
            const storedDataString = await kv.get(key.name);
            if (storedDataString) {
                const storedData = JSON.parse(storedDataString);
                shares.push({
                    name: key.name,
                    metadata: {
                        passwordHash: storedData.passwordHash ? true : false,
                        createdAt: storedData.createdAt,
                        expiration: key.expiration,
                        burnAfterReading: storedData.burnAfterReading || false
                    }
                });
            }
        }

        return new Response(JSON.stringify(shares), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to list shares:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
