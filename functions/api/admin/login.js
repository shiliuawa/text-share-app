
// functions/api/admin/login.js

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

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { password } = await request.json();

        if (!password) {
            return new Response('Password is required', { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        if (hashedPassword === env.ADMIN_PASSWORD_HASH) {
            // In a real application, you'd generate a JWT or a more robust token here.
            // For simplicity, we'll just return a fixed token or a success message.
            // For now, let's return a simple success token.
            return new Response(JSON.stringify({ token: 'admin_authenticated' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response('Unauthorized', { status: 401 });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
