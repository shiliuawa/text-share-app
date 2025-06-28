
// functions/api/admin/update.js

// Utility to hash passwords, must be identical to the one in create-share-link.js
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    // Authenticate admin
    const authResponse = await authenticateAdmin(request, env);
    if (authResponse) {
        return authResponse;
    }

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { key, content, password, burnAfterReading } = await request.json();

        if (!key || !content) {
            return new Response('Missing key or content', { status: 400 });
        }

        // Fetch existing data to preserve createdAt and expiration (if any)
        const existingDataString = await kv.get(key);
        let existingData = {};
        if (existingDataString) {
            existingData = JSON.parse(existingDataString);
        }

        const dataToStore = {
            content: content,
            passwordHash: existingData.passwordHash, // Preserve existing hash unless new password is provided
            createdAt: existingData.createdAt || new Date().toISOString(),
            burnAfterReading: burnAfterReading // Use new burnAfterReading value
        };

        // If a new password is provided, hash it and update
        if (password !== undefined) { // Allow empty string to remove password
            if (password && typeof password === 'string' && password.length > 0) {
                dataToStore.passwordHash = await hashPassword(password);
            } else {
                dataToStore.passwordHash = null; // Remove password protection
            }
        }

        // Preserve existing expirationTtl if not explicitly changed (not handled by this API yet)
        const kvOptions = {};
        // If you want to allow changing expiration from admin panel, you'd add logic here
        // For now, we assume expiration is set at creation and not changed via admin update

        await kv.put(key, JSON.stringify(dataToStore), kvOptions);

        return new Response(JSON.stringify({ message: `Share ${key} updated successfully` }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to update share:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
