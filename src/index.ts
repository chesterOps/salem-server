import dotenv from "dotenv";

// Configure env
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { connectDB } from "./config/db";
import authRouter from "./routes/auth.routes";
import categoryRouter from "./routes/category.routes";
import productRouter from "./routes/product.routes";
import userRouter from "./routes/user.routes";
import AppError from "./utils/appError";
import errorHandler from "./utils/errorHandler";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import compression from "compression";

// Create express app
const app: Express = express();

// Define port
const PORT: number = Number(process.env.PORT || 3000);

//const allowedOrigins = [`${process.env.FRONT_URL}`];

// Enable trust proxy for Heroku or other proxies
app.set("trust proxy", 1);

// Middleware to make req.query mutable
app.use((req, _res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// Set security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman)
      if (!origin) return callback(null, true);

      // Allow all origins
      return callback(null, true);
    },
    credentials: true, // allow cookies
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again after an hour",
});
app.use("/api", limiter);

// Parse JSON data
app.use(
  express.json({
    limit: "10kb",
  })
);

// Parse URL-encoded data
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

// Parse cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Compress responses
app.use(compression());

// Auth routes
app.use("/api/v1/auth", authRouter);

// User routes
app.use("/api/v1/users", userRouter);

// Category routes
app.use("/api/v1/categories", categoryRouter);

// Product routes
app.use("/api/v1/products", productRouter);

// Not found response
app.all("/{*any}", (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Uncaught exception
process.on("uncaughtException", (err: Error) => {
  console.log("Uncaught exception!, Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Unhandled rejection
process.on("unhandledRejection", (err: Error) => {
  console.log("Unhandled rejection!, Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
