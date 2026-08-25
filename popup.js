/* ============================================================
   NEXORA — VISITOR POPUP
   - Shows a form when someone visits the site (once per day)
   - Saves name + mobile to Google Sheets via Apps Script
   - Opens WhatsApp so visitor can message 9050132207
   ============================================================ */

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxKYfG7JwsgB6zFrIO4NeZPVYYMsD-t7hJ50W71rmm8ZYbKb3FeLgLjKG7KfyPQFlJb/exec";

document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("visitor-popup");
  const form = document.getElementById("popup-form");
  const note = document.getElementById("popup-note");
  if (!popup || !form) return;

  const nameInput = document.getElementById("popup-name");
  const mobileInput = document.getElementById("popup-mobile");
  const submitBtn = form.querySelector(".btn");

  const LS_KEY = "nexora_popup_seen";
  const SHOW_DELAY = 2500;

  const isValidMobile = (v) => /^[6-9]\d{9}$/.test(v);

  const openPopup = () => {
    popup.classList.add("open");
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  };

  const closePopup = () => {
    popup.classList.remove("open");
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  /* Show once per day (per browser) */
  const schedule = () => {
    try {
      const seen = localStorage.getItem(LS_KEY);
      if (seen === new Date().toDateString()) return;
      localStorage.setItem(LS_KEY, new Date().toDateString());
    } catch (e) {
      /* localStorage unavailable — still show the popup */
    }
    setTimeout(openPopup, SHOW_DELAY);
  };

  popup.querySelectorAll("[data-close-popup]").forEach((el) => {
    el.addEventListener("click", closePopup);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("open")) closePopup();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const mobile = String(mobileInput.value || "")
      .replace(/\D/g, "")
      .replace(/^0/, "")
      .replace(/^91(?=[6-9]\d{9}$)/, "");

    if (name.length < 2) {
      note.textContent = "Please enter your name.";
      note.classList.add("error");
      return;
    }
    if (!isValidMobile(mobile)) {
      note.textContent = "Please enter a valid 10-digit mobile number (6-9 se shuru).";
      note.classList.add("error");
      return;
    }

    /* Save to Google Sheets */
    try {
      fetch(SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          type: "Popup",
          name: name,
          mobile: mobile,
          page: document.title || "Home"
        }),
      });
    } catch (err) {
      /* Sheets not available — WhatsApp is the primary channel */
    }

    /* Open WhatsApp so the visitor can message 9050132207 directly */
    const message =
      "Hi Anirudh! I just visited your website. This is " +
      name +
      " (" +
      mobile +
      "). Can you tell me more about your services?";
    window.open(
      "https://wa.me/9050132207?text=" + encodeURIComponent(message),
      "_blank"
    );

    note.textContent =
      "Thanks " + name + "! WhatsApp is opening so we can chat.";
    note.classList.remove("error");
    submitBtn.textContent = "Done";
    setTimeout(closePopup, 2000);
  });

  schedule();
});
