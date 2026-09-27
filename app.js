(() => {
  const ACCESS_CODE = "SBU26"; // Demo code for this static prototype. Use server-side authentication for real privacy.
  const engineeringGate = document.querySelector("#gateScreen");
  const engineeringContent = document.querySelector("#engineeringContent");
  const accessForm = document.querySelector("#accessForm");
  const errorMessage = document.querySelector("#formError");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  const isEngineeringPage = document.body.dataset.page === "engineering";

  let engineeringGranted = false;
  try { engineeringGranted = sessionStorage.getItem("skrEngineeringAccess") === "granted"; } catch (_) {}
  if (isEngineeringPage && engineeringGranted) {
    engineeringGate.hidden = true;
    engineeringContent.hidden = false;
  }

  if (accessForm) {
    accessForm.addEventListener("submit", event => {
      event.preventDefault();
      const value = new FormData(accessForm).get("code");
      if (String(value).trim().toUpperCase() !== ACCESS_CODE) {
        errorMessage.textContent = "That code didn’t work. Check with a team member and try again.";
        accessForm.querySelector("input").setAttribute("aria-invalid", "true");
        return;
      }
      try { sessionStorage.setItem("skrEngineeringAccess", "granted"); } catch (_) {}
      engineeringGate.hidden = true;
      engineeringContent.hidden = false;
      document.title = "Engineering — Sathyabama Kart Racing";
      window.scrollTo({ top: 0, behavior: "smooth" });
      observeReveals();
    });
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      siteNav.classList.toggle("is-open", open);
    });
    siteNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      siteNav.classList.remove("is-open");
    }));
  }

  let revealObserver;
  function observeReveals() {
    if (revealObserver) revealObserver.disconnect();
    const elements = document.querySelectorAll(".reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(element => element.classList.add("is-visible"));
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.13, rootMargin: "0px 0px -35px 0px" });
    elements.forEach(element => revealObserver.observe(element));
  }
  observeReveals();

  const motionPref = window.matchMedia("(prefers-reduced-motion: reduce)");
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  const motionStory = document.querySelector("[data-motion-story]");
  const motionFrames = motionStory ? [...motionStory.querySelectorAll(".motion-frame")] : [];
  const motionCopies = motionStory ? [...motionStory.querySelectorAll("[data-motion-copy]")] : [];
  const motionDots = motionStory ? [...motionStory.querySelectorAll(".motion-dot")] : [];
  const motionCount = motionStory?.querySelector("[data-motion-count]");
  const motionScrubber = motionStory?.querySelector("[data-motion-scrubber]");
  const partsViewer = document.querySelector("[data-parts-viewer]");
  const racePanner = document.querySelector("[data-race-panner]");
  const tiltSurface = document.querySelector("[data-tilt]");
  let ticking = false;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function updateMotionStory() {
    if (!motionStory || motionFrames.length === 0) return;
    if (motionPref.matches) {
      motionFrames.forEach((frame, index) => { frame.style.opacity = index === 0 ? "1" : "0"; });
      motionCopies.forEach((copy, index) => { copy.style.opacity = index === 0 ? "1" : "0"; });
      return;
    }
    const rect = motionStory.getBoundingClientRect();
    const scrollSpan = Math.max(1, motionStory.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollSpan, 0, 1);
    const position = progress * (motionFrames.length - 1);
    const first = Math.floor(position);
    const blend = position - first;
    const activeStage = clamp(Math.round(position), 0, motionFrames.length - 1);

    motionFrames.forEach((frame, index) => {
      const opacity = index === first ? 1 - blend : index === first + 1 ? blend : 0;
      const zoom = index === 1 ? 1.23 : index === 2 ? 1.02 : 1.08;
      const scale = 1 + (zoom - 1) * opacity;
      frame.style.opacity = opacity.toFixed(3);
      frame.style.transform = `scale(${scale.toFixed(3)})`;
    });
    motionCopies.forEach((copy, index) => { copy.style.opacity = index === activeStage ? "1" : "0"; });
    motionStory.dataset.stage = String(activeStage);
    if (motionCount) motionCount.textContent = String(activeStage + 1).padStart(2, "0");
    motionDots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeStage));
    if (motionScrubber && document.activeElement !== motionScrubber) motionScrubber.value = String(Math.round(progress * 1000));
  }

  if (motionScrubber && motionStory) {
    motionScrubber.addEventListener("input", () => {
      const span = Math.max(1, motionStory.offsetHeight - window.innerHeight);
      const pageTop = window.scrollY + motionStory.getBoundingClientRect().top;
      window.scrollTo({ top: pageTop + (Number(motionScrubber.value) / 1000) * span, behavior: "auto" });
    });
  }

  if (partsViewer) {
    const views = [
      { src: "assets/kart-exploded.png", label: "PARTS STUDY", alt: "Exploded view of a go-kart and its mechanical components" },
      { src: "assets/kart-wheel.png", label: "TYRE & BRAKE", alt: "Close-up of a go-kart slick tyre, wheel hub and brake disc" },
      { src: "assets/kart-hero.png", label: "FULL KART", alt: "Complete student racing go-kart on the circuit" }
    ];
    const image = partsViewer.querySelector("[data-parts-image]");
    const range = partsViewer.querySelector("[data-parts-range]");
    const count = partsViewer.querySelector("[data-parts-count]");
    const label = partsViewer.querySelector("[data-parts-label]");
    let viewIndex = 0;
    views.forEach(view => { const preload = new Image(); preload.src = view.src; });
    range?.addEventListener("input", () => {
      viewIndex = Number(range.value);
      image.classList.add("is-switching");
      image.src = views[viewIndex].src;
      image.alt = views[viewIndex].alt;
      count.textContent = String(viewIndex + 1).padStart(2, "0");
      label.textContent = views[viewIndex].label;
      image.addEventListener("load", () => image.classList.remove("is-switching"), { once: true });
    });
  }

  if (racePanner) {
    const range = racePanner.parentElement.querySelector("[data-race-control]");
    const image = racePanner.querySelector("[data-race-image]");
    const stageLabel = racePanner.querySelector("[data-race-stage]");
    const moveScene = () => {
      const progress = Number(range.value) / 100;
      const shift = (0.5 - progress) * 14;
      image.style.transform = `translate3d(${shift.toFixed(2)}%,0,0) scale(${(1.12 + Math.abs(progress - 0.5) * 0.13).toFixed(3)})`;
      racePanner.dataset.position = progress < 0.34 ? "entry" : progress > 0.66 ? "exit" : "apex";
      if (stageLabel) stageLabel.textContent = progress < 0.34 ? "CORNER ENTRY" : progress > 0.66 ? "CORNER EXIT" : "APEX APPROACH";
    };
    range?.addEventListener("input", moveScene);
    moveScene();
  }

  if (tiltSurface) {
    tiltSurface.addEventListener("pointermove", event => {
      const rect = tiltSurface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      tiltSurface.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
      tiltSurface.style.setProperty("--tilt-y", `${(x * 7).toFixed(2)}deg`);
      tiltSurface.style.setProperty("--tilt-shift", `${(x * 12).toFixed(2)}px`);
    });
    tiltSurface.addEventListener("pointerleave", () => {
      tiltSurface.style.setProperty("--tilt-x", "0deg");
      tiltSurface.style.setProperty("--tilt-y", "0deg");
      tiltSurface.style.setProperty("--tilt-shift", "0px");
    });
  }

  function updateParallax() {
    updateMotionStory();
    if (motionPref.matches) { ticking = false; return; }
    parallaxItems.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const shift = (progress - 0.5) * -32;
      const image = section.querySelector(".hero__image, .gate-bg, .wheel-feature > img, img");
      if (image) image.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0) scale(${(1.045 + Math.abs(progress - 0.5) * 0.04).toFixed(3)})`;
    });
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener("resize", updateParallax, { passive: true });
  motionPref.addEventListener?.("change", updateParallax);
  updateParallax();

  const joinForm = document.querySelector("#joinForm");
  if (joinForm) joinForm.addEventListener("submit", event => {
    event.preventDefault();
    document.querySelector("#formResponse").textContent = "Thanks for your interest. The club’s contact details will be added here soon.";
    joinForm.reset();
  });
})();
