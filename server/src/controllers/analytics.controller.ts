import { Request, Response } from "express";
import prisma from "../config/prisma";
import redisClient from "../config/redis";

export const getEventAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;

    const cacheKey = `analytics:event:${eventId}`;

    // First check Redis
    const cachedAnalytics = await redisClient.get(cacheKey);

    if (cachedAnalytics) {
        return res.status(200).json({
            message: "Event analytics retrieved successfully",
            analytics: JSON.parse(cachedAnalytics),
            source: "cache",
        });
    }

    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const totalTickets = await prisma.ticket.count({
      where: {
        eventId,
      },
    });

    const usedTickets = await prisma.ticket.count({
      where: {
        eventId,
        status: "USED",
      },
    });

    const validTickets = await prisma.ticket.count({
      where: {
        eventId,
        status: "VALID",
      },
    });

    const cancelledTickets = await prisma.ticket.count({
      where: {
        eventId,
        status: "CANCELLED",
      },
    });

    const revenue = await prisma.payment.aggregate({
      where: {
        eventId,
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    });

    const remainingTickets = event.totalTickets - totalTickets;

    const analytics = {
        eventId: event.id,
        eventName: event.title,
        totalTickets: event.totalTickets,
        ticketsSold: totalTickets,
        ticketsUsed: usedTickets,
        ticketsValid: validTickets,
        ticketsCancelled: cancelledTickets,
        ticketsRemaining: remainingTickets,
        totalRevenue: Number(revenue._sum.amount || 0),
    };
    // Cache for 60 seconds
    await redisClient.setEx(
        cacheKey,
        60,
        JSON.stringify(analytics)
    );

    return res.status(200).json({
        message: " Event analytics retrieved successfully",
        analytics,
        source: "database",
    });
  } catch (error) {
    console.error("Analytics error:", error);

    return res.status(500).json({
      message: "Failed to retrieve event analytics",
    });
  }
};