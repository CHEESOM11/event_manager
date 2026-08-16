import dotenv from "dotenv";
import app from "./app";
import express from "express";
import  prisma  from "./config/prisma";
import redisClient from "./config/redis";
import { startEventReminderJob } from "./jobs/eventReminder";

dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 4000;

redisClient.connect().catch((error) => {
  console.error("Redis connection failed:", error);
});
prisma.$connect()
  .then(() => {
    console.log("PostgreSQL connected successfully.");
  })
  .catch((error: unknown) => {
    console.error("Error connecting to PostgreSQL:", error);
  });
app.listen(PORT, () => {
  console.log(`Event Manager server is running on port ${PORT}`);
});

startEventReminderJob();