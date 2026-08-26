/* ============================================================
   NEXORA — PORTFOLIO SCRIPTS
   ============================================================ */

/* ---------- Project data (used by the React projects section on work.html) ---------- */
window.PROJECT_DATA = [
  { title: "E-Commerce Store", type: "Web App", year: "2026", art: "art-1", desc: "A clean online store with product pages, cart and a checkout-ready frontend.", tags: ["React", "UI Design", "SEO"] },
  { title: "Real Estate Website", type: "Business Site", year: "2025", art: "art-2", desc: "A modern website for a property agency with listings, search and enquiry forms.", tags: ["HTML/CSS", "Design", "Forms"] },
  { title: "Restaurant Landing Page", type: "UI Design", year: "2025", art: "art-3", desc: "An elegant one-page site with menu, gallery and online table booking.", tags: ["Figma", "Branding", "Responsive"] },
  { title: "Photographer Portfolio", type: "Brand Site", year: "2024", art: "art-4", desc: "A minimal portfolio built to make the photography feel like art.", tags: ["Brand Site", "Typography", "Motion"] },
  { title: "Fitness Dashboard", type: "Web App", year: "2026", art: "art-1", desc: "A workout tracking dashboard with charts, progress logs and daily goals.", tags: ["React", "Data Viz", "UI/UX"] },
  { title: "Travel Booking Site", type: "Web App", year: "2025", art: "art-3", desc: "A travel platform UI with destination cards, filters and a booking flow.", tags: ["UI Design", "Prototype", "Mobile"] },
  { title: "Cafe Brand Identity", type: "Brand Site", year: "2025", art: "art-2", desc: "A warm, inviting website for a local cafe with menu and story section.", tags: ["Branding", "Copy", "Design"] },
  { title: "Agency Landing Page", type: "Business Site", year: "2024", art: "art-4", desc: "A conversion-focused landing page for a digital agency with lead form.", tags: ["Landing Page", "SEO", "Speed"] },
  { title: "Online Store UI", type: "UI Design", year: "2024", art: "art-1", desc: "Mobile-first shopping app interface designed in Figma with a full prototype.", tags: ["Figma", "E-Commerce", "App UI"] },
  { title: "Wedding Invitation Site", type: "Brand Site", year: "2024", art: "art-3", desc: "A beautiful one-page wedding site with gallery, RSVP and countdown.", tags: ["Brand Site", "Motion", "RSVP"] },
];

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initCounters();
  initRotatingWords();
  initSkillBars();
  initFAQ();
  initContactForm();
  initOrderModal();
});

/* ---------- Navbar: background on scroll + mobile menu + back to top ---------- */
function initNav() {
  const nav = document.getElementById("nav");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  if (!nav) return;

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  const backTop = document.getElementById("back-top");
  if (backTop) {
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Count-up stats ---------- */
function initCounters() {
  const counters = document.querySelectorAll(".count");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const target = parseInt(el.dataset.target, 10);
        const duration = 1600;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => io.observe(el));
}

/* ---------- Rotating role words (home page only) ---------- */
function initRotatingWords() {
  const el = document.getElementById("rotate-word");
  if (!el) return;
  const words = ["websites", "web apps", "landing pages", "clean interfaces", "online stores"];
  let index = 0;
  setInterval(() => {
    el.classList.add("fade");
    setTimeout(() => {
      index = (index + 1) % words.length;
      el.textContent = words[index];
      el.classList.remove("fade");
    }, 350);
  }, 2600);
}

/* ---------- Skill bars animate on scroll (skills page) ---------- */
function initSkillBars() {
  const bars = document.querySelectorAll(".skill-bar");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fill = entry.target.querySelector(".skill-fill");
        io.unobserve(entry.target);
        requestAnimationFrame(() => {
          fill.style.width = fill.dataset.level + "%";
        });
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((el) => io.observe(el));
}

/* ---------- FAQ accordion (contact page) ---------- */
function initFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.querySelector(".faq-q").addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });
}

/* ---------- Contact form → saves to Google Sheets + opens email app ---------- */
function initContactForm() {
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("c-name").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const message = document.getElementById("c-message").value.trim();

    if (!name || !email || !message) {
      note.textContent = "Please fill in all the fields.";
      note.classList.add("error");
      return;
    }

    /* Save to Google Sheets */
    try {
      navigator.sendBeacon("https://script.google.com/macros/s/AKfycby5dOffAkTHbBhAn_HrDWuMgSi28-OtR0ikoVnrVXn9eyimNqBhPULHMRu0Iexx36VV/exec", JSON.stringify({
        name: name,
        email: email,
        message: message
      }));
    } catch (err) { /* ignore */ }

    const subject = encodeURIComponent("Project enquiry from " + name);
    const body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email + "\n\nProject Details:\n" + message
    );
    window.location.href = "mailto:anirudhjangra3@gmail.com?subject=" + subject + "&body=" + body;

    note.textContent = "Opening your email app... you can also email me directly at anirudhjangra3@gmail.com";
    note.classList.remove("error");
  });
}

/* ---------- Order modal (services page pricing buttons) ---------- */
function initOrderModal() {
  const modal = document.getElementById("order-modal");
  const form = document.getElementById("order-form");
  const note = document.getElementById("order-note");
  if (!modal || !form) return;

  const planInput = document.getElementById("order-plan");
  const nameInput = document.getElementById("order-name");
  const emailInput = document.getElementById("order-email");
  const phoneInput = document.getElementById("order-phone");
  const collegeInput = document.getElementById("order-college");
  const detailsInput = document.getElementById("order-details");

  const openModal = (plan) => {
    const visitorPopup = document.getElementById("visitor-popup");
    if (visitorPopup && visitorPopup.classList.contains("open")) {
      visitorPopup.classList.remove("open");
      visitorPopup.setAttribute("aria-hidden", "true");
    }
    if (planInput) planInput.value = plan;
    if (note) {
      note.textContent = "";
      note.classList.remove("error");
    }
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (nameInput) setTimeout(() => nameInput.focus(), 150);
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("[data-open-order]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(btn.dataset.plan || "Custom Order");
    });
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const details = detailsInput.value.trim();

    if (!name || !email || !phone || !details) {
      note.textContent = "Please fill in all the fields.";
      note.classList.add("error");
      return;
    }

    const plan = planInput.value.trim() || "Custom Order";
    const college = collegeInput.value.trim();

    /* Save order to Google Sheets */
    try {
      navigator.sendBeacon("https://script.google.com/macros/s/AKfycbzgpHM9pqyonTrZsBBzudre4zt-vMeEeaKOr4nYZPxErc_fVVMqoY96zOHv3yh6LD_8nQ/exec", JSON.stringify({
        name: name,
        email: email,
        mobile: phone,
        plan: plan,
        college: college || "",
        details: details
      }));
    } catch (err) { /* ignore */ }

    const message =
      "Hi Anirudh, I want to place an order.\n\n" +
      "Plan: " + plan + "\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n" +
      (college ? "College & Class: " + college + "\n" : "") +
      "\nProject details:\n" + details;

    window.open(
      "https://wa.me/919050543063?text=" + encodeURIComponent(message),
      "_blank"
    );

    note.textContent = "Opening WhatsApp... if it didn't open, message me directly at +91 90505 43063.";
    note.classList.remove("error");
  });
}
