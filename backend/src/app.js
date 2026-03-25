import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import apiRoutes from "./routes/index.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 250,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(compression());
app.use(cookieParser());

app.use("/api/v1/webhooks", webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);
