import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import ticketRoutes from "./routes/ticket.routes";
import paymentRoutes from "./routes/payment.routes";
import qrRoutes from "./routes/qr.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { apiRateLimiter } from "./middleware/rateLimiter";
import notificationRoutes from "./routes/notification.routes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(apiRateLimiter);

app.get("/", (_req, res) => {
    res.json({
        message: "Welcome to Event Manager API"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);


export default app;