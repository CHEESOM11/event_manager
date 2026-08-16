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

describe("Events API", () => {
  describe("GET /api/events", () => {
    it("should return events successfully", async () => {
      const response = await request(app).get("/api/events");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("events");
    });
  });

  describe("GET /api/events/:id", () => {
    it("should return 404 for a non-existent event", async () => {
      const response = await request(app).get(
        "/api/events/00000000-0000-0000-0000-000000000000",
      );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        message: "Event not found",
      });
    });
  });

  describe("POST /api/events", () => {
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

  describe("GET /api/events/my-events", () => {
    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/api/events/my-events");

      expect(response.status).toBe(401);
    });
  });
});
