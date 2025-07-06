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
        const { content, password, expirationTtl, burnAfterReading, attachedFile } = await request.json();

        if (!content && !attachedFile) {
            return new Response('Content or attached file cannot be empty', { status: 400 });
        }

        // Validate attached file size if present
        const MAX_KV_VALUE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
        if (attachedFile && attachedFile.data) {
            // Estimate size of base64 string (approx. 3 bytes for every 4 base64 chars)
            const base64Data = attachedFile.data.split(',')[1];
            const decodedLength = (base64Data.length / 4) * 3;
            if (decodedLength > MAX_KV_VALUE_SIZE_BYTES) {
                return new Response('Attached file is too large (max 25MB)', { status: 413 });
            }
        }

        // Validate expirationTtl
        const minTtl = 3600; // 1 hour
        const maxTtl = 7776000; // 3 months (approx. 90 days)
        let finalTtl = expirationTtl; // Use provided TTL

        if (typeof finalTtl !== 'number' || finalTtl < minTtl || finalTtl > maxTtl) {
            // If invalid, default to 1 month (2592000 seconds)
            finalTtl = 2592000;
        }

        // Generate a unique key for this new share
        const key = generateRandomId();

        const dataToStore = {
            content: content || null, // Allow content to be null if only file is attached
            passwordHash: null,
            createdAt: new Date().toISOString(),
            burnAfterReading: burnAfterReading || false, // Default to false if not provided
            attachedFile: attachedFile || null // Store attached file data
        };

        // If a password is provided, hash it and store the hash
        if (password && typeof password === 'string' && password.length > 0) {
            dataToStore.passwordHash = await hashPassword(password);
        }

        // Store the data in Cloudflare KV with the specified TTL
        await kv.put(key, JSON.stringify(dataToStore), { expirationTtl: finalTtl });

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