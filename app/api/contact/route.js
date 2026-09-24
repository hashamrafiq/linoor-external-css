import { validateContact } from "../../../lib/contact-validation.mjs";

export const runtime = "nodejs";
const failure = "Something went wrong while sending your message. Please try again.";

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: failure }, { status: 403 });
  let input;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).length > 64000) return Response.json({ error: "Your message is too long. Please shorten it and try again." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return Response.json({ error: "Please check your details and try again." }, { status: 400 });
  }
  const { values, errors } = validateContact(input);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });
  const key = request.headers.get("idempotency-key");
  if (!key || !/^[a-zA-Z0-9-]{16,100}$/.test(key)) return Response.json({ error: failure }, { status: 400 });
  const { RESEND_API_KEY, CONTACT_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_EMAIL || !CONTACT_FROM_EMAIL) return Response.json({ error: failure }, { status: 503 });
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `contact-${key}` },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: values.email,
        subject: `Website enquiry: ${values.subject}`,
        text: `Name: ${values.username}\n\nEmail: ${values.email}\n\nPhone: ${values.phone}\n\nSubject: ${values.subject}\n\nMessage:\n${values.message}`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return Response.json({ error: failure }, { status: 502 });
    const result = await response.json();
    if (!result.id) return Response.json({ error: failure }, { status: 502 });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: failure }, { status: 502 });
  }
}
