import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/contact/route.js";
import { validateContact } from "../lib/contact-validation.mjs";

const valid = { username: "Test Visitor", email: "visitor@example.com", phone: "0323-8898732", subject: "Website enquiry", message: "Please discuss my project.\nThank you." };
const request = (data, headers = {}) => new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json", "idempotency-key": "contact-test-12345678", ...headers }, body: JSON.stringify(data) });

test("required fields, malformed values, email, phone and length limits", () => {
  for (const input of [null, {}, { username: 123 }]) assert.equal(Object.keys(validateContact(input).errors).length, 5);
  assert.deepEqual(validateContact(valid).errors, {});
  for (const field of Object.keys(valid)) assert.equal(validateContact({ ...valid, [field]: "  " }).errors[field], "Required");
  assert.ok(validateContact({ ...valid, email: "invalid@" }).errors.email);
  assert.ok(validateContact({ ...valid, subject: "hello\r\nBcc: bad@example.com" }).errors.subject);
  assert.ok(validateContact({ ...valid, phone: "abc123" }).errors.phone);
  assert.ok(validateContact({ ...valid, message: "x".repeat(10001) }).errors.message);
});

test("API rejects invalid input before contacting the email provider", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", () => { throw new Error("Must not send"); });
  assert.equal((await POST(request({}))).status, 400);
  assert.equal((await POST(request({ ...valid, email: "invalid" }))).status, 400);
  assert.equal((await POST(request(valid, { origin: "https://unrelated.example" }))).status, 403);
  assert.equal((await POST(request(valid, { "idempotency-key": "bad" }))).status, 400);
  assert.equal((await POST(request({ message: "x".repeat(65000) }))).status, 413);
  assert.equal((await POST(new Request("http://localhost/api/contact", { method: "POST", body: "not JSON" }))).status, 400);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("provider submission, reply-to, idempotency and safe failures", async (t) => {
  const original = { ...process.env };
  t.after(() => { for (const key of ["RESEND_API_KEY", "CONTACT_EMAIL", "CONTACT_FROM_EMAIL"]) { if (original[key] === undefined) delete process.env[key]; else process.env[key] = original[key]; } });
  delete process.env.RESEND_API_KEY;
  assert.equal((await POST(request(valid))).status, 503);
  process.env.RESEND_API_KEY = "test-only-key";
  process.env.CONTACT_EMAIL = "office@example.com";
  process.env.CONTACT_FROM_EMAIL = "sender@example.com";
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    const email = JSON.parse(options.body);
    assert.deepEqual(email.to, ["office@example.com"]);
    assert.equal(email.reply_to, valid.email);
    assert.equal(email.from, "sender@example.com");
    assert.ok(email.text.includes(valid.message));
    assert.ok(email.text.includes(valid.phone));
    assert.equal(options.headers["Idempotency-Key"], "contact-contact-test-12345678");
    return Response.json({ id: "test-email-id" });
  });
  assert.deepEqual(await (await POST(request(valid))).json(), { success: true });
  fetchMock.mock.mockImplementation(async () => Response.json({ message: "sensitive provider failure" }, { status: 401 }));
  const failure = await POST(request(valid));
  assert.equal(failure.status, 502);
  assert.deepEqual(await failure.json(), { error: "Something went wrong while sending your message. Please try again." });
  fetchMock.mock.mockImplementation(async () => { throw new Error("private details"); });
  assert.equal((await POST(request(valid))).status, 502);
});
