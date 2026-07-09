/**
 * Contact form validation + EmailJS submission
 * ------------------------------------------------------------
 * SETUP REQUIRED (one-time, ~5 minutes):
 * 1. Create a free account at https://www.emailjs.com/
 * 2. Add an "Email Service" and connect it to your Gmail account.
 * 3. Create an "Email Template" with variables: from_name, from_email,
 *    subject, message  (these match the names sent below).
 * 4. Copy your Public Key, Service ID, and Template ID and paste
 *    them into the EMAILJS_CONFIG object below.
 */

(function () {
  "use strict";

  const EMAILJS_CONFIG = {
    publicKey: "zEJ_WpnSrEzIr5Ys-",
    serviceId: "service_whuqhlc",
    templateId: "template_0fp7s3f",
    toEmail: "dbankdigisoft@gmail.com",
  };

  let emailjsReady = false;

  function ensureEmailJSInitialized() {
    if (emailjsReady || typeof emailjs === "undefined") return;
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    emailjsReady = true;
  }

  /**
   * Validation rules per field. Each returns an error string, or "" if valid.
   */
  const validators = {
    name(value) {
      const v = value.trim();
      if (!v) return "Name is required.";
      if (v.length < 2 || v.length > 50) return "Name must be 2-50 characters.";
      if (!/^[A-Za-z\u00C0-\u024F' -]+$/.test(v)) {
        return "Name can only contain letters, spaces, hyphens, and apostrophes.";
      }
      return "";
    },
    email(value) {
      const v = value.trim();
      if (!v) return "Email is required.";
      // Practical email validation (RFC 5322 "good enough" pattern)
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (v.length > 254 || !emailPattern.test(v)) return "Please enter a valid email address.";
      return "";
    },
    subject(value) {
      const v = value.trim();
      if (!v) return "Subject is required.";
      if (v.length < 3 || v.length > 100) return "Subject must be 3-100 characters.";
      return "";
    },
    message(value) {
      const v = value.trim();
      if (!v) return "Message is required.";
      if (v.length < 10 || v.length > 1000) return "Message must be 10-1000 characters.";
      return "";
    },
  };

  function validateField(field) {
    const validator = validators[field.name];
    if (!validator) return true;

    const error = validator(field.value);
    const feedback = field.parentElement.querySelector(".invalid-feedback");

    if (error) {
      field.classList.add("is-invalid");
      field.classList.remove("is-valid");
      if (feedback) feedback.textContent = error;
      return false;
    }

    field.classList.remove("is-invalid");
    field.classList.add("is-valid");
    return true;
  }

  function validateForm(form) {
    let isValid = true;
    ["name", "email", "subject", "message"].forEach((fieldName) => {
      const field = form.elements[fieldName];
      if (field && !validateField(field)) isValid = false;
    });
    return isValid;
  }

  function setSubmitting(form, isSubmitting) {
    const btn = form.querySelector("#contact-submit-btn");
    const loading = form.querySelector(".loading");
    if (btn) btn.disabled = isSubmitting;
    if (loading) loading.classList.toggle("d-block", isSubmitting);
  }

  function showError(form, message) {
    const errorEl = form.querySelector(".error-message");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("d-block");
    }
  }

  function clearMessages(form) {
    form.querySelector(".error-message")?.classList.remove("d-block");
    form.querySelector(".sent-message")?.classList.remove("d-block");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    clearMessages(form);

    const honeypot = form.elements["website"];
    if (honeypot && honeypot.value.trim() !== "") {
      form.reset();
      form.querySelector(".sent-message")?.classList.add("d-block");
      return;
    }

    if (!validateForm(form)) {
      const firstInvalid = form.querySelector(".is-invalid");
      firstInvalid?.focus();
      return;
    }

    if (typeof emailjs === "undefined") {
      showError(form, "Email service failed to load. Please check your connection and try again.");
      return;
    }
    ensureEmailJSInitialized();

    setSubmitting(form, true);

    const templateParams = {
      from_name: form.elements["name"].value.trim(),
      from_email: form.elements["email"].value.trim(),
      subject: form.elements["subject"].value.trim(),
      message: form.elements["message"].value.trim(),
      to_email: EMAILJS_CONFIG.toEmail,
    };

    emailjs
      .send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(() => {
        setSubmitting(form, false);
        form.reset();
        form.querySelectorAll(".is-valid").forEach((el) => el.classList.remove("is-valid"));
        const charCount = form.querySelector("#message-char-count");
        if (charCount) charCount.textContent = "0";
        form.querySelector(".sent-message")?.classList.add("d-block");
      })
      .catch((error) => {
        setSubmitting(form, false);
        const detail = error?.text || error?.message || "Please try again later.";
        showError(form, `Message failed to send: ${detail}`);
      });
  }

  /**
   * Set up (or re-set-up) the contact form.
   */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    // Avoid attaching duplicate listeners if this page is loaded more than once.
    if (form.dataset.validationBound === "true") return;
    form.dataset.validationBound = "true";

    ["name", "email", "subject", "message"].forEach((fieldName) => {
      const field = form.elements[fieldName];
      if (!field) return;
      field.addEventListener("input", () => {
        if (field.classList.contains("is-invalid")) validateField(field);
      });
      field.addEventListener("blur", () => validateField(field));
    });

    const messageField = form.elements["message"];
    const charCount = form.querySelector("#message-char-count");
    if (messageField && charCount) {
      messageField.addEventListener("input", () => {
        charCount.textContent = String(messageField.value.length);
      });
    }

    form.addEventListener("submit", handleSubmit);
  }

  window.initContactForm = initContactForm;
  initContactForm();
})();
