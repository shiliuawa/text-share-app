// functions/api/_middleware.js

// This middleware will run for all requests under /api/
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // These paths do not require authentication
    const publicPaths = ['/api/verify', '/api/share'];

    // Check if the request path is one of the public paths
    // For /api/share, it could be /api/share/some-key, so we use startsWith
    if (pathname === '/api/verify' || pathname.startsWith('/api/share')) {
        // If it's a public path, just proceed to the next function
        return next();
    }

    // For all other paths, perform authentication
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('未授权', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== env.AUTH_TOKEN) {
        return new Response('无效令牌', { status: 401 });
    }

    // If authentication is successful, proceed to the requested function
    return next();
}
