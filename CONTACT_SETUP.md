Contact form setup
==================

Copy `.env.example` to `.env.local` for local development and set:

- `RESEND_API_KEY`: your server-side Resend API key.
- `CONTACT_EMAIL`: `mansoorisworking@gmail.com` (recipient).
- `CONTACT_FROM_EMAIL`: an email address on your verified Resend sending domain, optionally `MooAssist <contact@your-verified-domain>`.

Never prefix these variables with `NEXT_PUBLIC_` or commit `.env.local`.
Restart the local server after changing environment variables.

For Netlify, add the same three variables in the site's environment settings,
make them available to Functions, and redeploy. Use Netlify's Next.js runtime;
this form needs the `/api/contact` server route and cannot run as a static export.

The form validates all five fields in the browser and again on the server. The
server sends plain-text mail through Resend with the visitor's email as reply-to.
The button remains disabled while sending; retries of an unchanged payload use
the same Resend idempotency key. Provider acceptance redirects to `/thank-you`.
Failures retain the form values and show a generic error. Provider acceptance
does not by itself confirm inbox delivery.

Run `node --test tests/contact.test.mjs` for validation and API tests. These tests
mock the email provider and do not send email. Run `npm run build` for production
validation. After configuring the credentials, submit a controlled test and
confirm receipt in the company inbox and delivery status in Resend.

Resend API reference: https://resend.com/docs/api-reference/emails/send-email
