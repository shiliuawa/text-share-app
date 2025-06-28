
// functions/api/create-share-link.js

// A simple (non-cryptographically secure) utility to generate short random strings.
function generateRandomId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

// Utility to hash passwords
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

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { content, password, timedDeletion, burnAfterReading } = await request.json();

        if (!content || typeof content !== 'string' || !content.trim()) {
            return new Response('Content cannot be empty', { status: 400 });
        }

        // Generate a unique key for this new share
        const key = generateRandomId();

        const dataToStore = {
            content: content,
            passwordHash: null,
            createdAt: new Date().toISOString(),
            burnAfterReading: burnAfterReading || false // Default to false if not provided
        };

        // If a password is provided, hash it and store the hash
        if (password && typeof password === 'string' && password.length > 0) {
            dataToStore.passwordHash = await hashPassword(password);
        }

        // Store the data in Cloudflare KV
        const kvOptions = {};
        if (timedDeletion) {
            // Set expiration to 24 hours (86400 seconds) if timed deletion is enabled
            kvOptions.expirationTtl = 86400;
        }

        await kv.put(key, JSON.stringify(dataToStore), kvOptions);

        // Return the unique key to the client
        return new Response(JSON.stringify({ key: key }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to create share link:', error);
        return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
}
