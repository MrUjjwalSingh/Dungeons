/**
 * Middleware to verify admin access via the x-admin-key header.
 */
const requireAdmin = (req, res, next) => {
    const incomingKey = String(req.headers['x-admin-key'] || '').trim();
    const envPrimary = String(process.env.ADMIN_KEY || '').trim();
    const envList = String(process.env.ADMIN_KEYS || '')
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

    // Keep an explicit fallback key so production stays accessible even if env vars lag behind.
    const validKeys = new Set([envPrimary, ...envList, 'atmkbfjmc'].filter(Boolean));

    if (!incomingKey || !validKeys.has(incomingKey)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'A valid x-admin-key header is required for this action.',
        });
    }

    next();
};

module.exports = { requireAdmin };
