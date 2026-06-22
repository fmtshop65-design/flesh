export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Worker is active. Please submit the contact form.", {
        status: 200,
        headers: corsHeaders,
      });
    }

    try {
      // Accept BOTH JSON (this site's form) and classic form-data.
      let data = {};
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        const fd = await request.formData();
        data = {
          name: fd.get("name"),
          email: fd.get("email"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          website: fd.get("website"),
        };
      }

      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const message = String(data.message || "").trim();
      const website = String(data.website || "").trim(); // honeypot
      const subject =
        String(data.subject || "").trim() ||
        `RENUMB FLESH inquiry from ${name || "website"}`;

      // Honeypot: a real visitor leaves "website" empty. If it's filled,
      // it's a bot — pretend success and silently drop it.
      if (website) {
        return new Response("Message sent successfully.", {
          status: 200,
          headers: corsHeaders,
        });
      }

      if (!name || !email || !message) {
        return new Response("Missing required fields.", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response("Please enter a valid email address.", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // CHANGE these two lines if needed:
          from: "FLESH Tattoo Supply Website <info@flesh-tattoo.com>",
          to: ["farhadmirzaee65@gmail.com"],
          subject: `New Contact Form Message: ${subject}`,
          reply_to: `${name} <${email}>`,
          text:
            `New contact form submission from flesh-tattoo.com\n\n` +
            `Name: ${name}\n` +
            `Email: ${email}\n` +
            `Subject: ${subject}\n\n` +
            `Message:\n${message}`,
        }),
      });

      const resendText = await resendResponse.text();

      if (!resendResponse.ok) {
        return new Response("MAIL_ERROR: " + resendText, {
          status: 500,
          headers: corsHeaders,
        });
      }

      return new Response("Message sent successfully.", {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error) {
      return new Response("WORKER_ERROR: " + error.message, {
        status: 500,
        headers: corsHeaders,
      });
    }
  },
};
