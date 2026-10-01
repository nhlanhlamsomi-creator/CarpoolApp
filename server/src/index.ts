import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requireAuth } from "./middleware/requireAuth";
import checkIdRouter from "./routes/checkId";
import healthRouter from "./routes/health";
import offerTripsRouter from "./routes/offerTrips";
import paymentsRouter from "./routes/payments";
import ridesRouter from "./routes/rides";
import sosRouter from "./routes/sos";

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const app = express();
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use(express.json({ limit: "32kb" }));

app.use("/api/health", healthRouter);
app.use("/api/check-id", requireAuth, checkIdRouter);
app.use("/api/offer-trip", offerTripsRouter);
app.use("/api/rides", requireAuth, ridesRouter);
app.use("/api/sos", requireAuth, sosRouter);
app.use("/api/payments", requireAuth, paymentsRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`Lyft API listening on port ${port}`);
});