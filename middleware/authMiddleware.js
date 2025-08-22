const { verifyAccessToken } = require('../utils/jwt');
function authMiddleware(req, res, next) {


    const authHeader = req.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "User token does not exist"
        })
    }



    // 
    const payload = verifyAccessToken(token);
    if (!payload) {
        return res.status(401).json({
            status: "error",
            message: "invalid or expired token"
        })
    }

    req.user = {
        id: payload.sub,
        role: payload.role,
        deptId: payload.deptId || null
    };


    next();



}


module.exports = { authMiddleware };
