const { recordActivity } = require('../utils/activityLogger');

const IGNORED_PATH_PREFIXES = ['/api/', '/css/', '/js/', '/images/', '/img/', '/fonts/'];
const IGNORED_FILE_EXTENSIONS = /\.(css|js|map|png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/i;

exports.trackPageActivity = (req, res, next) => {
    const isViewRequest = req.method === 'GET' || req.method === 'HEAD';
    const shouldIgnore = IGNORED_PATH_PREFIXES.some((prefix) => req.path.startsWith(prefix)) ||
        IGNORED_FILE_EXTENSIONS.test(req.path) ||
        req.path === '/favicon.ico';

    if (!isViewRequest || shouldIgnore) {
        return next();
    }

    res.on('finish', () => {
        if (res.statusCode >= 500) {
            return;
        }

        const viewer = res.locals.user;
        recordActivity({
            type: 'page_view',
            action: 'page_viewed',
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            userId: viewer?._id,
            userName: viewer?.name,
            role: viewer?.role,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            referrer: req.get('referer') || req.get('referrer'),
            visitorId: req.ip,
            metadata: {
                query: req.query,
            },
        });
    });

    next();
};