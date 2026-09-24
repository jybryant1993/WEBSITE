/* Layman's Ledger: interactions and motion.
   Motion is progressive: every element is fully visible without JS, and
   nothing animates when the visitor prefers reduced motion. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const animate = hasGsap && !reduceMotion;

  /* ---------- Small housekeeping ---------- */

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */

  const toggle = document.querySelector(".menu-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      links.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (links.classList.contains("is-open") && !e.target.closest(".nav")) setOpen(false);
    });
  }

  /* ---------- Jargon translator ---------- */

  const jargon = document.querySelector("[data-jargon]");
  if (jargon) {
    const buttons = [...jargon.querySelectorAll(".jargon-btn")];
    const allBtn = document.querySelector("[data-jargon-all]");
    const syncAll = () => {
      if (!allBtn) return;
      const allOpen = buttons.every((b) => b.getAttribute("aria-expanded") === "true");
      allBtn.setAttribute("aria-pressed", String(allOpen));
      allBtn.textContent = allOpen ? "Show the jargon again" : "Translate them all";
    };
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"));
        syncAll();
      });
    });
    if (allBtn) {
      allBtn.addEventListener("click", () => {
        const open = allBtn.getAttribute("aria-pressed") !== "true";
        // A short cascade so the pencil works down the list rather than all at once
        buttons.forEach((btn, i) => {
          window.setTimeout(() => btn.setAttribute("aria-expanded", String(open)), reduceMotion ? 0 : i * 90);
        });
        window.setTimeout(syncAll, reduceMotion ? 0 : buttons.length * 90);
        allBtn.setAttribute("aria-pressed", String(open));
        allBtn.textContent = open ? "Show the jargon again" : "Translate them all";
      });
    }
  }

  /* ---------- FAQ: smooth open and close on native <details> ---------- */

  document.querySelectorAll(".faq details").forEach((details) => {
    const summary = details.querySelector("summary");
    const body = details.querySelector(".faq-body");
    if (!summary || !body || reduceMotion || !body.animate) return;
    let anim = null;
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (anim) anim.cancel();
      if (!details.open) {
        details.open = true;
        const h = body.scrollHeight;
        anim = body.animate({ height: ["0px", `${h}px`], opacity: [0, 1] }, { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        anim.onfinish = () => { anim = null; };
      } else {
        const h = body.scrollHeight;
        anim = body.animate({ height: [`${h}px`, "0px"], opacity: [1, 0] }, { duration: 220, easing: "ease-in" });
        anim.onfinish = () => { details.open = false; anim = null; };
      }
    });
  });

  /* ---------- Contact form ---------- */

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    const status = form.querySelector(".form-status");
    const success = document.querySelector("[data-form-success]");
    const rules = {
      name: (v) => (v.trim() ? "" : "Please tell us your name."),
      email: (v) => {
        if (!v.trim()) return "We need an email to reply to you.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "That email looks incomplete. Check for a typo?";
      },
    };
    const validate = (input) => {
      const rule = rules[input.name];
      if (!rule) return true;
      const msg = rule(input.value);
      const field = input.closest(".field");
      const err = field && field.querySelector(".error-msg span");
      if (field) field.classList.toggle("has-error", Boolean(msg));
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", () => { if (input.value) validate(input); });
      input.addEventListener("input", () => {
        if (input.closest(".field").classList.contains("has-error")) validate(input);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      status.classList.remove("is-error");
      const invalid = Object.keys(rules).map((n) => form.elements[n]).filter((input) => input && !validate(input));
      if (invalid.length) {
        invalid[0].focus();
        return;
      }
      const action = form.getAttribute("action") || "";
      if (action.includes("YOUR_FORM_ID")) {
        status.classList.add("is-error");
        status.innerHTML = 'This form isn\'t connected yet. Please email <a href="mailto:info@laymansledger.com">info@laymansledger.com</a> for now.';
        return;
      }
      const submit = form.querySelector('[type="submit"]');
      const label = submit.textContent;
      submit.disabled = true;
      submit.textContent = "Sending…";
      try {
        const res = await fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.focus();
          if (animate) window.gsap.from(success, { y: 24, rotate: 2, opacity: 0, duration: 0.7, ease: "back.out(1.4)" });
        }
      } catch (err) {
        status.classList.add("is-error");
        status.innerHTML = 'Your message didn\'t send. Check your connection and try again, or email <a href="mailto:info@laymansledger.com">info@laymansledger.com</a>.';
        submit.disabled = false;
        submit.textContent = label;
      }
    });
  }

  /* ---------- Motion ---------- */

  // The head script hides the hero pieces (class "motion") to avoid a flash.
  // Whatever happens below, that class comes off once states are set.
  const release = () => root.classList.remove("motion");

  if (!animate) {
    release();
    return;
  }

  const { gsap } = window;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  const prepDraw = (path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = String(len);
    return path;
  };
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  /* Hero: the report writes itself. Waits (briefly) for web fonts so the
     figures are measured at their final width and nothing shifts. */
  const report = document.querySelector("[data-report]");
  const fontsReady = document.fonts && document.fonts.ready
    ? Promise.race([document.fonts.ready, new Promise((r) => window.setTimeout(r, 900))])
    : Promise.resolve();
  const playHero = () => {
    const lines = document.querySelectorAll("[data-hero-title] .line");
    const fades = document.querySelectorAll("[data-hero-fade]");
    const sticky = document.querySelector("[data-sticky]");
    const counts = [...report.querySelectorAll("[data-count]")];
    const circle = report.querySelector(".pencil-circle path");
    const notes = [...report.querySelectorAll("[data-note]")];

    gsap.set(lines, { y: 28, opacity: 0 });
    gsap.set(fades, { y: 14, opacity: 0 });
    gsap.set(report, { y: 48, opacity: 0, rotate: 1.8 });
    if (sticky) gsap.set(sticky, { y: -36, opacity: 0, rotate: -9, scale: 1.06 });
    counts.forEach((el) => {
      el.style.display = "inline-block";
      el.style.minWidth = `${el.getBoundingClientRect().width}px`;
      el.style.textAlign = "right";
      el.textContent = money.format(0);
    });
    if (circle) prepDraw(circle);
    notes.forEach((note) => {
      const path = note.querySelector("[data-draw]");
      if (path) prepDraw(path);
      gsap.set(note.querySelector("[data-write]"), { clipPath: "inset(0 100% 0 0)" });
    });
    release();

    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 });
    tl.to(lines, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 })
      .to(fades, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08 }, 0.35)
      .to(report, { y: 0, opacity: 1, rotate: -0.6, duration: 1.1, ease: "power4.out" }, 0.3);

    counts.forEach((el, i) => {
      const target = Number(el.dataset.count);
      const state = { v: 0 };
      tl.to(state, {
        v: target,
        duration: 1.3,
        ease: "power2.out",
        onUpdate: () => { el.textContent = money.format(Math.round(state.v)); },
      }, 0.75 + i * 0.12);
    });

    if (circle) tl.to(circle, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" }, 1.9);

    notes.forEach((note, i) => {
      const at = 2.2 + i * 0.32;
      const path = note.querySelector("[data-draw]");
      if (path) tl.to(path, { strokeDashoffset: 0, duration: 0.35, ease: "power1.out" }, at);
      tl.to(note.querySelector("[data-write]"), { clipPath: "inset(0 0% 0 0)", duration: 0.7, ease: "power1.inOut" }, at + 0.2);
    });

    if (sticky) tl.to(sticky, { y: 0, opacity: 1, rotate: 2.5, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.2");
  };
  if (report) fontsReady.then(playHero);
  else release();

  if (!window.ScrollTrigger) return;
  const ScrollTrigger = window.ScrollTrigger;

  /* How it works: a blue-pencil line follows the reader down the steps */
  document.querySelectorAll("[data-steps]").forEach((steps) => {
    gsap.fromTo(steps, { "--progress": 0 }, {
      "--progress": 1,
      ease: "none",
      scrollTrigger: { trigger: steps, start: "top 70%", end: "bottom 65%", scrub: 0.6 },
    });
    steps.querySelectorAll(".step").forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 68%",
        onEnter: () => step.classList.add("is-reached"),
        onLeaveBack: () => step.classList.remove("is-reached"),
      });
    });
  });

  /* Highlighter sweeps across key sentences as they come into view */
  document.querySelectorAll(".highlight").forEach((el) => {
    gsap.fromTo(el, { backgroundSize: "0% 100%" }, {
      backgroundSize: "100% 100%",
      duration: 0.9,
      ease: "power2.inOut",
      scrollTrigger: { trigger: el, start: "top 80%", once: true },
    });
  });

  /* Sticky-note panels settle onto the page once */
  document.querySelectorAll("[data-cta]").forEach((el) => {
    gsap.from(el, {
      y: 36,
      rotate: 1.6,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  // Fonts change line heights; re-measure trigger positions once they're in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
