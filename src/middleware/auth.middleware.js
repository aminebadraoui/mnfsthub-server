import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token is required' });
    }

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Add decoded user data to request object
        req.user = {
            id: decoded.id,
            tenantId: decoded.tenantId
        };

        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}; 