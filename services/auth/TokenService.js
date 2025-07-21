const jwt = require('jsonwebtoken');

class TokenService {
    static generateAuthToken(user) {
        const payload = {
            userId: user._id,
            email: user.email,
            isAdmin: user.isAdmin || false
        };
        // sign token with secret key and set expiration
        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'outlaws@319rZeUVAbk7!ECkhgkpi0C3',
            {expiresIn: '1h'} // Token expires in 1 hour
        );
    }
    
    static generateRefreshToken(user) {
        const payload = {userId: user._id};

        return jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || 'outlaws-refresh-token-3x8Kp!Q2R7TvZs9WyX4mD6bN1cF5gH',
            {expiresIn: '7d'} // refresh token last 7 days
        );
    }
    
    static verifyToken(token) {
        try {
            return jwt.verify(
                token, 
                process.env.JWT_SECRET || 'outlaws@319rZeUVAbk7!ECkhgkpi0C3'
            );
        } catch (error) {
            return null;
        }
    }
    
    static verifyRefreshToken(refreshToken) {
        try {
            return jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || 'outlaws-refresh-token-3x8Kp!Q2R7TvZs9WyX4mD6bN1cF5gH'
            );
        } catch (error) {
            return null;
        }
    }
}

module.exports = TokenService;

module.exports = TokenService;