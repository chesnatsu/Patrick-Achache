
    // purely cosmetic: set year (you can remove if you want zero JS)
    document.getElementById("year").textContent = new Date().getFullYear();
      // ABOUT overlay
// ABOUT overlay
document.addEventListener('DOMContentLoaded', function () {
  const aboutOverlay = document.getElementById('aboutme-overlay');
  const aboutOpen    = document.querySelector('.js-about-open');

  if (!aboutOverlay || !aboutOpen) return;

  // open
  aboutOpen.addEventListener('click', () => {
    aboutOverlay.classList.add('is-visible');
  });

  // close by clicking the dark backdrop
  aboutOverlay.addEventListener('click', (e) => {
    if (e.target === aboutOverlay) {
      aboutOverlay.classList.remove('is-visible');
    }
  });
});
// CHARITY overlay
document.addEventListener('DOMContentLoaded', function () {
  const charityOverlay = document.getElementById('charity-overlay');
  const charityOpen    = document.querySelector('.js-charity-open');

  if (!charityOverlay || !charityOpen) return;

  // OPEN overlay
  charityOpen.addEventListener('click', () => {
    charityOverlay.classList.add('is-visible');
  });

  // CLOSE overlay by clicking backdrop
  charityOverlay.addEventListener('click', (e) => {
    if (e.target === charityOverlay) {
      charityOverlay.classList.remove('is-visible');
    }
  });

  /* ---------------------------
     READ MORE / READ LESS TOGGLE
     --------------------------- */
  const charityCards = document.querySelectorAll('.charity-card');

  charityCards.forEach(card => {
    const readLabel = card.querySelector('.read');

    // make label clickable only
    readLabel.style.pointerEvents = "auto";
    readLabel.style.cursor = "pointer";

    readLabel.addEventListener("click", (e) => {
      e.stopPropagation();  // prevent entire card from toggling

      card.classList.toggle("expanded");

      // toggle text
      if (card.classList.contains("expanded")) {
        readLabel.textContent = "Read less";
      } else {
        readLabel.textContent = "Read more";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".companies-track");
  const bubbles = Array.from(document.querySelectorAll(".company-bubble"));

  if (!track || bubbles.length === 0) return;

  const SPACING = 260;   // distance between bubble centers
  const SPEED = 40;      // auto slide speed (px/sec)

  let baseOffset = 0;
  let lastTime = null;
  let animID = null;

  // DRAG VARS
  let isDragging = false;
  let dragStartX = 0;
  let dragOffsetStart = 0;

  // ----------------------------------------------------
  // POSITION BUBBLES
  // ----------------------------------------------------
  function layoutBubbles() {
    const trackWidth = track.clientWidth;
    const centerX = trackWidth / 2;
    const totalWidth = SPACING * bubbles.length;

    bubbles.forEach((bubble, i) => {
      let logicalX = i * SPACING + baseOffset;

      // Infinity loop wrap
      let wrapped =
        ((logicalX % totalWidth) + totalWidth) % totalWidth - totalWidth / 2;

      const x = centerX + wrapped;
      bubble.style.left = `${x}px`;
    });
  }

  // ----------------------------------------------------
  // CENTER BUBBLE HIGHLIGHT
  // ----------------------------------------------------
  function updateCenterHighlight() {
    const trackRect = track.getBoundingClientRect();
    const centerPoint = trackRect.left + trackRect.width / 2;

    let closest = null;
    let closestDist = Infinity;

    bubbles.forEach((bubble) => {
      const rect = bubble.getBoundingClientRect();
      const bubbleCenter = rect.left + rect.width / 2;
      const dist = Math.abs(bubbleCenter - centerPoint);

      if (dist < closestDist) {
        closestDist = dist;
        closest = bubble;
      }
    });

    bubbles.forEach((b) => b.classList.remove("is-center"));
    if (closest) closest.classList.add("is-center");
  }

  // ----------------------------------------------------
  // AUTO MOVE LOOP
  // ----------------------------------------------------
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!isDragging) {
      baseOffset -= SPEED * dt;
    }

    const totalWidth = SPACING * bubbles.length;
    if (baseOffset <= -totalWidth) baseOffset += totalWidth;

    layoutBubbles();
    updateCenterHighlight();

    animID = requestAnimationFrame(loop);
  }

  // ----------------------------------------------------
  // DRAG START
  // ----------------------------------------------------
  function dragStart(clientX) {
    isDragging = true;
    dragStartX = clientX;
    dragOffsetStart = baseOffset;

    track.classList.add("is-dragging");

    cancelAnimationFrame(animID);
    animID = null;
  }

  // ----------------------------------------------------
  // DRAG MOVE
  // ----------------------------------------------------
  function dragMove(clientX) {
    if (!isDragging) return;

    const delta = clientX - dragStartX;
    baseOffset = dragOffsetStart + delta;

    layoutBubbles();
    updateCenterHighlight();
  }

  // ----------------------------------------------------
  // DRAG END
  // ----------------------------------------------------
  function dragEnd() {
    if (!isDragging) return;

    isDragging = false;
    track.classList.remove("is-dragging");

    lastTime = null;
    animID = requestAnimationFrame(loop);
  }

  // ----------------------------------------------------
  // MOUSE EVENTS
  // ----------------------------------------------------
  track.addEventListener("mousedown", (e) => dragStart(e.clientX));
  window.addEventListener("mousemove", (e) => dragMove(e.clientX));
  window.addEventListener("mouseup", dragEnd);

  // ----------------------------------------------------
  // TOUCH EVENTS
  // ----------------------------------------------------
  track.addEventListener(
    "touchstart",
    (e) => dragStart(e.touches[0].clientX),
    { passive: true }
  );
  track.addEventListener(
    "touchmove",
    (e) => dragMove(e.touches[0].clientX),
    { passive: true }
  );
  track.addEventListener("touchend", dragEnd);

  // ----------------------------------------------------
  // INIT
  // ----------------------------------------------------
  layoutBubbles();
  updateCenterHighlight();
  animID = requestAnimationFrame(loop);
});

// SUPPORTED ASSOCIATIONS "View All" overlay + individual overlays + READ MORE
document.addEventListener('DOMContentLoaded', function () {
  const assocOverlay = document.getElementById('associations-overlay');
  const assocOpen    = document.querySelector('.js-assoc-open');

  /* ------------------------------------------
     A. Individual SA overlays (small Read More)
     ------------------------------------------ */
  document.querySelectorAll('.js-sa-open').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const key = btn.dataset.assoc;            // e.g. "foodbank"
      const overlay = document.getElementById('sa-' + key); // "sa-foodbank"

      if (overlay) {
        overlay.classList.add('is-visible');
      }
    });
  });

  // Close the small SA overlays by clicking the backdrop
  document.querySelectorAll('.sa-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('is-visible');
      }
    });
  });


  /* ------------------------------------------
     B. View All overlay (associations-overlay)
     ------------------------------------------ */
  if (assocOverlay && assocOpen) {
    // open
    assocOpen.addEventListener('click', () => {
      assocOverlay.classList.add('is-visible');
    });

    // close by clicking backdrop
    assocOverlay.addEventListener('click', (e) => {
      if (e.target === assocOverlay) {
        assocOverlay.classList.remove('is-visible');
      }
    });
  }


  /* ------------------------------------------
     C. READ MORE / READ LESS in assoc cards
     ------------------------------------------ */
  const assocCards = document.querySelectorAll('.assoc-card');

  assocCards.forEach(card => {
    const toggle = card.querySelector('.assoc-read-toggle');   // 👈 matches your HTML
    const extra  = card.querySelector('.assoc-extra-wrapper');

    if (!toggle || !extra) return; // skip if card has no extra content

    toggle.style.cursor = 'pointer';

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();

      card.classList.toggle('expanded');

      const expanded = card.classList.contains('expanded');
      toggle.textContent = expanded ? 'Read less' : 'Read more';
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const navLinks = document.querySelectorAll('.nav-link, .nav-center');

  const allOverlays = document.querySelectorAll(
    '.aboutme-overlay, ' +
    '.charity-all-overlay, ' +
    '.assoc-all-overlay, ' +
    '.sa-overlay, ' +
    '.assoc-overlay'
  );

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      allOverlays.forEach(ov => ov.classList.remove('is-visible'));
    });
  });
});

// PAGE LOADING SCREEN
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.classList.add("fade-out");
  }, 300); // slight delay for smooth effect
});
