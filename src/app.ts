import { NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import requestSanitizer from "./middlewares/html-sanitizer.middleware";
import hpp from "hpp";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";
import { AppError, errorHandler } from "./services/error.service";
import setupAsyncLocalStorage from "./middlewares/setupAls.middleware";
import userRoutes from "./api/user/user.routes";
import authRoutes from "./api/auth/auth.routes";
import { requestLimiter } from "./services/rate-limiter.service";
// import { setupSocketAPI } from "./services/socket.service";

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(requestLimiter);
app.use(ExpressMongoSanitize());
app.use(requestSanitizer);
app.use(
  hpp({
    whitelist: [], // add whitelisted query params here
  })
);

// cors
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.resolve(__dirname, "public")));
} else {
  const corsOptions = {
    origin: [
      "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ],
    credentials: true,
  };
  app.use(cors(corsOptions));
}

app.all("*", setupAsyncLocalStorage);
app.use((req: Request, res: Response, next: NextFunction) => {
  requestLogger(req, res, next);
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
// setupSocketAPI(http);

app.get("/**", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app;
