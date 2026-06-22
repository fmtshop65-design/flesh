/**
 * RENUMB FLESH — Contact form → email (Cloudflare Worker)
 * ---------------------------------------------------------------
 * Receives the contact form POST from flesh-tattoo.com and emails it
 * to you using Resend (https://resend.com — free tier: 100 emails/day,
 * 3,000/month). No server to run; it lives on Cloudflare's edge.
 *
 *  SETUP (one time, ~10 minutes)
 *  =================================================================
 *  1) Create a free Resend account → https://resend.com
 *  2) Add & verify your domain "flesh-tattoo.com" in Resend
 *     (Resend shows the DNS records to add at your domain registrar).
 *  3) In Cloudflare dashboard → Workers & Pages → Create → Worker.
 *     Name it e.g. "flesh-contact". Paste THIS file as its code & Deploy.
 *  4) In the Worker → Settings → Variables and Secrets, add:
 *        RESEND_API_KEY   (Secret)  → your Resend API key (re_********)
 *        TO_EMAIL         (Text)    → where you want to receive messages
 *                                     e.g. your@gmail.com
 *        FROM_EMAIL       (Text)    → a sender on your verified domain,
 *                                     e.g. contact@flesh-tattoo.com
 *        ALLOW_ORIGIN     (Text)    → https://flesh-tattoo.com
 *                                     (use * while testing, then lock it)
 *  5) Copy the Worker URL (e.g. https://flesh-contact.<you>.workers.dev)
 *     and paste it into contact.html → the CONTACT_ENDPOINT variable.
 *
 *  Tip: once the domain is live you can instead route the Worker at
 *  https://flesh-tattoo.com/api/contact via a Cloudflare route.
 */

export default {
  async fetch(request, env) {
    const ORIGIN = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid request" }, 400, cors);
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();
    const honeypot = String(body.website || "").trim(); // spam trap (must be empty)

    // Silently accept (and ignore) anything that trips the honeypot.
    if (honeypot) return json({ ok: true }, 200, cors);

    // Validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name || name.length > 120) return json({ error: "Invalid name" }, 422, cors);
    if (!emailOk || email.length > 200) return json({ error: "Invalid email" }, 422, cors);
    if (!message || message.length > 5000) return json({ error: "Invalid message" }, 422, cors);

    if (!env.RESEND_API_KEY || !env.TO_EMAIL || !env.FROM_EMAIL) {
      return json({ error: "Server not configured" }, 500, cors);
    }

    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const html =
      `<h2>New RENUMB FLESH inquiry</h2>` +
      `<p><strong>Name:</strong> ${esc(name)}</p>` +
      `<p><strong>Email:</strong> ${esc(email)}</p>` +
      `<p><strong>Message:</strong></p>` +
      `<p style="white-space:pre-wrap">${esc(message)}</p>`;

    const text =
      `New RENUMB FLESH inquiry\n\nName: ${name}\nEmail: ${email}\n\n${message}`;

    // Send through Resend
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `RENUMB FLESH <${env.FROM_EMAIL}>`,
        to: [env.TO_EMAIL],
        reply_to: email,
        subject: `Website inquiry from ${name}`,
        html,
        text,
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      return json({ error: "Email failed", detail }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
