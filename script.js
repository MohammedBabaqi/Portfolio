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
        var localX = event.clientX - rect.left;
        var localY = event.clientY - rect.top;
        var px = localX / rect.width;
        var py = localY / rect.height;
        var tiltY = (px - 0.5) * maxTilt * 2;
        var tiltX = (0.5 - py) * maxTilt * 2;
        el.style.setProperty("--tilt-x", tiltX.toFixed(2) + "deg");
        el.style.setProperty("--tilt-y", tiltY.toFixed(2) + "deg");
        el.style.setProperty("--mouse-x", localX.toFixed(1) + "px");
        el.style.setProperty("--mouse-y", localY.toFixed(1) + "px");
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

  /* ═══════════════════════ AI AGENT STEP CYCLE & INTERACTION ═══════════════════════ */
  var agentSteps = Array.from(document.querySelectorAll(".agent-step"));
  if (agentSteps.length && !reducedMotion) {
    var activeStepIdx = 2; // initial active step index (Observe & Eval)
    var agentTimer = null;
    var isAgentHovered = false;

    function renderAgentStep(idx) {
      agentSteps.forEach(function (step, i) {
        step.classList.remove("is-active");
        if (i < idx) {
          step.classList.add("is-done");
        } else if (i === idx) {
          step.classList.remove("is-done");
          step.classList.add("is-active");
        } else {
          step.classList.remove("is-done");
        }
      });
    }

    function startAgentLoop() {
      if (agentTimer) window.clearInterval(agentTimer);
      agentTimer = window.setInterval(function () {
        if (isAgentHovered) return;
        activeStepIdx = (activeStepIdx + 1) % agentSteps.length;
        renderAgentStep(activeStepIdx);
      }, 3600);
    }

    renderAgentStep(activeStepIdx);
    startAgentLoop();

    agentSteps.forEach(function (step, i) {
      step.addEventListener("pointerenter", function () {
        isAgentHovered = true;
        activeStepIdx = i;
        renderAgentStep(i);
      });
      step.addEventListener("pointerleave", function () {
        isAgentHovered = false;
      });
      step.addEventListener("click", function () {
        activeStepIdx = i;
        renderAgentStep(i);
      });
    });
  }

  /* ═══════════════════════ CASE STUDY SCROLL INTERACTION ═══════════════════════ */
  var caseBeats = Array.from(document.querySelectorAll(".case-beats li"));
  var caseTerminalLines = Array.from(document.querySelectorAll("#caseTerminalBody .t-line"));
  var caseStats = Array.from(document.querySelectorAll(".case-stats div"));

  function activateCaseStep(stepNum) {
    var stepStr = String(stepNum);

    // Update active beat in story list
    caseBeats.forEach(function (beat) {
      if (beat.getAttribute("data-step") === stepStr) {
        beat.classList.add("is-active");
      } else {
        beat.classList.remove("is-active");
      }
    });

    // Update active stat
    caseStats.forEach(function (stat) {
      if (stat.getAttribute("data-step") === stepStr) {
        stat.classList.add("is-active");
      } else {
        stat.classList.remove("is-active");
      }
    });

    // Highlight terminal lines according to the active step
    caseTerminalLines.forEach(function (line) {
      var lineStep = line.getAttribute("data-step");
      if (lineStep === stepStr) {
        line.classList.add("is-active-line");
      } else {
        line.classList.remove("is-active-line");
      }
    });
  }

  // Pointer hover interaction for instant feedback
  caseBeats.forEach(function (beat) {
    beat.addEventListener("pointerenter", function () {
      var s = parseInt(beat.getAttribute("data-step"), 10);
      if (s) activateCaseStep(s);
    });
  });

  // Scroll synchronization
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
    caseBeats.forEach(function (beat) {
      var s = parseInt(beat.getAttribute("data-step"), 10);
      ScrollTrigger.create({
        trigger: beat,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: function () { activateCaseStep(s); },
        onEnterBack: function () { activateCaseStep(s); }
      });
    });
  } else if ("IntersectionObserver" in window && caseBeats.length) {
    var caseObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var s = parseInt(entry.target.getAttribute("data-step"), 10);
          if (s) activateCaseStep(s);
        }
      });
    }, { rootMargin: "-30% 0px -40%", threshold: 0.1 });

    caseBeats.forEach(function (beat) {
      caseObserver.observe(beat);
    });
  }
  /* ═══════════════════════ METHOD SCROLL FADE & STEP FOCUS ═══════════════════════ */
  var methodSteps = Array.from(document.querySelectorAll(".method-list li"));
  if (methodSteps.length) {
    function focusMethodStep(targetStep) {
      methodSteps.forEach(function (step) {
        if (step === targetStep) {
          step.classList.add("is-focused");
        } else {
          step.classList.remove("is-focused");
        }
      });
    }

    // Default first step focused on load
    if (methodSteps[0]) methodSteps[0].classList.add("is-focused");

    // Pointer hover feedback
    methodSteps.forEach(function (step) {
      step.addEventListener("pointerenter", function () {
        focusMethodStep(step);
      });
    });

    // Scroll synchronization
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined" && !reducedMotion) {
      methodSteps.forEach(function (step) {
        ScrollTrigger.create({
          trigger: step,
          start: "top 62%",
          end: "bottom 38%",
          onEnter: function () { focusMethodStep(step); },
          onEnterBack: function () { focusMethodStep(step); }
        });
      });
    } else if ("IntersectionObserver" in window) {
      var methodObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            focusMethodStep(entry.target);
          }
        });
      }, { rootMargin: "-25% 0px -40% 0px", threshold: 0.15 });

      methodSteps.forEach(function (step) {
        methodObserver.observe(step);
      });
    }
  }

  /* ═══════════════════════ ML BENCHMARK PROGRESS BARS ANIMATION ═══════════════════════ */
  var benchBars = Array.from(document.querySelectorAll(".ml-benchmark-rows .bench-bar-fill"));
  if (benchBars.length && !reducedMotion) {
    var benchContainer = document.querySelector(".ml-benchmark-rows");
    if (benchContainer) {
      // Set to 0% initially for dynamic expansion
      benchBars.forEach(function (bar) {
        bar.style.width = "0%";
      });

      function animateBenchBars() {
        benchBars.forEach(function (bar, idx) {
          var targetWidth = bar.getAttribute("data-width") || "80%";
          window.setTimeout(function () {
            bar.style.width = targetWidth;
          }, idx * 120);
        });
      }

      if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: benchContainer,
          start: "top 85%",
          once: true,
          onEnter: function () {
            animateBenchBars();
          }
        });
      } else if ("IntersectionObserver" in window) {
        var benchObserver = new IntersectionObserver(function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateBenchBars();
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        benchObserver.observe(benchContainer);
      } else {
        animateBenchBars();
      }
    }
  }

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

  /* ═══════════════════════ MODELING SCHEMA PROGRESS BARS ANIMATION ═══════════════════════ */
  var schemaBars = Array.from(document.querySelectorAll(".schema-bar-fill"));
  var schemaTrack = document.querySelector(".capability-schema");
  if (schemaTrack && schemaBars.length && !reducedMotion) {
    schemaBars.forEach(function (bar) {
      bar.style.width = "0%";
    });

    function animateSchemaBars() {
      schemaBars.forEach(function (bar, idx) {
        var target = bar.getAttribute("data-width") || "100%";
        window.setTimeout(function () {
          bar.style.width = target;
        }, idx * 160);
      });
    }

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: schemaTrack,
        start: "top 85%",
        once: true,
        onEnter: function () {
          animateSchemaBars();
        }
      });
    } else if ("IntersectionObserver" in window) {
      var schemaObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateSchemaBars();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      schemaObserver.observe(schemaTrack);
    } else {
      animateSchemaBars();
    }
  }
    }
  }

  /* ═══════════════════════ CREATIVE MOUSE OVER (DESKTOP ONLY) ═══════════════════════ */
  var isTouchUser = false;
  function disableCustomCursor() {
    isTouchUser = true;
    document.documentElement.classList.remove("has-custom-cursor");
    var cursorEl = document.getElementById("customCursor");
    if (cursorEl) cursorEl.style.display = "none";
    var selPill = document.getElementById("selectionTelemetry");
    if (selPill) selPill.style.display = "none";
  }
  window.addEventListener("touchstart", disableCustomCursor, { passive: true });

  var isFinePointerDevice = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var cursorEl = document.getElementById("customCursor");
  var cursorDot = document.getElementById("cursorDot");
  var cursorRing = document.getElementById("cursorRing");
  var cursorLabel = document.getElementById("cursorLabel");
  var selectionTelemetry = document.getElementById("selectionTelemetry");
  var selHex = document.getElementById("selHex");
  var selLen = document.getElementById("selLen");

  if (isFinePointerDevice && cursorEl && cursorDot && cursorRing && !reducedMotion) {
    var mouseX = -100, mouseY = -100;
    var ringX = -100, ringY = -100;
    var isCursorActive = false;

    // Immediately activate custom cursor class so default OS pointer is hidden on desktop
    document.documentElement.classList.add("has-custom-cursor");

    function onMove(e) {
      if (isTouchUser || e.pointerType === "touch") {
        disableCustomCursor();
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isCursorActive) {
        isCursorActive = true;
        cursorEl.classList.add("is-active");
        document.documentElement.classList.add("has-custom-cursor");
        ringX = mouseX;
        ringY = mouseY;
        cursorDot.style.transform = "translate3d(" + mouseX + "px, " + mouseY + "px, 0) translate(-50%, -50%)";
        cursorRing.style.transform = "translate3d(" + ringX.toFixed(2) + "px, " + ringY.toFixed(2) + "px, 0) translate(-50%, -50%)";
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });

    document.addEventListener("pointerdown", function (e) {
      if (isTouchUser || e.pointerType === "touch") {
        disableCustomCursor();
        return;
      }
      cursorEl.classList.add("is-down");
    });

    document.addEventListener("pointerup", function () {
      cursorEl.classList.remove("is-down");
    });

    document.addEventListener("mouseleave", function () {
      isCursorActive = false;
      cursorEl.classList.remove("is-active");
      document.documentElement.classList.remove("has-custom-cursor");
    });

    document.addEventListener("mouseenter", function (e) {
      if (!isTouchUser && e.pointerType !== "touch") {
        cursorEl.classList.add("is-active");
        document.documentElement.classList.add("has-custom-cursor");
      }
    });

    window.addEventListener("blur", function () {
      document.documentElement.classList.remove("has-custom-cursor");
      cursorEl.classList.remove("is-active");
    });

    window.addEventListener("focus", function () {
      if (!isTouchUser && isFinePointerDevice) {
        document.documentElement.classList.add("has-custom-cursor");
      }
    });

    // Interactive element hover state detection
    document.addEventListener("pointerover", function (e) {
      if (isTouchUser || !isCursorActive) return;
      var target = e.target;
      if (!target || !(target instanceof Element)) return;

      if (target.closest(".project-card, .portrait, .archive-window-frame")) {
        cursorEl.classList.add("is-view");
        cursorEl.classList.remove("is-hovering", "is-code");
        if (cursorLabel) cursorLabel.textContent = "VIEW";
      } else if (target.closest("code, pre, .terminal, .monitor, .agent-console")) {
        cursorEl.classList.add("is-code");
        cursorEl.classList.remove("is-hovering", "is-view");
        if (cursorLabel) cursorLabel.textContent = "EXEC";
      } else if (target.closest("a, button, .tag-list li, .schema-pill, .source, .hub, .destination, .method-list li, [data-copy-email]")) {
        cursorEl.classList.add("is-hovering");
        cursorEl.classList.remove("is-view", "is-code");
        if (cursorLabel) cursorLabel.textContent = "";
      } else {
        cursorEl.classList.remove("is-hovering", "is-view", "is-code");
        if (cursorLabel) cursorLabel.textContent = "";
      }
    });

    // 60fps Smooth Lerp Loop (responsive 0.36 factor prevents lag drift)
    function renderCursor() {
      if (isCursorActive && !isTouchUser) {
        ringX += (mouseX - ringX) * 0.36;
        ringY += (mouseY - ringY) * 0.36;
        cursorDot.style.transform = "translate3d(" + mouseX + "px, " + mouseY + "px, 0) translate(-50%, -50%)";
        cursorRing.style.transform = "translate3d(" + ringX.toFixed(2) + "px, " + ringY.toFixed(2) + "px, 0) translate(-50%, -50%)";
      }
      window.requestAnimationFrame(renderCursor);
    }
    renderCursor();
  }

  /* ═══════════════════════ CREATIVE TEXT SELECTION TELEMETRY ═══════════════════════ */
  if (selectionTelemetry && !reducedMotion) {
    function updateSelectionHUD() {
      if (isTouchUser) return;
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : "";
      if (text.length > 0 && sel.rangeCount > 0) {
        var range = sel.getRangeAt(0);
        var rect = range.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          // Check if selected range is in the visible viewport
          if (rect.bottom >= 70 && rect.top <= window.innerHeight - 30) {
            var hudTop = Math.max(70, rect.top - 38);
            var hudLeft = Math.min(window.innerWidth - 220, Math.max(12, rect.left + rect.width / 2 - 80));
            selectionTelemetry.style.top = hudTop + "px";
            selectionTelemetry.style.left = hudLeft + "px";
            selectionTelemetry.classList.add("is-active");

            if (selLen) {
              selLen.textContent = text.length + (text.length === 1 ? " CHAR" : " CHARS");
            }
            if (selHex) {
              var hexString = "";
              var sample = text.substring(0, 3);
              for (var i = 0; i < sample.length; i++) {
                hexString += "0x" + sample.charCodeAt(i).toString(16).toUpperCase() + " ";
              }
              selHex.textContent = hexString.trim();
            }
            return;
          }
        }
      }
      selectionTelemetry.classList.remove("is-active");
    }

    document.addEventListener("selectionchange", function () {
      var sel = window.getSelection();
      var hasText = sel && sel.toString().trim().length > 0;
      if (cursorEl) {
        if (hasText) {
          cursorEl.classList.add("is-selecting");
        } else {
          cursorEl.classList.remove("is-selecting");
        }
      }
      updateSelectionHUD();
    });

    // Real-time tracking on scroll (smoothly follows or fades out when scrolled past)
    window.addEventListener("scroll", function () {
      if (selectionTelemetry.classList.contains("is-active")) {
        updateSelectionHUD();
      }
    }, { passive: true });

    document.addEventListener("pointerup", function () {
      window.setTimeout(updateSelectionHUD, 60);
    });

    document.addEventListener("pointerdown", function (e) {
      if (selectionTelemetry && !e.target.closest("#selectionTelemetry")) {
        var sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          selectionTelemetry.classList.remove("is-active");
        }
      }
    });
  }

  /* ═══════════════════════ CIPHER TEXT SCRAMBLE (MOUSE OVER NUMBERS & STUFF) ═══════════════════════ */
  var scrambleTargets = Array.from(document.querySelectorAll(
    ".card-index, .project-badge, .eyebrow, .tag-list li, .schema-pill, .brand-card-btn, .about-link-pill, .method-code"
  ));

  var cipherChars = "01234567890123456789#%&*+=-_/<>";
  function scrambleElement(el) {
    if (el._isScrambling || reducedMotion || isTouchUser) return;
    var original = el.getAttribute("data-original-text") || el.textContent.trim();
    if (!el.getAttribute("data-original-text")) {
      el.setAttribute("data-original-text", original);
    }
    if (original.length > 40 || /[\u0600-\u06FF]/.test(original)) return;

    el._isScrambling = true;
    var iteration = 0;
    var maxIterations = original.length + 5;

    var scrambler = window.setInterval(function () {
      el.textContent = original.split("").map(function (char, idx) {
        if (char === " " || char === "/" || char === "·" || char === "→" || char === "★") return char;
        if (idx < iteration - 2) {
          return original[idx];
        }
        return cipherChars[Math.floor(Math.random() * cipherChars.length)];
      }).join("");

      iteration += 1;
      if (iteration >= maxIterations) {
        window.clearInterval(scrambler);
        el.textContent = original;
        el._isScrambling = false;
      }
    }, 28);
  }

  scrambleTargets.forEach(function (el) {
    el.addEventListener("pointerenter", function () {
      scrambleElement(el);
    });
  });

})();
