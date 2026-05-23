
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import database from "../database/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import {sendEmail} from "../utils/sendEmail.js";
import { sendToken } from "../utils/jwtToken.js";
import getResetPassword from '../utils/generateResetPassword.js'
import generateForgotPasswordTemplate from "../utils/generateforgatePasswordTemplate.js";
import { destroyCloudinaryMedia, safeUnlinkTemp, toFileArray } from "../utils/cloudinaryMedia.js";

export const registerUser = catchAsyncError(async (req, res, next) => {  

  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler(400, "Please fill all the fields"));
  }

  const isAlreadyRegistered = await database.query(
    `SELECT * FROM users WHERE email = $1`, 
    [email]
  );

  if (isAlreadyRegistered.rows.length > 0) {
    return next(new ErrorHandler(400, "User is already registered"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await database.query(
    `INSERT INTO users (name, email, password, role) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role || "User"]
  );

  // Don't auto-login after registration - just send success response
  res.status(201).json({
    success: true,
    message: "User registered successfully. Please login to continue.",
    user: {
      id: newUser.rows[0].id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role
    }
  });
});



export const loginUser = catchAsyncError(async (req, res, next) => { 
    
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(400, "Please enter email and password"));
  }
    const userRes = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  const user = userRes.rows[0];

  if (!user) {
    return next(new ErrorHandler(400, "Invalid email or password"));
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler(400, "Invalid email or password"));
  }

  sendToken(user, 200, "Login successful", res);
    });
export const logoutUser = catchAsyncError(async (req, res, next) => {   
        res.status(200)
    .cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()), 
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });


  });
export const getUserProfile = catchAsyncError(async (req, res, next) => {  

 const user = req.user;

  res.status(200).json({
    success: true,
    user,
  });
   });

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, avatar, removeAvatar } = req.body;
  const avatarFiles = toFileArray(req.files?.avatar);
  const avatarFile = avatarFiles[0];
  const userId = req.user.id;
  const oldAvatar = req.user.avatar;

  const removeAvatarFlag =
    removeAvatar === true ||
    removeAvatar === "true" ||
    removeAvatar === "1";

  const hasName = name !== undefined && name !== null && String(name).trim() !== "";
  const hasEmail = email !== undefined && email !== null && String(email).trim() !== "";
  const hasAvatarInput =
    avatarFiles.length > 0 ||
    removeAvatarFlag ||
    avatar !== undefined;

  if (!hasName && !hasEmail && !hasAvatarInput) {
    return next(new ErrorHandler(400, "Please provide at least one field to update"));
  }

  if (hasName && String(name).trim().length < 3) {
    return next(new ErrorHandler(400, "Name must be at least 3 characters"));
  }

  if (hasEmail) {
    const emailStr = String(email).trim();
    if (!emailStr.includes("@")) {
      return next(new ErrorHandler(400, "Please enter a valid email"));
    }
    const taken = await database.query(
      `SELECT id FROM users WHERE email = $1 AND id != $2`,
      [emailStr, userId]
    );
    if (taken.rows.length > 0) {
      return next(new ErrorHandler(400, "Email is already in use"));
    }
  }

  let avatarPayload = undefined;
  let hasAvatarUpdate = false;
  let uploadedAvatar = null;

  if (avatarFiles.length > 1) {
    avatarFiles.forEach(safeUnlinkTemp);
    return next(new ErrorHandler(400, "Only one avatar image is allowed"));
  }

  if (avatarFile) {
    const allowed = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);
    if (!allowed.has(avatarFile.mimetype)) {
      safeUnlinkTemp(avatarFile);
      return next(
        new ErrorHandler(400, "Invalid image type. Use JPEG, PNG, or WebP")
      );
    }

    try {
      const result = await cloudinary.uploader.upload(avatarFile.tempFilePath, {
        folder: "avatars",
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
        ],
      });
      safeUnlinkTemp(avatarFile);

      avatarPayload = {
        public_id: result.public_id,
        url: result.secure_url,
        resource_type: "image",
      };
      uploadedAvatar = avatarPayload;
      hasAvatarUpdate = true;
    } catch {
      safeUnlinkTemp(avatarFile);
      return next(new ErrorHandler(500, "Avatar upload failed"));
    }
  } else if (removeAvatarFlag) {
    avatarPayload = null;
    hasAvatarUpdate = true;
  } else if (avatar !== undefined) {
    hasAvatarUpdate = true;
    if (avatar === null || avatar === "null" || avatar === "") {
      avatarPayload = null;
    } else if (typeof avatar === "object") {
      avatarPayload = avatar;
    } else if (typeof avatar === "string") {
      try {
        avatarPayload = JSON.parse(avatar);
      } catch {
        return next(new ErrorHandler(400, "Invalid avatar data"));
      }
    }
  }

  const updates = [];
  const values = [];
  let i = 1;

  if (hasName) {
    updates.push(`name = $${i++}`);
    values.push(String(name).trim());
  }
  if (hasEmail) {
    updates.push(`email = $${i++}`);
    values.push(String(email).trim());
  }
  if (hasAvatarUpdate) {
    updates.push(`avatar = $${i++}`);
    values.push(avatarPayload);
  }

  values.push(userId);

  let result;

  try {
    result = await database.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${i}
       RETURNING id, name, email, role, avatar, created_at`,
      values
    );
  } catch (error) {
    if (uploadedAvatar) {
      await destroyCloudinaryMedia(uploadedAvatar);
    }
    throw error;
  }

  if (hasAvatarUpdate && oldAvatar?.public_id && oldAvatar.public_id !== avatarPayload?.public_id) {
    await destroyCloudinaryMedia(oldAvatar);
  }

  const updated = result.rows[0];

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updated,
  });
});

 export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const { frontendUrl } = req.query;

  console.log('🔍 Forgot password request:', { email, frontendUrl });

  if (!email) {
    return next(new ErrorHandler(400, "Email is required"));
  }

  if (!frontendUrl) {
    return next(new ErrorHandler(400, "Frontend URL is required"));
  }

  let userRes = await database.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  console.log('👤 User search result:', userRes.rows.length > 0 ? 'Found' : 'Not found');

  if (userRes.rows.length === 0) {
    return next(new ErrorHandler(404, "User not found with this email"));
  }

  const user = userRes.rows[0];

  const { resetToken, hashedToken, resetPasswordExpireTime } = getResetPassword();

  await database.query(
    `UPDATE users 
     SET reset_password_token = $1, reset_password_expire = to_timestamp($2) 
     WHERE id = $3`,
    [hashedToken, resetPasswordExpireTime / 1000, user.id] // ✅ FIXED
  );

  const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

  console.log('🔗 Reset URL generated:', resetUrl);

  const message = generateForgotPasswordTemplate(resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    console.log('✅ Email sent successfully to:', user.email);

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    await database.query(
      `UPDATE users 
       SET reset_password_token = null, reset_password_expire = null 
       WHERE id = $1`,
      [user.id]
    );

    return next(new ErrorHandler(500, "Failed to send email"));
  }
});

export const resetPassword = catchAsyncError(async (req, res, next) => {

  const { token } = req.params;
  const { password,confirmPassword } = req.body;

  if(password !== confirmPassword){
    return next(new ErrorHandler(400, "Password and Confirm Password do not match"));
  }

  // 1️⃣ Token hash (same as stored)
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2️⃣ Find user with valid token
  const userRes = await database.query(
    `SELECT * FROM users 
     WHERE reset_password_token = $1 
     AND reset_password_expire > NOW()`,
    [hashedToken]
  );

  const user = userRes.rows[0];

  // 3️⃣ Check token valid
  if (!user) {
    return next(new ErrorHandler(400, "Invalid or expired token"));
  }

  // 4️⃣ Password validation (optional but good 🔥)
  if (!password || password.length < 6) {
    return next(new ErrorHandler(400, "Password must be at least 6 characters"));
  }

  // 5️⃣ Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 6️⃣ Update password + clear token
  await database.query(
    `UPDATE users 
     SET password = $1, 
         reset_password_token = NULL, 
         reset_password_expire = NULL 
     WHERE id = $2`,
    [hashedPassword, user.id]
  );

  // 7️⃣ Response
  res.status(200).json({
  success: true,
  message: "Password reset successful",
});

});
export const updatePassword = catchAsyncError(async (req, res, next) => {

  const { oldPassword, newPassword, confirmPassword } = req.body;

  // 1️⃣ validation
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ErrorHandler(400, "Please fill all fields"));
  }

  if (newPassword.length < 6) {
    return next(new ErrorHandler(400, "Password must be at least 6 characters"));
  }

  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler(400, "New password and confirm password do not match"));
  }

  // 2️⃣ user fetch (middleware se)
  const userId = req.user.id;

  const userRes = await database.query(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  );

  const user = userRes.rows[0];

  if (!user) {
    return next(new ErrorHandler(404, "User not found"));
  }

  // 3️⃣ old password check
  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return next(new ErrorHandler(400, "Old password is incorrect"));
  }

  // 4️⃣ new password hash
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 5️⃣ update DB
  await database.query(
    `UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );

  // 6️⃣ response
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });

});
