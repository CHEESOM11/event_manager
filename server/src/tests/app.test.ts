import request from "supertest";
import app from "../app";
import redisClient from "../config/redis";

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
});
afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("Event Manager API", () => {
  describe("GET /", () => {
    it("should return the welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        message: "Welcome to Event Manager API",
      });
    });
  });

  describe("Authentication", () => {
    it("should reject registration when required fields are missing", async () => {
      const response = await request(app).post("/api/auth/register").send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe("Protected events", () => {
    it("should reject unauthenticated event creation", async () => {
      const response = await request(app).post("/api/events").send({
        title: "Test Event",
        description: "Test event description",
        startDate: "2026-12-01T10:00:00.000Z",
        endDate: "2026-12-01T18:00:00.000Z",
        location: "Lagos",
        totalTickets: 100,
        ticketPrice: 5000,
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Protected notifications", () => {
    it("should reject unauthenticated notification requests", async () => {
      const response = await request(app).get("/api/notifications");

      expect(response.status).toBe(401);
    });
  });

  describe("Events", () => {
    it("should return events successfully", async () => {
      const response = await request(app).get("/api/events");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("events");
    });
  });

  describe("Notifications", () => {
    it("should reject marking a notification as read without authentication", async () => {
      const response = await request(app).patch(
        "/api/notifications/test-id/read",
      );

      expect(response.status).toBe(401);
    });
  });
});
