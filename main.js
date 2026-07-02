const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
const form = document.getElementById("enquiryForm");

const setScrolledState = () => {
  nav.classList.toggle("scrolled", window.scrollY > 24);
};

setScrolledState();
window.addEventListener("scroll", setScrolledState, { passive: true });

burger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  burger.classList.toggle("open", isOpen);
  nav.classList.toggle("menu-active", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    burger.classList.remove("open");
    nav.classList.remove("menu-active");
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document
  .querySelectorAll(".trust-strip article, .about__image, .about__content, .section__header, .service-card, .why__list article, .consultation__inner, .testimonial-card, .contact__info, .contact__form")
  .forEach((element, index) => {
    element.setAttribute("data-anim", "");
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
  });

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const button = form.querySelector('button[type="submit"]');
  const originalText = button.textContent;

  button.textContent = "Sending";
  button.disabled = true;

  window.setTimeout(() => {
    button.textContent = "Enquiry Sent";
    form.reset();

    window.setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
    }, 3000);
  }, 900);
});

const sections = document.querySelectorAll("main section[id]");
const navAnchors = document.querySelectorAll(".nav__links a");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    navAnchors.forEach((anchor) => anchor.classList.remove("active"));
    const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
    if (active) active.classList.add("active");
  });
}, { rootMargin: "-38% 0px -56% 0px" });

sections.forEach((section) => sectionObserver.observe(section));

const testimonialTrack = document.getElementById("testimonialTrack");
const testimonialViewport = document.querySelector(".testimonials__viewport");
const testimonialCards = Array.from(document.querySelectorAll(".testimonial-card"));
const testimonialDots = document.querySelector(".testimonial-dots");
const testimonialPrev = document.querySelector("[data-testimonial-prev]");
const testimonialNext = document.querySelector("[data-testimonial-next]");
const mobileCarousel = window.matchMedia("(max-width: 820px)");

let testimonialIndex = 0;
let testimonialTimer;
let touchStartX = 0;
let touchDeltaX = 0;

const updateTestimonials = () => {
  if (!testimonialTrack) return;

  testimonialTrack.style.transform = mobileCarousel.matches
    ? `translateX(-${testimonialIndex * 100}%)`
    : "";

  testimonialCards.forEach((card, index) => {
    card.setAttribute("aria-hidden", mobileCarousel.matches && index !== testimonialIndex ? "true" : "false");
  });

  testimonialDots?.querySelectorAll("button").forEach((dot, index) => {
    const isActive = index === testimonialIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-selected", String(isActive));
  });
};

const goToTestimonial = (index) => {
  testimonialIndex = (index + testimonialCards.length) % testimonialCards.length;
  updateTestimonials();
};

const stopTestimonials = () => {
  window.clearInterval(testimonialTimer);
};

const startTestimonials = () => {
  stopTestimonials();
  if (!mobileCarousel.matches || testimonialCards.length < 2) return;

  testimonialTimer = window.setInterval(() => {
    goToTestimonial(testimonialIndex + 1);
  }, 4500);
};

const handleManualTestimonialChange = (index) => {
  goToTestimonial(index);
  startTestimonials();
};

if (testimonialTrack && testimonialCards.length) {
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonial-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => handleManualTestimonialChange(index));
    testimonialDots.appendChild(dot);
  });

  testimonialPrev?.addEventListener("click", () => handleManualTestimonialChange(testimonialIndex - 1));
  testimonialNext?.addEventListener("click", () => handleManualTestimonialChange(testimonialIndex + 1));

  testimonialViewport?.addEventListener("pointerdown", (event) => {
    if (!mobileCarousel.matches) return;
    touchStartX = event.clientX;
    touchDeltaX = 0;
    stopTestimonials();
  });

  testimonialViewport?.addEventListener("pointermove", (event) => {
    if (!mobileCarousel.matches || touchStartX === 0) return;
    touchDeltaX = event.clientX - touchStartX;
  });

  testimonialViewport?.addEventListener("pointerup", () => {
    if (!mobileCarousel.matches || touchStartX === 0) return;

    if (Math.abs(touchDeltaX) > 45) {
      handleManualTestimonialChange(testimonialIndex + (touchDeltaX < 0 ? 1 : -1));
    } else {
      startTestimonials();
    }

    touchStartX = 0;
    touchDeltaX = 0;
  });

  testimonialViewport?.addEventListener("pointercancel", () => {
    touchStartX = 0;
    touchDeltaX = 0;
    startTestimonials();
  });

  mobileCarousel.addEventListener("change", () => {
    testimonialIndex = 0;
    updateTestimonials();
    startTestimonials();
  });

  updateTestimonials();
  startTestimonials();
}
