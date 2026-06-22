================================================================
RENUMB FLESH — Website files
Professional tattoo numbing — cream, spray & dropper
Domain: flesh-tattoo.com
================================================================

This is the same design and structure you approved (dark chrome /
metallic, Cinzel + Jost), with this round of fixes and additions.
Nothing was removed — only fixed, optimized, and extended.

----------------------------------------------------------------
WHAT CHANGED IN THIS UPDATE
----------------------------------------------------------------
1. MOBILE
   - Mobile layout now works on EVERY page (Spray, Dropper, Contact
     and Blog previously had no mobile styling — fixed).
   - The hamburger menu works on all pages.
   - A new shared stylesheet, site.css, keeps all pages consistent.

2. TRANSLATIONS
   - The translation engine now also translates placeholder / content /
     aria attributes, and if a key is ever missing it keeps the
     existing text instead of showing the raw key name.
   - All FAQ, blog and contact-form text is translated in all 7
     languages (EN, RU, ES, TR, PT, FR, DE).

3. SPEED & THE MOBILE "PLAY" ICON
   - Background video re-encoded: 5.6 MB  ->  ~2.1 MB.
   - product-float.png and all photos optimized.
   - New site.js: on phones the video is NOT downloaded at all — the
     poster image shows instantly. This removes the mobile play-button
     overlay AND makes the first load much faster. On desktop the video
     plays and falls back to the poster if autoplay is blocked.

4. ANTI-INSPECT
   - Right-click and F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C /
     Ctrl+U are disabled (already present; kept on every page incl. new
     articles).
   - NOTE: this is a deterrent only. It discourages casual copying but
     cannot truly stop a determined visitor (browser menus, the
     "view-source:" URL, or disabling JavaScript all bypass it). To turn
     it off later, remove the first inline <script> block on each page.

5. SEO  (the main goal — for flesh-tattoo.com)
   - Meta description / keywords / robots / canonical on every page.
   - Open Graph + Twitter cards (a dedicated 1200x630 share image,
     og-image.jpg, was generated for the brand).
   - JSON-LD structured data: Organization, WebSite, FAQPage, and
     BlogPosting on each article.
   - Favicons added (favicon.ico + PNG sizes + apple-touch-icon) and a
     web app manifest (site.webmanifest).
   - robots.txt + sitemap.xml (now includes the blog articles).

6. FAQ
   - The home page has an FAQ section (accordion) wired to FAQPage
     schema — good for Google and for AI answers.

7. BLOG
   - blog.html plus 3 full articles:
       blog-choosing-numbing-cream.html
       blog-spray-cream-dropper.html
       blog-eac-certification.html
   - The "Read Article" buttons now link to those pages.

8. CONTACT FORM -> EMAIL (Cloudflare Worker)   ** action needed **
   - The form can now send straight to your inbox via a Cloudflare
     Worker (no email app pop-up). See the next section to switch it on.
   - Until you set it up, the form safely falls back to opening the
     visitor's email app (the old behaviour), so it always works.

----------------------------------------------------------------
TURN ON THE CONTACT FORM (Cloudflare Worker + Resend)  ~10 min
----------------------------------------------------------------
File: cloudflare-worker.js  (full step-by-step is inside that file)

Short version:
  1. Create a free account at https://resend.com and verify the domain
     flesh-tattoo.com (Resend gives you the DNS records to add).
  2. Cloudflare dashboard -> Workers & Pages -> Create -> Worker.
     Paste cloudflare-worker.js as the code and Deploy.
  3. In the Worker -> Settings -> Variables, add:
        RESEND_API_KEY  (secret)  = your Resend key (re_...)
        TO_EMAIL        (text)    = where you want messages sent
        FROM_EMAIL      (text)    = e.g. contact@flesh-tattoo.com
        ALLOW_ORIGIN    (text)    = https://flesh-tattoo.com
  4. Copy the Worker URL and paste it into contact.html:
        var CONTACT_ENDPOINT = "https://....workers.dev";
     Also update FALLBACK_EMAIL in the same spot to your real address.

----------------------------------------------------------------
GOOGLE SEARCH CONSOLE
----------------------------------------------------------------
  1. Add the property "flesh-tattoo.com" at
     https://search.google.com/search-console
  2. Verification: index.html already has a placeholder tag:
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE">
     Replace YOUR_GOOGLE_VERIFICATION_CODE with the code Google gives
     you (or use DNS verification at your registrar).
  3. Submit the sitemap:  https://flesh-tattoo.com/sitemap.xml

----------------------------------------------------------------
STILL TO FILL IN BY YOU
----------------------------------------------------------------
PRICES: all prices are placeholders "$00". In VS Code press
        Ctrl+Shift+F and search for   >00</span>   then type each price.

CONTACT DETAILS: in contact.html look for the markers and the
        visible text/links — replace the WhatsApp number, the email
        (info@renumbflesh.com) and the Instagram handle (@renumbflesh).
        The same Instagram/email also appear in the JSON-LD and footers.

----------------------------------------------------------------
RUN LOCALLY
----------------------------------------------------------------
Keep all files in one folder, then:
        python3 -m http.server 8000
        open http://localhost:8000
(Opening the files with a double-click can block video autoplay; a
local server or the live host fixes that.)

All files must stay together in one folder.
