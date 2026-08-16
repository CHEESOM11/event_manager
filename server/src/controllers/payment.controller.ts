import { Request, Response } from "express";
import axios from "axios";
import { AuthenticationRequest } from "../middleware/auth.middleware";
import prisma from "../config/prisma";
import { randomUUID } from "crypto";
import { sendTicketConfirmationEmail } from "../services/email.service";

export const initializePayment = async (
  req: AuthenticationRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const { email, amount, eventId, quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!email || !amount || !eventId || !quantity) {
      return res.status(400).json({
        message: "Email, amount, eventId and quantity are required",
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

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(Number(amount) * 100),
        metadata: {
          userId,
          eventId,
          quantity,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(200).json({
      message: "Payment initialized successfully",
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    });
  } catch (error: any) {
    console.error(
      "Payment initialization error:",
      error.response?.data || error.message,
    );

    return res.status(500).json({
      message: "Failed to initialize payment",
    });
  }
};


export const verifyPayment = async (
  req: Request<{ reference: string }>,
  res: Response
) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: "Payment reference is required" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status !== "success") {
      return res.status(400).json({
        message: "Payment was not successful",
        status: paymentData.status,
      });
    }

    const metadata = paymentData.metadata || {};
    const userId = metadata.userId as string | undefined;
    const eventId = metadata.eventId as string | undefined;
    const quantity = Number(metadata.quantity ?? 0);

    if (!userId || !eventId || quantity <= 0) {
      return res.status(400).json({
        message: "Payment metadata is incomplete or invalid",
      });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const ticketPrice = Number(event.ticketPrice);
    const expectedAmount = ticketPrice * quantity;

    if (Number(paymentData.amount) !== expectedAmount * 100) {
      return res.status(400).json({
        message: "Payment amount does not match ticket amount",
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { reference },
    });

    if (existingPayment) {
      return res.status(200).json({
        message: "Payment already processed",
        payment: existingPayment,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          reference,
          amount: Number(paymentData.amount) / 100,
          currency: paymentData.currency || "NGN",
          status: "SUCCESS",
          userId,
          eventId,
          paidAt: new Date(),
        },
      });

      const tickets = [];
      for (let i = 0; i < quantity; i++) {
        const ticket = await tx.ticket.create({
          data: {
            eventId,
            userId,
            paymentId: payment.id,
            ticketCode: randomUUID(),
            status: "VALID",
          },
        });
        tickets.push(ticket);
      }

      return { payment, tickets };
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (user) {
      try {
        await prisma.notification.create({
          data: {
            userId,
            eventId,
            type: "TICKET_PURCHASED",
            title: "Ticket purchase Successful",
            message: `Your ticket for ${event.title} has been successfully purchased.`,
          },
        });
      } catch (notificationError) {
        console.error("Failed to create purchase notification:", notificationError);
      }

      try {
        for (const ticket of result.tickets) {
          await sendTicketConfirmationEmail({
            email: user.email,
            eventTitle: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            ticketCode: ticket.ticketCode,
            qrCode: ticket.qrCode,
          });
        }
      } catch (emailError) {
        console.error("Ticket confirmation email failed:", emailError);
      }
    }

    return res.status(201).json({
      message: "Payment verified and tickets created successfully",
      payment: result.payment,
      tickets: result.tickets,
    });
  } catch (error: any) {
    console.error("Verify payment error:", error.response?.data || error.message);
    return res.status(500).json({ message: "Failed to verify payment" });
  }
};

