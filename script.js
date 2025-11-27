document.getElementById("year").textContent = new Date().getFullYear();

  // ---------------------------------------------------
  // GLOBAL ANIMATION TRIGGER
  // ---------------------------------------------------

function triggerAnimation(element, direction = "left") {
  if (!element) return;
  const classMap = {
    left: "animate-from-left",
    right: "animate-from-right",
    top: "animate-from-top",
    bottom: "animate-from-bottom",
  };

  const cls = classMap[direction] || classMap.left;

  // Remove all animation classes
  element.classList.remove(
    "animate-from-left",
    "animate-from-right",
    "animate-from-top",
    "animate-from-bottom"
  );

  // Force reflow so the animation restarts
  void element.offsetWidth;
    element.classList.add(cls);
    element.addEventListener(
      "animationend",
      () => element.classList.remove(cls),
      { once: true }
    );
}

document.addEventListener('DOMContentLoaded', function () {
  const aboutOverlay = document.getElementById('aboutme-overlay');
  const aboutOpen    = document.querySelector('.js-about-open');

  if (aboutOverlay && aboutOpen) {
    aboutOpen.addEventListener('click', () => {
      showOverlay(aboutOverlay);
    });

    aboutOverlay.addEventListener('click', (e) => {
      if (e.target === aboutOverlay) aboutOverlay.classList.remove('is-visible');
    });
  }

  document.querySelector('[href="#home"]').addEventListener("click", () => {
    animateHero();
  });

  document.querySelector('[href="#about"]').addEventListener("click", () => {
    triggerAnimation(document.querySelector("#about .copy"), "left");
    triggerAnimation(document.querySelector("#about .image-stack"), "right");
  });

  document.querySelector('[href="#charity"]').addEventListener("click", () => {
    triggerAnimation(document.querySelector("#charity .charity-content"), "bottom");
  });

  const assocNavLink = document.querySelector('[href="#associations"]');
  assocNavLink.addEventListener("click", () => {
    const saItems = document.querySelectorAll("#associations .sa-item");
    saItems.forEach((item, index) => {
      const itemIndex = index + 1;
      triggerAnimation(item, [1,2,4,5].includes(itemIndex) ? "left" : "right");
    });
  });

  /* ---------------------------
    CHARITY OVERLAY
    --------------------------- */
  const charityOverlay = document.getElementById('charity-overlay');
  const charityOpen    = document.querySelector('.js-charity-open');

  if (!charityOverlay || !charityOpen) return;

  // OPEN overlay
  charityOpen.addEventListener('click', () => {
    showOverlay(charityOverlay);
  });

  // CLOSE overlay by clicking backdrop
  charityOverlay.addEventListener('click', (e) => {
    if (e.target === charityOverlay) {
      charityOverlay.classList.remove('is-visible');
    }
  });

  /* ---------------------------
    PAGINATION FOR CHARITY CARDS
    --------------------------- */
    const cards     = Array.from(document.querySelectorAll('#charity-overlay .charity-card'));
    const pagerRoot = document.getElementById('charity-pagination');
    const perPage   = 10;

    if (!cards.length || !pagerRoot) return;

    const totalPages = Math.ceil(cards.length / perPage);
    let currentPage  = 1; 

    function renderPage(page) {
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      currentPage = page;
      const start = (page - 1) * perPage;
      const end   = start + perPage;

      cards.forEach((card, index) => {
        card.style.display = (index >= start && index < end) ? "" : "none";
      });

      buildPager();

      const stack = document.getElementById('charity-stack');
      if (stack) {
        stack.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    function buildPager() {
      pagerRoot.innerHTML = "";
      if (totalPages <= 1) return;
      const MAX_VISIBLE = 3; 

      function createPageBtn(pageNum) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'charity-page-btn';
        btn.textContent = pageNum;
        btn.dataset.page = pageNum;
        if (pageNum === currentPage) {
          btn.classList.add('is-active');
        }
        btn.addEventListener('click', () => renderPage(pageNum));
        return btn;
      }

      function createArrowBtn(direction) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'charity-page-btn charity-page-btn--arrow';
        btn.innerHTML = direction === 'prev' ? '&lsaquo;' : '&rsaquo;';
        const target = direction === 'prev' ? currentPage - 1 : currentPage + 1;
        const disabled =
          (direction === 'prev' && currentPage === 1) ||
          (direction === 'next' && currentPage === totalPages);

        if (disabled) {
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => renderPage(target));
        }

        return btn;
      }

      function addEllipsis() {
        const span = document.createElement('span');
        span.className = 'charity-page-ellipsis';
        span.textContent = '…';
        pagerRoot.appendChild(span);
      }

      // PREV ARROW
      pagerRoot.appendChild(createArrowBtn('prev'));

      if (totalPages <= MAX_VISIBLE + 2) {
        for (let i = 1; i <= totalPages; i++) {
          pagerRoot.appendChild(createPageBtn(i));
        }
      } else {
        const firstPage = 1;
        const lastPage  = totalPages;

        let start = currentPage - 1;
        let end   = currentPage + 1;

        if (start <= 2) {
          start = 2;
          end   = start + (MAX_VISIBLE - 1);
        } else if (end >= lastPage - 1) {
          end   = lastPage - 1;
          start = end - (MAX_VISIBLE - 1);
        }

        pagerRoot.appendChild(createPageBtn(firstPage));

        if (start > 2) addEllipsis();

        // middle pages
        for (let p = start; p <= end && p < lastPage; p++) {
          pagerRoot.appendChild(createPageBtn(p));
        }

        // right ellipsis
        if (end < lastPage - 1) addEllipsis();

        // last
        pagerRoot.appendChild(createPageBtn(lastPage));
      }

      // NEXT ARROW
      pagerRoot.appendChild(createArrowBtn('next'));
    }

    renderPage(1);

    function resetCharityOverlayState() {
      renderPage(1);
      const stack = document.getElementById('charity-stack');
      if (stack) stack.scrollTo({ top: 0, behavior: 'auto' });
    }

    function resetAssocOverlayState() {
      const assocStack = document.querySelector('#associations-overlay .assoc-stack');
      if (assocStack) assocStack.scrollTo({ top: 0, behavior: 'auto' });
    }

    window.resetCharityOverlayState = resetCharityOverlayState;
    window.resetAssocOverlayState   = resetAssocOverlayState;

/* ------------------------------------------
   READ MORE / READ LESS + MEDIA CAROUSEL + DOTS
   ------------------------------------------ */
  cards.forEach(card => {
    const toggle = card.querySelector('.charity-read-toggle');
    const extra  = card.querySelector('.charity-extra-wrapper');
    const videoSlide = card.querySelector('.video-wrapper');

    const slides = card.querySelectorAll('.media-slide');
    const prev   = card.querySelector('.media-prev');
    const next   = card.querySelector('.media-next');

    let currentIndex = 0;

    /* ------------------------------------------
      CREATE DOTS ONLY IF >= 2 IMAGES
      ------------------------------------------ */
    let dots = [];
    let dotsWrap = null;

    if (slides.length >= 2) {
      dotsWrap = document.createElement('div');
      dotsWrap.className = 'media-dots';
      dotsWrap.style.display = 'none';

      slides.forEach((_slide, i) => {
        const dot = document.createElement('div');
        dot.className = 'media-dot';
        if (i === 0) dot.classList.add('is-active');
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });

      const mediaInner = card.querySelector('.media-inner');
      if (mediaInner) {
        mediaInner.appendChild(dotsWrap);
      }
    }
    if (videoSlide) {
      const video = videoSlide.querySelector('video');
      const playIcon = videoSlide.querySelector('.play-icon');

      videoSlide.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentIndex !== Array.from(slides).indexOf(videoSlide)) return;

        video.play();
        playIcon.style.display = 'none';
      });
    }

    /* ------------------------------------------
      CAROUSEL FUNCTION
      ------------------------------------------ */
    function showSlide(index) {
      if (!slides.length) return;

      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      currentIndex = index;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.classList.toggle('is-active', isActive);

        // If slide is a VIDEO → play/pause
        const video = slide.querySelector('video');
        const playIcon = slide.querySelector('.play-icon');

        if (video) {
          if (isActive) {
            video.currentTime = 0;
            video.play();
            if (playIcon) playIcon.style.display = 'none';
          } else {
            video.pause();
            video.currentTime = 0;
            if (playIcon) playIcon.style.display = 'flex';
          }
        }
      });

      // Update dots
      if (dots.length) {
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === currentIndex);
        });
      }
    }

    /* hide arrows if only 1 slide */
    if (slides.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
    } else {
      showSlide(0);

      if (prev) {
        prev.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          showSlide(currentIndex - 1);
        });
      }

      if (next) {
        next.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          showSlide(currentIndex + 1);
        });
      }
    }

    /* ------------------------------------------
      EXPAND / COLLAPSE — ONLY ONE OPEN AT A TIME
      ------------------------------------------ */
    if (toggle && extra) {
      toggle.style.cursor = 'pointer';

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();

        const isCurrentlyExpanded = card.classList.contains('expanded');
        const willExpand = !isCurrentlyExpanded;

        // 1) CLOSE ALL OTHER CARDS FIRST
        cards.forEach(otherCard => {
          if (otherCard !== card && otherCard.classList.contains('expanded')) {
            otherCard.classList.remove('expanded');

            // reset their toggle text
            const otherToggle = otherCard.querySelector('.charity-read-toggle');
            if (otherToggle) {
              otherToggle.textContent = 'Read more';
            }

            // hide their dots
            const otherDotsWrap = otherCard.querySelector('.media-dots');
            if (otherDotsWrap) {
              otherDotsWrap.style.display = 'none';
            }

            // reset their slides to first
            const otherSlides = otherCard.querySelectorAll('.media-slide');
            const otherDots   = otherCard.querySelectorAll('.media-dot');

            otherSlides.forEach((slide, i) => {
              slide.classList.toggle('is-active', i === 0);
            });
            otherDots.forEach((dot, i) => {
              dot.classList.toggle('is-active', i === 0);
            });
          }
        });

        // 2) TOGGLE THIS CARD
        card.classList.toggle('expanded', willExpand);
        toggle.textContent = willExpand ? 'Read less' : 'Read more';

        // show dots only when this one is expanded
        if (dotsWrap) {
          dotsWrap.style.display = willExpand ? 'flex' : 'none';
        }

        // reset slide when collapsing this card
        if (!willExpand) {
          showSlide(0);
        }
      });
    }
  });

    /* ---------------------------
     SUPPORTED ASSOCIATION
     --------------------------- */

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
              showOverlay(overlay);
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
        assocOpen.addEventListener('click', () => {
          showOverlay(assocOverlay);
        });

        // close by clicking backdrop
        assocOverlay.addEventListener('click', (e) => {
          if (e.target === assocOverlay) {
            assocOverlay.classList.remove('is-visible');
          }
        });
      }


    /* ------------------------------------------
      C. READ MORE / READ LESS + CAROUSEL in assoc cards
        (only one open at a time)
      ------------------------------------------ */
   const assocCards = document.querySelectorAll('.assoc-card');
      assocCards.forEach(card => {
        const toggle = card.querySelector('.assoc-read-toggle');
        const extra  = card.querySelector('.assoc-extra-wrapper');

        // --- CAROUSEL PART (optional per card) ---
        const slides = card.querySelectorAll('.media-slide');
        const prev   = card.querySelector('.media-prev');
        const next   = card.querySelector('.media-next');

        let currentIndex = 0;
        let dotsWrap = null;
        let dots = [];

        // Create dots only when there are at least 2 slides
        if (slides.length >= 2) {
          dotsWrap = document.createElement('div');
          dotsWrap.className = 'media-dots';
          dotsWrap.style.display = 'none'; // only when expanded

          slides.forEach((_slide, i) => {
            const dot = document.createElement('div');
            dot.className = 'media-dot';
            if (i === 0) dot.classList.add('is-active');
            dotsWrap.appendChild(dot);
            dots.push(dot);

            dot.addEventListener('click', (e) => {
              e.stopPropagation();
              showSlide(i);
            });
          });

          const mediaInner = card.querySelector('.media-inner');
          if (mediaInner) {
            mediaInner.appendChild(dotsWrap);
          }
        }

        function showSlide(index) {
          if (!slides.length) return;

          if (index < 0) index = slides.length - 1;
          if (index >= slides.length) index = 0;
          currentIndex = index;

          slides.forEach((slide, i) => {
            slide.classList.toggle('is-active', i === currentIndex);
          });

          if (dots.length) {
            dots.forEach((dot, i) => {
              dot.classList.toggle('is-active', i === currentIndex);
            });
          }
        }

        // Wire prev/next
        if (slides.length <= 1) {
          if (prev) prev.style.display = 'none';
          if (next) next.style.display = 'none';
        } else {
          showSlide(0);

          if (prev) {
            prev.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              showSlide(currentIndex - 1);
            });
          }

          if (next) {
            next.addEventListener('click', (e) => {
              e.stopPropagation();
              e.preventDefault();
              showSlide(currentIndex + 1);
            });
          }
        }

        // --- EXPAND / COLLAPSE PART ---
        if (!toggle || !extra) return;

        toggle.style.cursor = 'pointer';

        toggle.addEventListener('click', (e) => {
          e.stopPropagation();

          const isExpanded = card.classList.contains('expanded');
          const willExpand = !isExpanded;

          // 1) CLOSE ALL OTHER assoc-cards
          assocCards.forEach(otherCard => {
            if (otherCard !== card && otherCard.classList.contains('expanded')) {
              otherCard.classList.remove('expanded');

              const otherToggle = otherCard.querySelector('.assoc-read-toggle');
              if (otherToggle) {
                otherToggle.textContent = 'Read more';
              }

              // hide their dots if they have any
              const otherDotsWrap = otherCard.querySelector('.media-dots');
              if (otherDotsWrap) {
                otherDotsWrap.style.display = 'none';
              }

              // reset their slides to first
              const otherSlides = otherCard.querySelectorAll('.media-slide');
              const otherDots   = otherCard.querySelectorAll('.media-dot');

              otherSlides.forEach((slide, i) => {
                slide.classList.toggle('is-active', i === 0);
              });
              otherDots.forEach((dot, i) => {
                dot.classList.toggle('is-active', i === 0);
              });
            }
          });

          // 2) TOGGLE THIS CARD
          card.classList.toggle('expanded', willExpand);
          toggle.textContent = willExpand ? 'Read less' : 'Read more';

          // 3) Show/hide dots for this card
          if (dotsWrap) {
            dotsWrap.style.display = willExpand ? 'flex' : 'none';
          }

          // Reset slide when collapsing
          if (!willExpand) {
            showSlide(0);
          }
        });
      });
    });

    /* -------------------------------------------------------
      AUTO-SLIDE CAROUSEL — Only when card is EXPANDED
    ------------------------------------------------------- */
    document.querySelectorAll('.charity-card, .assoc-card').forEach(card => {
      const mediaInner = card.querySelector('.media-inner');
      if (!mediaInner) return;

      const slides = mediaInner.querySelectorAll('.media-slide');
      const prevBtn = mediaInner.querySelector('.media-prev');
      const nextBtn = mediaInner.querySelector('.media-next');

      if (slides.length <= 1) return;

      let index = 0;
      let autoTimer = null;

      function showSlide(i) {
        slides.forEach(s => s.classList.remove('is-active'));
        slides[i].classList.add('is-active');

        const dots = mediaInner.querySelectorAll('.media-dot');
        if (dots.length) {
          dots.forEach(d => d.classList.remove('is-active'));
          dots[i].classList.add('is-active');
        }
      }

      function nextSlide() {
        index = (index + 1) % slides.length;
        showSlide(index);
      }

      function prevSlide() {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
      }

      function startAuto() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(nextSlide, 3000);
      }

      function stopAuto() {
        clearInterval(autoTimer);
        autoTimer = null;
      }

      if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        if (card.classList.contains('expanded')) startAuto();
      });

      if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        if (card.classList.contains('expanded')) startAuto();
      });

      const toggleBtn = card.querySelector('.charity-read-toggle, .assoc-read-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (card.classList.contains('expanded')) {
              startAuto();
            } else {
              stopAuto();
            }
          }, 50);
        });
      }

      card.addEventListener('transitionend', () => {
        if (!card.classList.contains('expanded')) stopAuto();
      });
    });
    

    function resetAllExpandableCards() {
      // CHARITY CARDS
      document.querySelectorAll('.charity-card, .assoc-card').forEach(card => {
        card.classList.remove('expanded');

        const toggle = card.querySelector('.charity-read-toggle, .assoc-read-toggle');
        if (toggle) toggle.textContent = 'Read more';

        // hide dots (if you’re using them)
        const dotsWrap = card.querySelector('.media-dots');
        if (dotsWrap) dotsWrap.style.display = 'none';

        // reset slides to first
        const slides = card.querySelectorAll('.media-slide');
        const dots   = card.querySelectorAll('.media-dot');

        slides.forEach((slide, i) => {
          slide.classList.toggle('is-active', i === 0);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === 0);
        });
      });
    }

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

          // collapse cards + toggles
          resetAllExpandableCards();

          // reset pagination + scroll to top for overlays
          if (window.resetCharityOverlayState) window.resetCharityOverlayState();
          if (window.resetAssocOverlayState)   window.resetAssocOverlayState();
        });
      });
    });

    document.addEventListener("click", function (e) {
      const overlay = e.target.closest(".aboutme-overlay, .charity-all-overlay, .assoc-all-overlay, .sa-overlay, .assoc-overlay");

      // If click is OUTSIDE all overlays → do nothing
      if (!overlay) return;

      // If click is inside a white card / inner content, don't close
      const innerCard = e.target.closest(
        ".aboutme-inner, .stack, .assoc-stack, .sa-overlay-card"
      );
      if (innerCard) return;

        // Otherwise, clicked on the backdrop → close
        overlay.classList.remove("is-visible");

        // reset cards (charity + assoc), and overlays’ scroll/page
        resetAllExpandableCards();
        if (window.resetCharityOverlayState) window.resetCharityOverlayState();
        if (window.resetAssocOverlayState)   window.resetAssocOverlayState();
      });


    // Function to trigger hero animations
    function animateHero() {
      const heroContent = document.querySelector("#home .hero-content");
      const heroText = document.querySelector("#home .hero-text");

      if (heroContent) triggerAnimation(heroContent, "left");
      if (heroText) triggerAnimation(heroText, "right");
    }

    function revealSectionsInOrder() {
      const order = [
        'home',
        'about',
        'charity',
        'associations',
        'contact'
      ];

      let delay = 0;

      order.forEach((key, index) => {
        const section = document.querySelector(`[data-section="${key}"]`);
        if (!section) return;

        setTimeout(() => {
          section.classList.add('section-visible');
        }, delay);

        delay += 400; 
      });
    }

    function hideLoaderAndStartSequence() {
      const loader = document.getElementById("loader");
      if (!loader || loader.classList.contains("fade-out")) return;

      loader.classList.add("fade-out");

      // Start the section reveal animation
      revealSectionsInOrder();

      // Also trigger your hero animation
      animateHero();
    }

    // Fast reveal on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(hideLoaderAndStartSequence, 400);
    });

    // Fallback if images or fonts are slow
    window.addEventListener("load", () => {
      setTimeout(hideLoaderAndStartSequence, 1200);
    });



    // NAV LINK CLICK
    document.querySelector('[href="#home"]').addEventListener("click", () => {
      animateHero();
    });

    // Helper: open overlay + register a history state
    function showOverlay(overlayEl) {
      if (!overlayEl) return;

      overlayEl.classList.add("is-visible");

      try {
        history.pushState(
          { overlay: overlayEl.id || true },
          "",
          window.location.href  
        );
      } catch (err) {
      }
    }

    // Close all overlays whenever history changes (back OR forward)
    window.addEventListener("popstate", () => {
      const allOverlays = document.querySelectorAll(
        ".aboutme-overlay, " +
        ".charity-all-overlay, " +
        ".assoc-all-overlay, " +
        ".sa-overlay, " +
        ".assoc-overlay"
      );

      allOverlays.forEach(ov => ov.classList.remove("is-visible"));
    });

  // ----------------------------------------------------
  // COMPANIES I WORKED FOR
  // ----------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const track   = document.querySelector(".companies-track");
  const bubbles = Array.from(document.querySelectorAll(".company-bubble"));

  // NEW: arrows
  const prevBtn = document.querySelector(".companies-arrow--prev");
  const nextBtn = document.querySelector(".companies-arrow--next");

  if (!track || bubbles.length === 0) return;

  const SPACING = 300;  
  const SPEED   = 40;    
  let baseOffset   = 0;
  let lastTime     = null;
  let animID       = null;

  // DRAG VARS
  let isDragging      = false;
  let dragStartX      = 0;
  let dragOffsetStart = 0;
  let hasDragged      = false;  

  // ----------------------------------------------------
  // POSITION BUBBLES
  // ----------------------------------------------------
  function layoutBubbles() {
    const trackWidth = track.clientWidth;
    const centerX    = trackWidth / 2;
    const totalWidth = SPACING * bubbles.length;

    bubbles.forEach((bubble, i) => {
      let logicalX = i * SPACING + baseOffset;
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
    const trackRect   = track.getBoundingClientRect();
    const centerPoint = trackRect.left + trackRect.width / 2;
    let closest     = null;
    let closestDist = Infinity;
    bubbles.forEach((bubble) => {
      const rect         = bubble.getBoundingClientRect();
      const bubbleCenter = rect.left + rect.width / 2;
      const dist         = Math.abs(bubbleCenter - centerPoint);

      if (dist < closestDist) {
        closestDist = dist;
        closest     = bubble;
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
    isDragging      = true;
    hasDragged      = false;
    dragStartX      = clientX;
    dragOffsetStart = baseOffset;

    track.classList.add("is-dragging");

    if (animID) {
      cancelAnimationFrame(animID);
      animID = null;
    }
  }

  // ----------------------------------------------------
  // DRAG MOVE
  // ----------------------------------------------------
  function dragMove(clientX) {
    if (!isDragging) return;
    const delta = clientX - dragStartX;
    if (Math.abs(delta) > 5) {
      hasDragged = true;
    }

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
      animID   = requestAnimationFrame(loop);
  }

  // ----------------------------------------------------
  // MOUSE EVENTS
  // ----------------------------------------------------
  track.addEventListener("mousedown", (e) => {
    dragStart(e.clientX);
  });

  bubbles.forEach((bubble) => {
    bubble.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragStart(e.clientX);
    });
  });

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
  // PREVENT LINK CLICK WHEN DRAGGED
  // ----------------------------------------------------
  bubbles.forEach((bubble) => {
    const link = bubble.querySelector("a");
    if (!link) return;

    link.addEventListener("click", (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // ----------------------------------------------------
  // NEW: ARROW BUTTONS
  // ----------------------------------------------------
  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      baseOffset += SPACING;  
      layoutBubbles();
      updateCenterHighlight();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      baseOffset -= SPACING;       
      layoutBubbles();
      updateCenterHighlight();
    });
  }

  layoutBubbles();
  updateCenterHighlight();
  animID = requestAnimationFrame(loop);
});

/* =====================================================
   CLICK IMAGE TO VIEW FULLSCREEN + TOOLBAR BUTTONS
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImg = lightbox.querySelector(".lightbox-img");

  /* --- CREATE TOOLBAR CONTAINER --- */
  const controls = document.createElement("div");
  controls.classList.add("lightbox-controls");
  lightbox.appendChild(controls);

  /* --- BUTTONS --- */
  const zoomBtn = document.createElement("button");
  zoomBtn.classList.add("zoom-in-btn");
  zoomBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 -3 26 30" fill="white">
      <path d="M10 2a8 8 0 105.292 14.292l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/>
    </svg>
  `;

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.classList.add("fullscreen-btn");
  fullscreenBtn.innerHTML = "⛶";

  const shareBtn = document.createElement("button");
  shareBtn.classList.add("share-btn");
  shareBtn.innerHTML = "↗";

  const closeBtn = document.createElement("button");
  closeBtn.classList.add("lightbox-close");
  closeBtn.innerHTML = "✕";

  /* Add buttons in order */
  controls.appendChild(zoomBtn);
  controls.appendChild(fullscreenBtn);
  controls.appendChild(shareBtn);
  controls.appendChild(closeBtn);

  /* --- SHARE MENU --- */
  const shareMenu = document.createElement("div");
  shareMenu.classList.add("share-menu");
  shareMenu.innerHTML = `
    <ul>
      <li data-share="facebook">
        <img 
          src="https://img.icons8.com/color/24/000000/facebook-new.png" 
          alt="Facebook" 
          style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;" 
        />
        Share on Facebook
      </li>
      <li data-share="twitter">
        <img 
          src="https://img.icons8.com/color/24/000000/twitter--v1.png" 
          alt="Twitter" 
          style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;" 
        />
        Share on Twitter
      </li>
      <li data-share="pinterest">
        <img 
          src="https://img.icons8.com/color/24/000000/pinterest--v1.png" 
          alt="Pinterest" 
          style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;" 
        />
        Pin it
      </li>
      <li data-download>
        <img 
          src="https://img.icons8.com/color/24/000000/download--v1.png" 
          alt="Download" 
          style="vertical-align: middle; margin-right: 8px; width: 20px; height: 20px;" 
        />
        Download image
      </li>
    </ul>
  `
  lightbox.appendChild(shareMenu);

  /* -----------------------------
      OPEN LIGHTBOX ON IMAGE CLICK
  ------------------------------ */
  document.querySelectorAll(
    ".media img, .media-slide, .sa-overlay-media img"
  ).forEach(el => {
    el.style.cursor = "zoom-in";

    el.addEventListener("click", (e) => {
      e.stopPropagation();

      let sourceEl = el;

      if (el.classList.contains("media-slide")) {
        const active = el.parentElement.querySelector(".media-slide.is-active");
        if (active) sourceEl = active;
      }

      let src = sourceEl.src;
      const inner = sourceEl.querySelector("img, video");
      if (!src && inner) src = inner.src;

      if (!src) return;

      lightboxImg.src = src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  /* --- CLOSE LIGHTBOX --- */
  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightboxImg.style.transform = "scale(1)";
    shareMenu.classList.remove("open");
    document.body.style.overflow = "";
  };

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target.classList.contains("lightbox-backdrop")) {
      closeLightbox();
    }
  });

  /* --- ZOOM BUTTON --- */
  zoomBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    lightboxImg.style.transform =
      lightboxImg.style.transform === "scale(2)" ? "scale(1)" : "scale(2)";
  });

  /* --- FULLSCREEN BUTTON --- */
  fullscreenBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      lightbox.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  /* --- SHARE BUTTON --- */
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    shareMenu.classList.toggle("open");
  });

  /* --- SHARE MENU ACTIONS --- */
  shareMenu.addEventListener("click", (e) => {
    const imgUrl = lightboxImg.src;

    // Share services
    if (e.target.dataset.share === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imgUrl)}`);
    }
    if (e.target.dataset.share === "twitter") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(imgUrl)}`);
    }
    if (e.target.dataset.share === "pinterest") {
      window.open(`https://pinterest.com/pin/create/button/?media=${encodeURIComponent(imgUrl)}`);
    }

    // Download
    if (e.target.dataset.download !== undefined) {
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = imgUrl.split("/").pop();
      a.click();
    }
  });

  /* Close menu when clicking outside */
  document.addEventListener("click", () => {
    shareMenu.classList.remove("open");
  });
});
