import cron from "node-cron";
import prisma from "../config/prisma";
import { sendEventReminderEmail } from "../services/email.service";

export const startEventReminderJob = () => {
  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Checking for event reminders...");

      const now = new Date();

      // Time windows
      const twentyFourHoursFromNow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000,
      );

      const twentyFiveHoursFromNow = new Date(
        now.getTime() + 25 * 60 * 60 * 1000,
      );

      const sixDaysTwentyThreeHoursFromNow = new Date(
        now.getTime() + (6 * 24 + 23) * 60 * 60 * 1000,
      );

      const sevenDaysFromNow = new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000,
      );

      // Find events that need either:
      // 1. 24-hour reminder
      // 2. 1-week reminder
      const upcomingEvents = await prisma.event.findMany({
        where: {
          OR: [
            {
              startDate: {
                gte: twentyFourHoursFromNow,
                lte: twentyFiveHoursFromNow,
              },
            },
            {
              startDate: {
                gte: sixDaysTwentyThreeHoursFromNow,
                lte: sevenDaysFromNow,
              },
            },
          ],
        },
      });

      if (upcomingEvents.length === 0) {
        console.log("No events require reminders.");
        return;
      }

      for (const event of upcomingEvents) {
        const eventTime = event.startDate.getTime();
        const nowTime = now.getTime();

        const hoursUntilEvent = (eventTime - nowTime) / (1000 * 60 * 60);

        let reminderTitle: string;
        let reminderMessage: string;

        // 24-hour reminder
        if (hoursUntilEvent >= 24 && hoursUntilEvent <= 25) {
          reminderTitle = "Event Tomorrow";

          reminderMessage = `Reminder: ${event.title} starts tomorrow.`;
        }

        // 1-week reminder
        else if (hoursUntilEvent >= 167 && hoursUntilEvent <= 168) {
          reminderTitle = "Event Reminder";

          reminderMessage = `Reminder: ${event.title} is happening in one week.`;
        } else {
          continue;
        }

        // Get users who purchased tickets for this event
        const tickets = await prisma.ticket.findMany({
          where: {
            eventId: event.id,
          },
          select: {
            userId: true,
          },
        });

        // Remove duplicate users
        const userIds = [...new Set(tickets.map((ticket) => ticket.userId))];

        for (const userId of userIds) {
          const user = await prisma.user.findUnique({
            where: {
              id: userId,
            },
          });

          if (!user) {
            continue;
          }
          // Prevent duplicate reminders
          const existingReminder = await prisma.notification.findFirst({
            where: {
              userId,
              eventId: event.id,
              type: "EVENT_REMINDER",
              title: reminderTitle,
            },
          });

          if (existingReminder) {
            continue;
          }

          await prisma.notification.create({
            data: {
              userId,
              eventId: event.id,
              type: "EVENT_REMINDER",
              title: reminderTitle,
              message: reminderMessage,
            },
          });

          try {
            await sendEventReminderEmail({
              email: user.email,
              eventTitle: event.title,
              startDate: event.startDate,
              reminderTitle,
              reminderMessage,
            });
          } catch (emailError) {
            console.error(
              "Event reminder email could not be sent:",
              emailError,
            );
          }
          console.log(
            `Reminder created for user ${userId} for event "${event.title}"`,
          );
        }
      }

      console.log("Event reminder check completed.");
    } catch (error) {
      console.error("Event reminder job error:", error);
    }
  });

  console.log("Event reminder job started");
};
