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

// CORS configuration - specific origins for credentials
const allowedOrigins = [
    'https://vanexa-frontend.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
}));

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Backend is running!',
        timestamp: new Date().toISOString()
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);

createTables();
app.use(errorMiddleware);
export default app;