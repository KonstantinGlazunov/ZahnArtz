(function () {
  const dictionary = window.ZAHNKLAR_I18N || {};
  const state = { lang: localStorage.getItem("zahnklar-lang") || "de" };
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  const appointmentMonth = document.querySelector("[data-appointment-month]");
  const appointmentDay = document.querySelector("[data-appointment-day]");
  const appointmentTime = document.querySelector("[data-appointment-time]");
  const appointmentTimes = ["08:30", "09:30", "11:00", "13:30", "15:00", "16:00"];

  function translate(key) {
    return dictionary[state.lang]?.[key] || dictionary.de?.[key] || "";
  }

  function setLanguage(lang) {
    const selectedMonth = appointmentMonth?.value;
    const selectedDay = appointmentDay?.value;
    const selectedTime = appointmentTime?.value;
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

    renderAppointmentPicker({ selectedMonth, selectedDay, selectedTime });

    document.querySelectorAll("[data-lang]").forEach((button) => {
      const isActive = button.dataset.lang === state.lang;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function dateLocale() {
    return state.lang === "ru" ? "ru-RU" : "de-DE";
  }

  function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function toMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function isWorkday(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

  function nextWorkday(date) {
    const result = new Date(date);
    while (!isWorkday(result)) result.setDate(result.getDate() + 1);
    return result;
  }

  function getMonthOptions() {
    const start = nextWorkday(new Date());
    start.setHours(0, 0, 0, 0);
    const firstMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    return Array.from({ length: 4 }, (_, index) => {
      const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + index, 1);
      return {
        value: toMonthKey(date),
        label: new Intl.DateTimeFormat(dateLocale(), { month: "long", year: "numeric" }).format(date)
      };
    });
  }

  function getWorkdays(monthKey) {
    if (!monthKey) return [];
    const [year, month] = monthKey.split("-").map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    const days = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const candidate = new Date(date);
      if (candidate >= today && isWorkday(candidate)) {
        days.push({
          value: toDateKey(candidate),
          label: new Intl.DateTimeFormat(dateLocale(), {
            weekday: "short",
            day: "2-digit",
            month: "2-digit"
          }).format(candidate)
        });
      }
    }

    return days;
  }

  function setOptions(select, placeholderKey, options, selectedValue) {
    if (!select) return;
    select.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = translate(placeholderKey);
    select.append(placeholder);

    options.forEach((option) => {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      select.append(node);
    });

    if (selectedValue && options.some((option) => option.value === selectedValue)) {
      select.value = selectedValue;
    }
  }

  function renderAppointmentPicker(selection = {}) {
    if (!appointmentMonth || !appointmentDay || !appointmentTime) return;
    const months = getMonthOptions();
    const selectedMonth = selection.selectedMonth ?? appointmentMonth.value;
    setOptions(appointmentMonth, "form.monthPlaceholder", months, selectedMonth);

    const days = getWorkdays(appointmentMonth.value);
    setOptions(appointmentDay, "form.dayPlaceholder", days, selection.selectedDay || appointmentDay.value);

    const times = appointmentTimes.map((time) => ({ value: time, label: time }));
    setOptions(appointmentTime, "form.timePlaceholder", appointmentDay.value ? times : [], selection.selectedTime || appointmentTime.value);

    appointmentDay.disabled = !appointmentMonth.value;
    appointmentTime.disabled = !appointmentDay.value;
  }

  function formatAppointment(dayKey, time) {
    if (!dayKey || !time) return "";
    const [year, month, day] = dayKey.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const label = new Intl.DateTimeFormat(dateLocale(), {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(date);
    return `${label}, ${time}`;
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

  appointmentMonth?.addEventListener("change", () => {
    renderAppointmentPicker({ selectedMonth: appointmentMonth.value });
  });

  appointmentDay?.addEventListener("change", () => {
    renderAppointmentPicker({
      selectedMonth: appointmentMonth.value,
      selectedDay: appointmentDay.value
    });
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
    const fields = Array.from(form.querySelectorAll("input, textarea, select"));
    const appointmentPicker = form.querySelector("[data-appointment-picker]");
    const appointmentDayValue = form.querySelector("[data-appointment-day]")?.value || "";
    const appointmentTimeValue = form.querySelector("[data-appointment-time]")?.value || "";
    const appointment = formatAppointment(appointmentDayValue, appointmentTimeValue);
    let isValid = true;

    fields.forEach((field) => {
      const fieldValid = field.type === "checkbox" ? field.checked : field.checkValidity();
      field.classList.toggle("is-invalid", !fieldValid);
      if (!fieldValid) isValid = false;
    });

    appointmentPicker?.classList.toggle("is-invalid", !appointment);
    if (!appointment) isValid = false;

    if (!isValid) {
      status.textContent = translate("form.error");
      return;
    }

    const formData = new FormData(form);
    const subject = encodeURIComponent("Terminanfrage Praxis Zahnklar");
    const body = encodeURIComponent(
      `Name: ${formData.get("name")}\nTelefon: ${formData.get("phone")}\nE-Mail: ${formData.get("email")}\nTerminwunsch: ${appointment}\n\nAnliegen:\n${formData.get("message")}`
    );
    status.textContent = translate("form.success");
    window.location.href = `mailto:termin@praxis-zahnklar.de?subject=${subject}&body=${body}`;
    form.reset();
    appointmentPicker?.classList.remove("is-invalid");
    renderAppointmentPicker();
  });

  window.addEventListener("scroll", () => {
    setHeaderState();
    setActiveNav();
  }, { passive: true });

  setLanguage(state.lang);
  setHeaderState();
  setActiveNav();
})();
