import transporter from "../config/mailer";

interface TicketEmailData {
  email: string;
  eventTitle: string;
  startDate: Date;
  endDate: Date;
  ticketCode: string;
  qrCode?: string | null;
}

export const sendTicketConfirmationEmail = async (
  data: TicketEmailData
) => {
  await transporter.sendMail({
    from: `"Event Manager" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `Ticket Confirmation - ${data.eventTitle}`,
    html: `
      <h2>Ticket Purchase Successful 🎟️</h2>

      <p>Your ticket has been successfully purchased.</p>

      <h3>${data.eventTitle}</h3>

      <p>
        <strong>Start:</strong>
        ${data.startDate.toLocaleString()}
      </p>

      <p>
        <strong>End:</strong>
        ${data.endDate.toLocaleString()}
      </p>

      <p>
        <strong>Ticket Code:</strong>
        ${data.ticketCode}
      </p>

      ${
        data.qrCode
          ? `
            <p>Your QR code is available with your ticket.</p>
            <img
              src="${data.qrCode}"
              alt="Ticket QR Code"
              width="200"
            />
          `
          : ""
      }

      <p>
        Please keep this email and your ticket safe.
      </p>

      <p>Thank you for using Event Manager.</p>
    `,
  });
};

interface EventReminderEmailData {
  email: string;
  eventTitle: string;
  startDate: Date;
  reminderTitle: string;
  reminderMessage: string;
}

export const sendEventReminderEmail = async (
  data: EventReminderEmailData
) => {
  await transporter.sendMail({
    from: `"Event Manager" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `${data.reminderTitle} - ${data.eventTitle}`,
    html: `
      <h2>${data.reminderTitle}</h2>

      <p>${data.reminderMessage}</p>

      <h3>${data.eventTitle}</h3>

      <p>
        <strong>Event starts:</strong>
        ${data.startDate.toLocaleString()}
      </p>

      <p>
        Please be prepared for the event.
      </p>

      <p>Thank you for using Event Manager.</p>
    `,
  });
};