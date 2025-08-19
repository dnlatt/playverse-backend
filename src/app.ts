// src/app.ts
import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",")?.map(o => o.trim()) || [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // curl / Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error("Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

export default app;
