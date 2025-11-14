
    // purely cosmetic: set year (you can remove if you want zero JS)
    document.getElementById("year").textContent = new Date().getFullYear();
      // ABOUT overlay
  const aboutOverlay = document.getElementById('aboutme-overlay');
  const aboutOpen = document.querySelector('.js-about-open');
  const aboutClose = document.querySelector('.js-about-close');

  if (aboutOpen && aboutOverlay && aboutClose) {
    aboutOpen.addEventListener('click', () => {
      aboutOverlay.classList.add('is-visible');
    });
    aboutClose.addEventListener('click', () => {
      aboutOverlay.classList.remove('is-visible');
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    // ...your other overlay / contact / charity JS...

    // Supported Associations "View All" overlay
    const assocOverlay = document.getElementById('associations-overlay');
    const assocOpen = document.querySelector('.js-assoc-open');
    const assocClose = document.querySelector('.js-assoc-close');

    if (assocOverlay && assocOpen && assocClose) {
      assocOpen.addEventListener('click', () => {
        assocOverlay.classList.add('is-visible');
      });

      assocClose.addEventListener('click', () => {
        assocOverlay.classList.remove('is-visible');
      });
    }
  });
  // CHARITY overlay
  const charityOverlay = document.getElementById('charity-overlay');
  const charityOpen = document.querySelector('.js-charity-open');
  const charityClose = document.querySelector('.js-charity-close');

  if (charityOpen && charityOverlay && charityClose) {
    charityOpen.addEventListener('click', () => {
      charityOverlay.classList.add('is-visible');
    });
    charityClose.addEventListener('click', () => {
      charityOverlay.classList.remove('is-visible');
    });
  }

  // Expand/collapse charity cards (image zoom + paragraphs)
  const charityCards = document.querySelectorAll('.charity-card');
  charityCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });

document.addEventListener('DOMContentLoaded', function () {
  const bubbles = Array.from(document.querySelectorAll('.company-bubble'));
  const prevBtn = document.querySelector('.companies-arrow--prev');
  const nextBtn = document.querySelector('.companies-arrow--next');

  if (!bubbles.length || !prevBtn || !nextBtn) return;

  let current = 2; // start with the 3rd item (Mercedes) in center, like your design

  // Function to update the positions of the bubbles based on the current index
  function updatePositions() {
    const n = bubbles.length;

    bubbles.forEach((bubble, i) => {
      bubble.className = 'company-bubble'; // reset

      // distance from current index in circular list
      let diff = (i - current + n) % n;
      if (diff > n / 2) diff -= n; // normalize to negative for left side

      // assign positional classes
      if (diff === 0) {
        bubble.classList.add('company-bubble--center');
      } else if (diff === -1) {
        bubble.classList.add('company-bubble--left');
      } else if (diff === 1) {
        bubble.classList.add('company-bubble--right');
      } else if (diff === -2) {
        bubble.classList.add('company-bubble--far-left');
      } else if (diff === 2) {
        bubble.classList.add('company-bubble--far-right');
      } else {
        // off-screen / hidden
        bubble.style.opacity = 0;
        bubble.style.pointerEvents = 'none';
        return;
      }

      // visible states
      bubble.style.opacity = '';
      bubble.style.pointerEvents = diff === 0 ? 'auto' : 'none';
    });
  }

  // Arrow click functionality
  prevBtn.addEventListener('click', () => {
    current = (current - 1 + bubbles.length) % bubbles.length;
    updatePositions();
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % bubbles.length;
    updatePositions();
  });

  // Image click functionality
  bubbles.forEach((bubble, index) => {
    bubble.addEventListener('click', () => {
      current = index; // set the current to the clicked bubble's index
      updatePositions();
    });
  });

  // Init the carousel
  updatePositions();
});

document.addEventListener('DOMContentLoaded', function () {
  // OPEN individual SA overlays
  document.querySelectorAll('.js-sa-open').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.assoc;           // e.g. "foodbank"
      const overlay = document.getElementById('sa-' + key);
      if (overlay) {
        overlay.classList.add('is-visible');
      }
    });
  });

  // CLOSE individual SA overlays
  document.querySelectorAll('.js-sa-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.sa-overlay');
      if (overlay) {
        overlay.classList.remove('is-visible');
      }
    });
  });

  // Optional: click backdrop to close
  document.querySelectorAll('.sa-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('is-visible');
      }
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
