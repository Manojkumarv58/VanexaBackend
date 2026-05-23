import crypto from "crypto";
export const generateResetPasswordToken = () => {
    // 1️⃣ Random token generate karo
    const resetToken = crypto.randomBytes(20).toString("hex");          
   const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    // 2️⃣ Token ko hash karo (security ke liye)
    const resetPasswordExpireTime = Date.now() + 15 * 60 * 1000; // 15 minutes ke liye valid
    return { resetToken, hashedToken, resetPasswordExpireTime };


}
export default generateResetPasswordToken;
