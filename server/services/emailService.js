import nodemailer from "nodemailer";
import { query } from "../config/database.js";
import { renderEmail } from "./emailTemplates.js";

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    throw new Error("SMTP is not configured");
  }

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    pool: true,
    maxConnections: Number(process.env.EMAIL_MAX_CONNECTIONS || 5),
    maxMessages: Number(process.env.EMAIL_MAX_MESSAGES || 100),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  return transporter;
};

export const sendNotificationEmail = async ({
  notificationId,
  templateKey,
  data,
}) => {
  const result = await query(
    `SELECT n.id, n.subject, n.message, u.email, u.first_name
     FROM notifications n
     JOIN users u ON u.id = n.user_id
     WHERE n.id = $1 AND n.deleted_at IS NULL`,
    [notificationId],
  );

  if (result.rowCount === 0)
    throw new Error("Notification recipient not found");

  const notification = result.rows[0];
  const email = renderEmail(templateKey || "general", {
    firstName: notification.first_name,
    subject: notification.subject,
    message: notification.message,
    ...data,
  });

  if (process.env.EMAIL_DELIVERY_ENABLED !== "true") {
    console.log(
      `Email preview: ${templateKey || "general"} -> ${notification.email}`,
    );
    return { preview: true };
  }

  const info = await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: notification.email,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });

  await query(
    "UPDATE notifications SET sent_at = CURRENT_TIMESTAMP WHERE id = $1",
    [notificationId],
  );
  return { messageId: info.messageId };
};

export const closeEmailTransport = async () => {
  transporter?.close();
};
