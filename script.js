(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ═══════════════════════ HEADER ═══════════════════════ */
  var header = document.querySelector("[data-header]");
  function updateHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  /* ═══════════════════════ LOGO BRAND CARD TOGGLE ═══════════════════════ */
  var brandWrapper = document.getElementById("brandWrapper");
  var brandToggle = document.getElementById("brandToggle");
  if (brandWrapper && brandToggle) {
    brandToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = brandWrapper.classList.toggle("is-open");
      brandToggle.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (e) {
      if (!brandWrapper.contains(e.target)) {
        brandWrapper.classList.remove("is-open");
        brandToggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        brandWrapper.classList.remove("is-open");
        brandToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ═══════════════════════ MOBILE NAVIGATION DRAWER ═══════════════════════ */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");
  var mobileMenuClose = document.getElementById("mobileMenuClose");
  var mobileLinks = Array.from(document.querySelectorAll(".mobile-nav-link"));

  function openMobileNav() {
    if (!mobileMenu) return;
    mobileMenu.classList.add("is-open");
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add("is-open");
    if (navToggle) {
      navToggle.classList.add("is-active");
      navToggle.setAttribute("aria-expanded", "true");
    }
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeMobileNav() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    }
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (navToggle) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      if (mobileMenu && mobileMenu.classList.contains("is-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", function (e) {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener("click", function () {
      closeMobileNav();
    });
  }

  mobileLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      closeMobileNav();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
      closeMobileNav();
    }
  });

  /* ═══════════════════════ NAVIGATION OBSERVER ═══════════════════════ */
  var desktopNavLinks = Array.from(document.querySelectorAll(".site-nav a"));
  var allNavTrackedLinks = desktopNavLinks.concat(mobileLinks);
  var sectionIds = ["systems", "projects", "case", "method", "about", "contact"];
  var sections = sectionIds.map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        allNavTrackedLinks.forEach(function (link) {
          var href = link.getAttribute("href");
          var matches = href === "#" + entry.target.id;
          if (matches) link.setAttribute("aria-current", "location");
          else if (href && href.startsWith("#")) link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-25% 0px -55%", threshold: 0 });
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ═══════════════════════ SANA'A TIME & YEAR ═══════════════════════ */
  function updateTime() {
    var clock = document.getElementById("clock");
    var mobileClock = document.getElementById("mobileClock");
    var year = document.getElementById("year");
    var now = new Date();
    var timeString = "";
    try {
      timeString = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Aden", hour: "2-digit", minute: "2-digit", hour12: false
      }).format(now);
    } catch (e) {
      timeString = now.toTimeString().substring(0, 5);
    }
    if (clock) clock.textContent = timeString;
    if (mobileClock) mobileClock.textContent = timeString;
    if (year) year.textContent = String(now.getFullYear());
  }
  updateTime();
  window.setInterval(updateTime, 30000);

  /* ═══════════════════════ COPY EMAIL ═══════════════════════ */
  var copyButton = document.querySelector("[data-copy-email]");
  var copyStatus = document.querySelector("[data-copy-status]");
  if (copyButton) {
    window.copyEmailAddress = function () {
      var email = copyButton.getAttribute("data-copy-email") || "mbabaqi2020@gmail.com";
      function success() {
        copyButton.textContent = "Email copied!";
        if (copyStatus) copyStatus.textContent = email + " copied to clipboard.";
        window.setTimeout(function () {
          copyButton.textContent = "Copy email";
          if (copyStatus) copyStatus.textContent = "";
        }, 2400);
      }
      function failure() {
        if (copyStatus) copyStatus.textContent = "Please write to " + email;
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(success, failure);
      } else {
        var field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        try {
          if (document.execCommand("copy")) success();
          else failure();
        } catch (error) { failure(); }
        field.remove();
        copyButton.focus();
      }
    };
  }

  /* ═══════════════════════ REVEAL ANIMATIONS ═══════════════════════ */
  var revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

    revealItems.forEach(function (item, index) {
      if (item.closest(".hero")) {
        item.style.transitionDelay = Math.min(index * 80, 320) + "ms";
      }
      revealObserver.observe(item);
    });
  }

  /* ═══════════════════════ 3D TILT EFFECT ═══════════════════════ */
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  if (finePointer && !reducedMotion) {
    var tiltTargets = document.querySelectorAll(".capability, .hero-console, .portrait, .terminal, .project-card");
    var maxTilt = 5;
    tiltTargets.forEach(function (el) {
      el.setAttribute("data-tilt", "");
      el.addEventListener("pointermove", function (event) {
        var rect = el.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width;
        var py = (event.clientY - rect.top) / rect.height;
        var tiltY = (px - 0.5) * maxTilt * 2;
        var tiltX = (0.5 - py) * maxTilt * 2;
        el.style.setProperty("--tilt-x", tiltX.toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", tiltY.toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--tilt-x", "0deg");
        el.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  /* ═══════════════════════ BACKGROUND DATA FIELD ═══════════════════════ */
  var canvas = document.getElementById("dataField");
  if (canvas && canvas.getContext && !reducedMotion) {
    var context = canvas.getContext("2d");
    var width = 0, height = 0, ratio = 1;
    var nodes = [];
    var frame = 0;

    function resizeField() {
      ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.floor(window.innerWidth * ratio);
      height = Math.floor(window.innerHeight * ratio);
      canvas.width = width;
      canvas.height = height;
      var count = Math.min(48, Math.round(window.innerWidth / 28));
      nodes = Array.from({ length: count }, function () {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (.7 + Math.random() * 1.5) * ratio,
          speed: (.08 + Math.random() * .22) * ratio,
          phase: Math.random() * Math.PI * 2
        };
      });
    }

    function drawField() {
      context.clearRect(0, 0, width, height);
      frame += .012;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.y -= node.speed;
        if (node.y < -6) {
          node.y = height + 6;
          node.x = Math.random() * width;
        }
        var alpha = .08 + .1 * Math.sin(frame + node.phase);
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(17, 103, 216, " + Math.max(0, alpha).toFixed(3) + ")";
        context.fill();
      }
      window.requestAnimationFrame(drawField);
    }

    resizeField();
    drawField();
    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeField, 120);
    });
  }

  /* ═══════════════════════ AI AGENT STEP CYCLE ═══════════════════════ */
  var agentSteps = Array.from(document.querySelectorAll(".agent-step"));
  if (agentSteps.length && !reducedMotion) {
    var activeStepIdx = 2; // initial active step index (Observe & Eval)
    window.setInterval(function () {
      agentSteps.forEach(function (step, i) {
        step.classList.remove("is-active");
        if (i < activeStepIdx) {
          step.classList.add("is-done");
        } else if (i === activeStepIdx) {
          step.classList.remove("is-done");
          step.classList.add("is-active");
        } else {
          step.classList.remove("is-done");
        }
      });
      activeStepIdx = (activeStepIdx + 1) % agentSteps.length;
    }, 3800);
  }

  /* ═══════════════════════ GSAP ENHANCEMENTS (IF AVAILABLE) ═══════════════════════ */
  if (typeof gsap !== "undefined" && !reducedMotion) {
    if (typeof ScrollTrigger !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Hero metrics counter animation
      document.querySelectorAll(".hero-metric-num").forEach(function (el) {
        var targetVal = parseFloat(el.getAttribute("data-count"));
        if (!isNaN(targetVal) && targetVal > 0) {
          var isDecimal = targetVal % 1 !== 0;
          var obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el, start: "top 90%", once: true,
            onEnter: function () {
              gsap.to(obj, {
                val: targetVal, duration: 1.8, ease: "power2.out",
                onUpdate: function () {
                  el.textContent = isDecimal
                    ? obj.val.toFixed(2) + "%"
                    : Math.round(obj.val) + (el.textContent.includes("M") ? "M+" : "");
                }
              });
            }
          });
        }
      });

      // Modeling bars animation on scroll
      var schemaTrack = document.querySelector(".capability-schema");
      if (schemaTrack) {
        ScrollTrigger.create({
          trigger: schemaTrack, start: "top 85%", once: true,
          onEnter: function () {
            gsap.from(".schema-bar-fill", {
              width: "0%", duration: 1.2, ease: "power2.out", stagger: .2
            });
          }
        });
      }
    }
  }

})();
