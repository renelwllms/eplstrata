import FormData from "form-data";
import Mailgun from "mailgun.js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const requiredFields = ["name", "email", "interest"] as const;

export async function POST(request: NextRequest) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  for (const field of requiredFields) {
    if (!payload[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}.` },
        { status: 400 }
      );
    }
  }

  const mailgun = new Mailgun(FormData);
  const client = mailgun.client({
    username: "api",
    key: apiKey,
    url: process.env.MAILGUN_BASE_URL || undefined,
  });

  const from =
    process.env.MAILGUN_FROM || `Strata Website <postmaster@${domain}>`;
  const to = (process.env.MAILGUN_TO || "support@edgepoint.co.nz")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const subject = `New Strata enquiry: ${payload.interest}`;

  const details = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.company ? `Company: ${payload.company}` : null,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.teamSize ? `Team size: ${payload.teamSize}` : null,
    payload.message ? `Message: ${payload.message}` : null,
  ].filter(Boolean);

  const text = details.join("\n");

  const html = `
    <h2>New Strata Contact Request</h2>
    <ul>
      ${details.map((line) => `<li>${line}</li>`).join("")}
    </ul>
  `;

  try {
    await client.messages.create(domain, {
      from,
      to,
      subject,
      text,
      html,
      "h:Reply-To": payload.email,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to send message." },
      { status: 500 }
    );
  }
}
