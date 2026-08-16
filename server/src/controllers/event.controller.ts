import { Request,Response } from "express";
import  prisma  from "../config/prisma";
import {AuthenticationRequest} from "../middleware/auth.middleware";
import redisClient from "../config/redis";
import { generateSocialShareLinks } from "../utils/socialShare";

export const createEvent = async (req: AuthenticationRequest, res: Response) => {
  try {
    const {
      title,
      description,
      location,
      startDate,
      endDate,
      ticketPrice,
      currency,
      totalTickets,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !startDate ||
      !endDate ||
      ticketPrice === undefined ||
      !totalTickets
    ) {
      return res.status(400).json({
        message: "All event fields are required",
      });
    }

    const eventStartDate = new Date(startDate);
    const eventEndDate = new Date(endDate);

    if (
      isNaN(eventStartDate.getTime()) ||
      isNaN(eventEndDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid event date",
      });
    }

    if (eventEndDate <= eventStartDate) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    if (Number(ticketPrice) < 0) {
      return res.status(400).json({
        message: "Ticket price cannot be negative",
      });
    }

    if (Number(totalTickets) <= 0) {
      return res.status(400).json({
        message: "Total tickets must be greater than zero",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const event = await prisma.event.create({
      data: {
        creatorId: req.user.userId,
        title,
        description,
        location,
        startDate: eventStartDate,
        endDate: eventEndDate,
        ticketPrice: Number(ticketPrice),
        currency: currency || "NGN",
        totalTickets: Number(totalTickets),
      },
    });

    await redisClient.del("events:all");

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      message: "Failed to create event",
    });
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response
) => {
  try {
    const cacheKey = "events:all";

    // Check Redis first
    const cachedEvents = await redisClient.get(cacheKey);

    if (cachedEvents) {
      return res.status(200).json({
        message: "Events retrieved successfully",
        events: JSON.parse(cachedEvents),
        source: "cache",
      });
    }

    // If not cached, query PostgreSQL
    const events = await prisma.event.findMany();

    // Store in Redis for 60 seconds
    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(events)
    );

    return res.status(200).json({
      message: "Events retrieved successfully",
      events,
      source: "database",
    });
  } catch (error) {
    console.error("Get all events error:", error);

    return res.status(500).json({
      message: "Failed to retrieve events",
    });
  }
};

export const getEventById = async (
  req: Request,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;

    const cacheKey = `event:${eventId}`;

    // Check Redis
    const cachedEvent = await redisClient.get(cacheKey);

    if (cachedEvent) {
      return res.status(200).json({
        message: "Event retrieved successfully",
        event: JSON.parse(cachedEvent),
        source: "cache",
      });
    }

    // Query database
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

    // Cache for 60 seconds
    await redisClient.setEx(
      cacheKey,
      60,
      JSON.stringify(event)
    );

    return res.status(200).json({
      message: "Event retrieved successfully",
      event,
      source: "database",
    });
  } catch (error) {
    console.error("Get event error:", error);

    return res.status(500).json({
      message: "Failed to retrieve event",
    });
  }
};

export const updateEvent = async (req: AuthenticationRequest, res: Response) => {
  try {
    const  id  = req.params.id as string;
    const userId = req.user?.userId;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Make sure the logged-in creator owns this event
    if (event.creatorId !== userId) {
      return res.status(403).json({
        message: "You can only update your own events",
      });
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      ticketPrice,
      currency,
      totalTickets,
    } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(ticketPrice !== undefined && { ticketPrice }),
        ...(currency !== undefined && { currency }),
        ...(totalTickets !== undefined && { totalTickets }),
      },
    });

    await redisClient.del(`event:${id}`);
    await redisClient.del("events:all");

    return res.status(200).json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);

    return res.status(500).json({
      message: "Failed to update event",
    });
  }
};

export const getMyEvents = async (req: AuthenticationRequest, res: Response) => {
    try { 
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const events =await prisma.event.findMany({
            where: {
                creatorId: userId
            }
        });

        return res.status(200).json({
            message: "Your events retrieved successfully",
            events
        });

    } catch (error) {
        console.error("Getting my events:", error);

        return res.status(500).json({
            message: "Failed to retrieve your events"
        });
    }
};

export const cancelEvent = async (
  req: AuthenticationRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (event.creatorId !== userId) {
      return res.status(403).json({
        message: "You can only cancel your own events",
      });
    }

    const cancelledEvent = await prisma.event.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return res.status(200).json({
      message: "Event cancelled successfully",
      event: cancelledEvent,
    });
  } catch (error) {
    console.error("Cancel event error:", error);

    return res.status(500).json({
      message: "Failed to cancel event",
    });
  }
};

export const getEventShareLinks = async (
  req: Request,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;

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

    const eventUrl = `${process.env.FRONTEND_URL}/events/${event.id}`;

    const shareLinks = generateSocialShareLinks(
      event.id,
      event.title,
      eventUrl
    );

    return res.status(200).json({
      message: "Event sharing links generated successfully",
      event: {
        id: event.id,
        title: event.title,
      },
      shareLinks,
    });
  } catch (error) {
    console.error("Social sharing error:", error);

    return res.status(500).json({
      message: "Failed to generate social sharing links",
    });
  }
};