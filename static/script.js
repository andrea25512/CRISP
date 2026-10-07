// Copy-to-clipboard for the BibTeX block, with a text-selection fallback
// if the Clipboard API is unavailable or permission is refused.
// No external libraries, no tracking.
(function () {
  "use strict";

  var button = document.getElementById("copy-bib");
  var codeEl = document.getElementById("bibtex-code");
  var statusEl = document.getElementById("copy-status");

  if (!button || !codeEl) return;

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
      window.clearTimeout(setStatus._t);
      setStatus._t = window.setTimeout(function () {
        statusEl.textContent = "";
      }, 4000);
    }
  }

  function selectCodeBlock() {
    var range = document.createRange();
    range.selectNodeContents(codeEl);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  button.addEventListener("click", function () {
    var text = codeEl.innerText || codeEl.textContent;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          setStatus("Copied to clipboard.");
        },
        function () {
          // Clipboard permission refused: fall back to selecting the text.
          selectCodeBlock();
          setStatus("Clipboard unavailable \u2014 text selected, press Ctrl/Cmd+C to copy.");
        }
      );
    } else {
      // Clipboard API unavailable: fall back to selecting the text.
      selectCodeBlock();
      setStatus("Clipboard unavailable \u2014 text selected, press Ctrl/Cmd+C to copy.");
    }
  });
})();

// Accessible tabs (role=tablist/tab/tabpanel) for the qualitative results
// gallery. Click or native Enter/Space activates a tab; arrow keys move
// focus and selection together (automatic activation); Home/End jump to
// the first/last tab.
(function () {
  "use strict";

  var tablist = document.querySelector('.tablist[role="tablist"]');   // the gallery's own tab list (the carousels have theirs)
  if (!tablist) return;

  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  function selectTab(tab) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute("aria-selected", selected ? "true" : "false");
      t.tabIndex = selected ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !selected;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });

    tab.addEventListener("keydown", function (e) {
      var newIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        newIndex = (i + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        newIndex = (i - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      tabs[newIndex].focus();
      selectTab(tabs[newIndex]);
    });
  });
})();

// Full-screen lightbox for click-to-zoom figures. Any ".zoomable" button
// (wrapping an <img>) opens its image full-screen; Esc or a click on the
// backdrop/close button dismisses it; focus returns to the trigger button.
(function () {
  "use strict";

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var closeBtn = document.getElementById("lightbox-close");
  if (!lightbox || !lightboxImg || !closeBtn) return;

  var lastTrigger = null;
  var objectUrl = null;

  function onKeydown(e) {
    if (e.key === "Escape") closeLightbox();
  }

  // Inline SVGs are re-serialised to a standalone image with explicit size.
  function svgToUrl(svg) {
    var clone = svg.cloneNode(true);
    var vb = svg.viewBox.baseVal;
    clone.setAttribute("width", vb.width);
    clone.setAttribute("height", vb.height);
    clone.removeAttribute("style");
    clone.removeAttribute("tabindex");
    clone.removeAttribute("role");
    objectUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    return objectUrl;
  }

  function openLightbox(trigger) {
    var img = trigger.querySelector("img");
    if (!img) return;
    showLightbox(img.currentSrc || img.src, img.alt, trigger);
  }

  function showLightbox(src, alt, trigger) {
    if (window.getSelection && String(window.getSelection())) return;   // user is selecting text

    lastTrigger = trigger;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";

    var figure = trigger.closest("figure");
    var caption = figure ? figure.querySelector("figcaption") : null;
    if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent : "";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  document.querySelectorAll(".zoomable").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      openLightbox(trigger);
    });
  });

  // Carousel: clicking the visible slide (or pressing Enter on the focused carousel) enlarges it.
  document.querySelectorAll(".tcar").forEach(function (car) {
    function openActive() {
      var slides = car.querySelectorAll(".tcar-slides img");
      for (var k = 0; k < slides.length; k++) {
        if (slides[k].getAttribute("aria-hidden") !== "true") {
          showLightbox(slides[k].currentSrc || slides[k].src, slides[k].alt, car);
          return;
        }
      }
    }
    car.querySelector(".tcar-track").addEventListener("click", openActive);
    car.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target === car) openActive();
    });
  });

  // Method diagram: inline SVG.
  document.querySelectorAll("svg.inline-figure").forEach(function (svg) {
    svg.setAttribute("tabindex", "0");
    svg.setAttribute("role", "button");
    function open() { showLightbox(svgToUrl(svg), svg.getAttribute("aria-label"), svg); }
    svg.addEventListener("click", open);
    svg.addEventListener("keydown", function (e) {
      if (e.key === "Enter") open();
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
})();

// Teaser carousel: case tabs, arrows and Left/Right keys switch between cases.
document.querySelectorAll(".tcar").forEach(function (car) {
  var slides = car.querySelector(".tcar-slides");
  var tabs = car.querySelectorAll(".tcar-tab");
  var n = slides.children.length;
  var i = 0;
  function go(k) {
    i = (k + n) % n;
    slides.style.transform = "translateX(" + (-100 * i) + "%)";
    Array.prototype.forEach.call(tabs, function (t, j) {
      t.setAttribute("aria-selected", j === i ? "true" : "false");
      t.tabIndex = j === i ? 0 : -1;
    });
    Array.prototype.forEach.call(slides.children, function (s, j) {
      s.setAttribute("aria-hidden", j === i ? "false" : "true");
    });
  }
  Array.prototype.forEach.call(tabs, function (t, k) {
    t.addEventListener("click", function () { go(k); });
  });
  car.querySelector(".tcar-prev").addEventListener("click", function () { go(i - 1); });
  car.querySelector(".tcar-next").addEventListener("click", function () { go(i + 1); });
  car.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
    if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
  });
  go(0);
});

// Before/after comparison sliders: the range input (mouse, touch, keyboard) moves the
// split; the "Compare CRISP with" buttons swap the left image (baseline / ground truth).
document.querySelectorAll(".cmp").forEach(function (cmp) {
  var range = cmp.querySelector(".cmp-range");
  var imgA = cmp.querySelector(".cmp-a");
  var labA = cmp.querySelector(".cmp-lab-a");
  var tagA = cmp.querySelector(".cmp-tag-a");
  range.addEventListener("input", function () {
    cmp.style.setProperty("--pos", range.value + "%");
  });
  cmp.querySelectorAll(".cmp-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cmp.querySelectorAll(".cmp-switch button").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      imgA.src = btn.dataset.src;
      imgA.alt = btn.dataset.label;
      labA.querySelector("b").textContent = btn.dataset.label;
      labA.dataset.kind = btn.dataset.kind;
      tagA.textContent = btn.dataset.tag;
      range.setAttribute("aria-label", "Slide to compare " + btn.dataset.label + " (left) with Our Method (CRISP) (right)");
    });
  });
});
