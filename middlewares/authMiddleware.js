import jwt from "jsonwebtoken";
import ErrorHandler from "./errorMiddleware.js";
import { catchAsyncError } from "./catchAsyncError.js";
import database from "../database/db.js";

export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler(401, "Please login first"));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user=await database.query(
    `SELECT * FROM users WHERE id = $1`,
    [decoded.id]
  );
    req.user = user.rows[0];  

  next();
});
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(403, "Access denied"));
    }

    next();
  };
};