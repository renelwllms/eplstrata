import nodemailer from "nodemailer";
import FormData from "form-data";
import Mailgun from "mailgun.js";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

let transporter: nodemailer.Transporter | null = null;
let mailgunClient: ReturnType<Mailgun["client"]> | null = null;

function buildTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  return transporter;
}

function buildMailgun() {
  if (mailgunClient) {
    return mailgunClient;
  }

  const apiKey = process.env.MAILGUN_API_KEY;
  if (!apiKey) {
    return null;
  }

  const mailgun = new Mailgun(FormData);
  mailgunClient = mailgun.client({
    username: "api",
    key: apiKey,
    url: process.env.MAILGUN_BASE_URL || undefined
  });

  return mailgunClient;
}

export async function sendEmail(payload: MailPayload) {
  const mailgunDomain = process.env.MAILGUN_DOMAIN;
  const mailgunFrom =
    process.env.MAILGUN_FROM ?? "Strata <no-reply@edgepoint.co.nz>";
  const mailgun = buildMailgun();

  if (mailgun && mailgunDomain) {
    try {
      await mailgun.messages.create(mailgunDomain, {
        from: mailgunFrom,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
        "h:Reply-To": payload.replyTo
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Mailgun send failed"
      };
    }
  }

  const from = process.env.SMTP_FROM ?? "no-reply@edgepoint.co.nz";
  const transport = buildTransporter();

  if (!transport) {
    return { ok: false, error: "Email not configured" };
  }

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html
  });

  return { ok: true };
}
