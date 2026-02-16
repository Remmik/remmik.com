import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 3;
const MIN_SUBMIT_TIME = 3000; // 3 seconds — reject instant submissions

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, website, loadedAt } = body as {
    name?: string;
    email?: string;
    message?: string;
    website?: string;
    loadedAt?: number;
  };

  // Honeypot check
  if (website) {
    // Silently accept — don't reveal the honeypot to bots
    return NextResponse.json({ ok: true });
  }

  // Timing check
  if (typeof loadedAt === "number" && Date.now() - loadedAt < MIN_SUBMIT_TIME) {
    return NextResponse.json({ ok: true }); // silent reject
  }

  // Validation
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email?.trim() || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 }
    );
  }
  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 }
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  // Send via Resend if API key is configured
  const resendKey = process.env.RESEND_API_KEY;
  const recipientEmail = process.env.CONTACT_EMAIL ?? "allan@remmik.com";

  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Remmik.com <contact@remmik.com>",
        to: recipientEmail,
        subject: `Contact form: ${trimmedName}`,
        text: [
          `Name: ${trimmedName}`,
          `Email: ${trimmedEmail}`,
          ``,
          trimmedMessage,
        ].join("\n"),
        replyTo: trimmedEmail,
      });
    } catch (err) {
      console.error("Resend error:", err);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }
  } else {
    // Dev mode — just log the submission
    console.log("Contact form submission (no RESEND_API_KEY):", {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });
  }

  return NextResponse.json({ ok: true });
}
