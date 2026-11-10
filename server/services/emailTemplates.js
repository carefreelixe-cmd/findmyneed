const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const layout = ({
  eyebrow,
  title,
  body,
  action,
  actionUrl,
  footer,
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f5f4ed;color:#17231c;font-family:Arial,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f4ed;padding:32px 12px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e4e4dc">
          <tr><td style="background:#173c2b;padding:26px 32px;color:#ffffff;font-size:22px;font-weight:800">findmy<span style="color:#d9f99d">need</span></td></tr>
          <tr><td style="padding:36px 32px">
            <div style="color:#246c49;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase">${escapeHtml(eyebrow)}</div>
            <h1 style="margin:12px 0 16px;font-size:32px;line-height:1.15;color:#17231c">${escapeHtml(title)}</h1>
            <div style="font-size:16px;line-height:1.7;color:#526057">${body}</div>
            ${
              action && actionUrl
                ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#e85d3f;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:800">${escapeHtml(action)}</a></p>`
                : ""
            }
          </td></tr>
          <tr><td style="padding:22px 32px;background:#eef7ea;color:#526057;font-size:12px;line-height:1.6">${escapeHtml(footer || "You received this transactional message because of activity on your FindMyNeed account.")}</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const templates = {
  welcome: (data) => ({
    subject: "Welcome to FindMyNeed",
    html: layout({
      eyebrow: "Account created",
      title: `Welcome, ${data.firstName || "there"}`,
      body: "Your account is ready. You can now compare verified local professionals, request services and manage bookings in one place.",
      action: "Open your dashboard",
      actionUrl: data.dashboardUrl,
    }),
  }),
  provider_pending: (data) => ({
    subject: "We received your professional application",
    html: layout({
      eyebrow: "Application received",
      title: "Your verification is in progress",
      body: "Our team will review your business information. We will notify you as soon as your professional account is approved.",
      action: "View application",
      actionUrl: data.dashboardUrl,
    }),
  }),
  booking_requested: (data) => ({
    subject: `New booking request${data.customerName ? ` from ${data.customerName}` : ""}`,
    html: layout({
      eyebrow: "New booking",
      title: "A customer needs your service",
      body: `A new request has been added to your provider dashboard${data.bookingDate ? ` for <strong>${escapeHtml(data.bookingDate)}</strong>` : ""}. Review the details and respond promptly.`,
      action: "Review booking",
      actionUrl: data.dashboardUrl,
    }),
  }),
  booking_confirmed: (data) => ({
    subject: "Your FindMyNeed booking is confirmed",
    html: layout({
      eyebrow: "Booking confirmed",
      title: "Your professional is booked",
      body: `${escapeHtml(data.providerName || "Your service provider")} confirmed your request${data.bookingDate ? ` for <strong>${escapeHtml(data.bookingDate)}</strong>` : ""}.`,
      action: "View booking",
      actionUrl: data.dashboardUrl,
    }),
  }),
  booking_status: (data) => ({
    subject: `Booking update: ${data.status || "status changed"}`,
    html: layout({
      eyebrow: "Booking update",
      title: `Your booking is now ${data.status || "updated"}`,
      body: "Open your dashboard for the latest appointment details and messages from your professional.",
      action: "View booking",
      actionUrl: data.dashboardUrl,
    }),
  }),
  password_reset: (data) => ({
    subject: "Reset your FindMyNeed password",
    html: layout({
      eyebrow: "Security request",
      title: "Reset your password",
      body: "Use the secure button below to choose a new password. If you did not request this, you can safely ignore this email.",
      action: "Reset password",
      actionUrl: data.resetUrl,
      footer:
        "For your security, the reset link expires shortly and can only be used once.",
    }),
  }),
  provider_approved: (data) => ({
    subject: "Your FindMyNeed professional profile is approved",
    html: layout({
      eyebrow: "Profile approved",
      title: "You can now receive bookings",
      body: "Your professional profile is live. Add services, prices, service areas and availability to start receiving customer requests.",
      action: "Complete your profile",
      actionUrl: data.dashboardUrl,
    }),
  }),
  general: (data) => ({
    subject: data.subject || "A message from FindMyNeed",
    html: layout({
      eyebrow: data.eyebrow || "FindMyNeed update",
      title: data.title || data.subject || "Account update",
      body: escapeHtml(
        data.message || "There is a new update on your account.",
      ),
      action: data.action,
      actionUrl: data.actionUrl,
    }),
  }),
};

export const renderEmail = (templateKey, data = {}) => {
  const renderer = templates[templateKey] || templates.general;
  const rendered = renderer(data);
  return {
    ...rendered,
    text: rendered.html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  };
};

export const availableEmailTemplates = Object.keys(templates);
