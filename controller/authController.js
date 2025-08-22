const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const { sha256 } = require('../utils/hash');
const { signAccessToken } = require('../utils/jwt');


//Helper to commute expirt date from refresh ttl like 7d or as ms default 

function computeExpiryDate(ttlStr) {
    const ttl = process.env.REFRESH_TTL || '7D';
    if (ttl.endsWith('d')) {
        const days = parseInt(ttl.slice(0, -1,), 10);
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    }



    if (ttl.endsWith('h')) {
        const hrs = parseInt(ttl.slice(0, -1,), 10);
        return new Date(Date.now() + hrs * 60 * 60 * 1000);

    }

    if (ttl.endsWith('m')) {
        const mins = parseInt(ttl.slice(0, -1,), 10);
        return new Date(Date.now() + mins * 60 * 1000);

    }

    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

}


exports.register = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            status: "Error",
            message: "Validation error",
            details: errors.array()
        })
    }

    const { name, email, password, role, departmentId } = req.body;


    try {

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({
                status: "error",
                message: "Email already registered"
            })
        }

        // Determine final role: Only Admin can assign roles, others get Employee
        let finalRole = 'Employee';
        if (req.user && req.user.role === 'Admin' && role) {
            finalRole = role;
        }


        // Hash password for security - never store plain text passwords


        const salt = await bcrypt.genSalt(10);// Generate random salt
        const hashed = await bcrypt.hash(password, salt);//Hash password with salt


        //create new user with hashed password 

        const user = await User.create({
            name, email, password: hashed, role: finalRole, departmentId: departmentId || null
        })

        //create JWT ACCESS 


        const accessToken = signAccessToken({
            sub: user.id,
            role: user.role,
            deptId: user.departmentId || null
        })


        // Create refresh token for token renewal (long random string)


        const rawRefresh = uuidv4() + '-' + Date.now();
        const tokenHash = sha256(rawRefresh);// hash refresh token before storing 

        const expiresAt = computeExpiryDate(process.env.REFRESH_TTL);//CALCULATE EXPIRY DATE 


        //STORE REFRESH TOKEN IN DATABASE (HASHED FOR SECURITY)
        await RefreshToken.create({
            tokenHash,
            expiresAt,
            userId: user.id,
            ip: req.ip, //store user ip for security tracking 

            userAgent: req.get('User-Agent') || null
        })
        // Set refresh token as HttpOnly cookie (secure, can't be accessed by JavaScript)

        const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
        const cookieMaxAge = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || 7 * 24 * 60 * 60 * 1000, 10);
        res.cookie(cookieName, rawRefresh, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',//https only in production
            maxAge: cookieMaxAge // Cookie expiry time

        })

        res.status(201).json({
            status: "success",
            message: "user register",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }, accessToken
        })



    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal error"
        });
    }
}



exports.login = async (req, res) => {
    // Extract email and password from request body
    const { email, password } = req.body;

    try {
        // Find user by email in database
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Compare provided password with stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        // Create JWT access token for authentication
        const accessToken = signAccessToken({
            sub: user.id,
            role: user.role,
            deptId: user.departmentId || null
        });

        // Create refresh token for token renewal
        const rawRefresh = uuidv4() + '-' + Date.now();
        const tokenHash = sha256(rawRefresh); // Hash before storing
        const expiresAt = computeExpiryDate(process.env.REFRESH_TTL);

        // Store refresh token in database
        await RefreshToken.create({
            tokenHash,
            expiresAt,
            userId: user.id,
            ip: req.ip, // Track user's IP
            userAgent: req.get('User-Agent') || null // Track browser
        });

        // Set refresh token as secure HttpOnly cookie
        const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
        const cookieMaxAge = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || 7 * 24 * 60 * 60 * 1000, 10);

        res.cookie(cookieName, rawRefresh, {
            httpOnly: true, // Security: prevents JavaScript access
            sameSite: 'lax', // CSRF protection
            secure: process.env.NODE_ENV === 'production', // HTTPS in production
            maxAge: cookieMaxAge
        });

        // Return success response
        return res.json({
            status: "success",
            message: "Logged in successfully",
            accessToken,
            data: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal error"
        });
    }
};


exports.refresh = async (req, res) => {
    // Get refresh token from cookie or request body
    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
    const rawRefresh = req.cookies?.[cookieName] || req.body.refreshToken || null;

    if (!rawRefresh) {
        return res.status(401).json({
            status: "error",
            message: "Refresh token missing"
        });
    }

    // Hash the refresh token to compare with database
    const tokenHash = sha256(rawRefresh);

    try {
        // Find refresh token in database
        const rt = await RefreshToken.findOne({ where: { tokenHash } });
        if (!rt) {
            return res.status(401).json({
                status: "error",
                message: "Invalid refresh token"
            });
        }

        // Check if token is revoked
        if (rt.revokedAt) {
            return res.status(401).json({
                status: "error",
                message: "Refresh token revoked"
            });
        }

        // Check if token is expired
        if (new Date() > new Date(rt.expiresAt)) {
            return res.status(401).json({
                status: "error",
                message: "Refresh token expired"
            });
        }

        // Token rotation: delete old token for security
        await rt.destroy();

        // Get user details
        const user = await User.findByPk(rt.userId);
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "User not found"
            });
        }

        // Create new refresh token (rotation)
        const newRaw = uuidv4() + '-' + Date.now();
        const newHash = sha256(newRaw);
        const newExpires = computeExpiryDate(process.env.REFRESH_TTL);

        // Store new refresh token in database
        await RefreshToken.create({
            tokenHash: newHash,
            expiresAt: newExpires,
            userId: user.id,
            ip: req.ip,
            userAgent: req.get('User-Agent') || null
        });

        // Create new access token
        const accessToken = signAccessToken({
            sub: user.id,
            role: user.role,
            deptId: user.departmentId || null
        });

        // Set new refresh token cookie
        const cookieMaxAge = parseInt(process.env.REFRESH_TOKEN_COOKIE_MAXAGE || 7 * 24 * 60 * 60 * 1000, 10);
        res.cookie(cookieName, newRaw, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: cookieMaxAge
        });

        // Return new access token
        return res.json({
            status: "success",
            accessToken,
            data: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: "Internal error"
        });
    }
};

exports.logout = async (req, res) => {


    const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
    const rawRefresh = req.cookies?.[cookieName] || req.body.refreshToken || null;

    if (!rawRefresh) {
        res.clearCookie(cookieName)
        return res.json({
            status: "success",
            message: "logged out"
        })
    }



    //Hash token to find in db

    const tokenHash = sha256(rawRefresh);

    try {


        const rt = await RefreshToken.findOne({ where: { tokenHash } });
        if (rt) await rt.destroy();

        res.clearCookie(cookieName);


        return res.json({

            status: "success",
            message: "Logout successfully"
        })
    } catch (err) {
        console.error(err);

        //still clear cookie even on error

        res.clearCookie(cookieName);
        return res.status(500).json({
            status: "error",
            message: "internal error"
        })
    }
}