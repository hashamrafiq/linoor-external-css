"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { contactLimits, validateContact } from "@/lib/contact-validation.mjs";

export default function ContactForm() {
  const router = useRouter();
  useEffect(() => {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    const title = button.querySelector(".btn-title");
    const status = form.querySelector(".contact-form-status");
    const originalTitle = title.textContent;
    let pending = false;
    let attempted = false;
    let previousPayload;
    let submissionKey;
    const controller = new AbortController();
    for (const [name, limit] of Object.entries(contactLimits)) form.elements.namedItem(name).maxLength = limit;
    const showErrors = (errors) => {
      for (const name of Object.keys(contactLimits)) {
        const field = form.elements.namedItem(name);
        form.querySelector(`#contact-${name}-error`).textContent = errors[name] || "";
        field.setAttribute("aria-invalid", String(Boolean(errors[name])));
      }
    };
    const onInput = () => {
      if (attempted) showErrors(validateContact(Object.fromEntries(new FormData(form))).errors);
      status.hidden = true;
    };
    const onSubmit = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (pending) return;
      attempted = true;
      status.hidden = true;
      const { values, errors } = validateContact(Object.fromEntries(new FormData(form)));
      showErrors(errors);
      if (Object.keys(errors).length) {
        form.elements.namedItem(Object.keys(errors)[0]).focus();
        return;
      }
      const payload = JSON.stringify(values);
      if (payload !== previousPayload) {
        previousPayload = payload;
        submissionKey = crypto.randomUUID();
      }
      pending = true;
      button.disabled = true;
      form.setAttribute("aria-busy", "true");
      title.textContent = "Sending...";
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": submissionKey },
          body: payload,
          signal: controller.signal,
        });
        const result = await response.json();
        if (response.ok && result.success === true) {
          router.push("/thank-you");
          return;
        }
        if (result.errors) {
          showErrors(result.errors);
          const first = Object.keys(contactLimits).find((name) => result.errors[name]);
          if (first) form.elements.namedItem(first).focus();
        }
        throw new Error("Submission failed");
      } catch {
        if (controller.signal.aborted) return;
        status.textContent = "Something went wrong while sending your message. Please try again.";
        status.hidden = false;
        pending = false;
        button.disabled = false;
        title.textContent = originalTitle;
        form.removeAttribute("aria-busy");
      }
    };
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", onInput);
    return () => {
      controller.abort();
      form.removeEventListener("submit", onSubmit);
      form.removeEventListener("input", onInput);
    };
  }, [router]);
  return null;
}
