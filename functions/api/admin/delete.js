
// functions/api/admin/delete.js

// Middleware for admin authentication (same as admin/list.js)
async function authenticateAdmin(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== 'admin_authenticated') { // This token should match what admin/login.js returns
        return new Response('Forbidden', { status: 403 });
    }
    return null; // Authentication successful
}

export async function onRequest(context) {
    const { request, env } = context;
    const kv = env.CLIPBOARD_KV;
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    // Authenticate admin
    const authResponse = await authenticateAdmin(request, env);
    if (authResponse) {
        return authResponse;
    }

    if (request.method !== 'DELETE') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    if (!key) {
        return new Response('Missing share key', { status: 400 });
    }

    try {
        await kv.delete(key);
        return new Response(`Share ${key} deleted successfully`, { status: 200 });
    } catch (error) {
        console.error('Failed to delete share:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
