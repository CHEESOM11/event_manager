import { Response } from "express";
import  prisma  from "../config/prisma";
import { AuthenticationRequest } from "../middleware/auth.middleware";

export const createTicket = async (
  req: AuthenticationRequest,
  res: Response
) => {
  try {
    const eventId = req.params.id as string;
    const userId = req.user?.userId;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        message: "Quantity must be greater than zero",
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

    // Count tickets already purchased for this event
    const ticketsSold = await prisma.ticket.count({
      where: {
        eventId,
      },
    });

    const availableTickets = event.totalTickets - ticketsSold;

    if (quantity > availableTickets) {
      return res.status(400).json({
        message: "Not enough tickets available",
        availableTickets,
      });
    }

    const totalAmount = Number(event.ticketPrice) * quantity;

    return res.status(200).json({
      message: "Ticket order ready for payment",
      eventId,
      userId,
      quantity,
      ticketPrice: event.ticketPrice,
      totalAmount,
      currency: event.currency,
    });
  } catch (error) {
    console.error("Create ticket error:", error);

    return res.status(500).json({
      message: "Failed to create ticket order",
    });
  }
};

export const getMyTickets = async (
  req: AuthenticationRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userId,
      },
    });

    return res.status(200).json({
      message: "Tickets retrieved successfully",
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      message: "Failed to retrieve tickets",
    });
  }
};