import { Request, Response } from "express";
import QRCode from "qrcode";
import prisma from "../config/prisma";
import { AuthenticationRequest } from "../middleware/auth.middleware";

export const getTicketQRCode = async (
  req: Request,
  res: Response
) => {
  try {
    const  ticketCode  = req.params.ticketCode as string;

    if (!ticketCode) {
      return res.status(400).json({
        message: "Ticket code is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketCode,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const qrCode = await QRCode.toDataURL(ticket.ticketCode);

    return res.status(200).json({
      message: "QR code generated successfully",
      ticketCode: ticket.ticketCode,
      qrCode,
    });
  } catch (error) {
    console.error("QR code generation error:", error);

    return res.status(500).json({
      message: "Failed to generate QR code",
    });
  }
};

export const verifyTicket = async (
  req: AuthenticationRequest,
  res: Response
) => {
  try {
    const ticketCode = req.params.ticketCode as string;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ticketCode) {
      return res.status(400).json({
        message: "Ticket code is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketCode,
      },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Make sure the person scanning the ticket created the event
    if (ticket.event.creatorId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to verify this ticket",
      });
    }

    // Prevent reuse
    if (ticket.status === "USED") {
      return res.status(400).json({
        message: "Ticket has already been used",
      });
    }

    if (ticket.status === "CANCELLED") {
      return res.status(400).json({
        message: "Ticket has been cancelled",
      });
    }

    let qrCode = ticket.qrCode

    if (!qrCode) {
        qrCode = await QRCode.toDataURL(ticket.ticketCode);
    }
    
    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: {
        ticketCode,
      },
      data: {
        status: "USED",
        qrCode,
        scannedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Ticket verified successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Ticket verification error:", error);

    return res.status(500).json({
      message: "Failed to verify ticket",
    });
  }
};

export const scanQRCode = async (
  req: AuthenticationRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { ticketCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ticketCode) {
      return res.status(400).json({
        message: "Ticket code is required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketCode,
      },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Invalid ticket",
      });
    }

    
    if (ticket.event.creatorId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to scan this ticket",
      });
    }

    if (ticket.status === "USED") {
      return res.status(400).json({
        message: "Ticket has already been used",
        ticket,
      });
    }

    if (ticket.status === "CANCELLED") {
      return res.status(400).json({
        message: "Ticket has been cancelled",
        ticket,
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: {
        ticketCode,
      },
      data: {
        status: "USED",
        scannedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "QR code scanned and ticket verified successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("QR scan error:", error);

    return res.status(500).json({
      message: "Failed to scan QR code",
    });
  }
};