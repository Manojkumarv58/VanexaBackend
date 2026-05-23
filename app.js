import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import { createTables } from "./utils/createTables.js";
import {errorMiddleware} from "./middlewares/errorMiddleware.js"; 
import authRoutes from "./router/authRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import productRoutes from "./router/productRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import orderRoutes from "./router/orderRoutes.js";
import paymentRoutes from "./router/paymentRoutes.js";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:[process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
}));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

createTables();
app.use(errorMiddleware);
export default app;