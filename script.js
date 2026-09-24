(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const setNav = (open) => {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  // Count-up numbers
  const formatNum = (n) => n.toLocaleString("en-US");
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduceMotion || el.hasAttribute("data-static")) {
      el.textContent = prefix + formatNum(target) + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + formatNum(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll("[data-count]").forEach(countUp);
      if (entry.target.matches("[data-count]")) countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });

  // Highlight active nav link
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("current", l.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((l) => {
    const section = document.querySelector(l.getAttribute("href"));
    if (section) sectionObserver.observe(section);
  });

  // Pricing toggle
  const billingButtons = document.querySelectorAll("[data-billing]");
  billingButtons.forEach((btn) => btn.addEventListener("click", () => {
    const mode = btn.dataset.billing;
    billingButtons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".amount .value").forEach((v) => {
      v.classList.add("flip");
      setTimeout(() => {
        v.textContent = v.dataset[mode];
        v.classList.remove("flip");
      }, reduceMotion ? 0 : 180);
    });
  }));

  // Plan buttons preselect the contact form
  const planSelect = document.getElementById("plan");
  document.querySelectorAll("[data-plan]").forEach((a) => a.addEventListener("click", () => {
    planSelect.value = a.dataset.plan;
  }));

  // Quote carousel
  const quotes = [...document.querySelectorAll(".quote")];
  const dotsWrap = document.querySelector(".quote-dots");
  let current = 0;
  let timer;
  const dots = quotes.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Show quote ${i + 1}`);
    b.addEventListener("click", () => { show(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });
  const show = (i) => {
    current = i;
    quotes.forEach((q, j) => q.classList.toggle("active", j === i));
    dots.forEach((d, j) => d.setAttribute("aria-selected", String(j === i)));
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => show((current + 1) % quotes.length), 6000);
  };
  show(0);
  restart();

  // Contact form: validate, then open the visitor's email client with the details
  const form = document.getElementById("contact-form");
  const status = form.querySelector(".form-status");
  const validators = {
    name: (v) => v.trim() ? "" : "Please enter your name.",
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email.",
    message: (v) => v.trim().length >= 5 ? "" : "Tell us a little about what you need.",
  };
  const check = (input) => {
    const msg = validators[input.name]?.(input.value) || "";
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    field.querySelector(".error").textContent = msg;
    return !msg;
  };
  Object.keys(validators).forEach((name) => {
    form.elements[name].addEventListener("blur", (e) => check(e.target));
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = Object.keys(validators).map((n) => check(form.elements[n])).every(Boolean);
    if (!valid) {
      status.textContent = "";
      form.querySelector(".invalid input, .invalid textarea")?.focus();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const subject = `Free consultation request — ${d.business || d.name}`;
    const body = [
      `Name: ${d.name}`,
      `Email: ${d.email}`,
      `Business: ${d.business || "—"}`,
      `Interested in: ${d.plan}`,
      "",
      d.message,
    ].join("\n");
    window.location.href = `mailto:hello@laymansledger.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Thanks, ${d.name.split(" ")[0]}! Your email app should open with your request ready to send.`;
    form.reset();
  });
})();
