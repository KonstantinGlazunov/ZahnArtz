(function () {
  const dictionary = window.ZAHNKLAR_I18N || {};
  const state = { lang: localStorage.getItem("zahnklar-lang") || "de" };
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  function translate(key) {
    return dictionary[state.lang]?.[key] || dictionary.de?.[key] || "";
  }

  function setLanguage(lang) {
    state.lang = dictionary[lang] ? lang : "de";
    document.documentElement.lang = state.lang;
    localStorage.setItem("zahnklar-lang", state.lang);

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = translate(node.dataset.i18n);
      if (value.includes("<br>")) {
        node.innerHTML = value;
      } else {
        node.textContent = value;
      }
    });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === state.lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function closeMenu() {
    document.body.classList.remove("nav-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }

  function setHeaderState() {
    header?.classList.toggle("is-scrolled", window.scrollY > 12);
  }

  function setActiveNav() {
    const offset = window.innerHeight * 0.32;
    let activeId = sections[0]?.id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        activeId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${activeId}`);
    });
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  document.querySelectorAll(".faq-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const isOpen = button.getAttribute("aria-expanded") === "true";
      item?.classList.toggle("is-open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-form-status]");
    const fields = Array.from(form.querySelectorAll("input, textarea"));
    const appointmentPicker = form.querySelector("[data-appointment-picker]");
    const selectedAppointment = form.querySelector('input[name="appointment"]:checked');
    let isValid = true;

    fields.forEach((field) => {
      const fieldValid = field.type === "checkbox" ? field.checked : field.checkValidity();
      field.classList.toggle("is-invalid", !fieldValid);
      if (!fieldValid) isValid = false;
    });

    appointmentPicker?.classList.toggle("is-invalid", !selectedAppointment);
    if (!selectedAppointment) isValid = false;

    if (!isValid) {
      status.textContent = translate("form.error");
      return;
    }

    const formData = new FormData(form);
    const subject = encodeURIComponent("Terminanfrage Praxis Zahnklar");
    const body = encodeURIComponent(
      `Name: ${formData.get("name")}\nTelefon: ${formData.get("phone")}\nE-Mail: ${formData.get("email")}\nTerminwunsch: ${formData.get("appointment")}\n\nAnliegen:\n${formData.get("message")}`
    );
    status.textContent = translate("form.success");
    window.location.href = `mailto:termin@praxis-zahnklar.de?subject=${subject}&body=${body}`;
    form.reset();
    appointmentPicker?.classList.remove("is-invalid");
  });

  window.addEventListener("scroll", () => {
    setHeaderState();
    setActiveNav();
  }, { passive: true });

  setLanguage(state.lang);
  setHeaderState();
  setActiveNav();
})();
