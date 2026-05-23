import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });   
    
    // Cookie settings for cross-origin (production)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true, // Required for cross-origin
        sameSite: 'none', // Required for cross-origin
    };
    
    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        message,
        token,
        user,
    });
}