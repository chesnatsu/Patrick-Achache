(() => {

  document.addEventListener("DOMContentLoaded", () => {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
  });

  // ---------------------------------------------------
  // HELPERS
  // ---------------------------------------------------

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => root.querySelectorAll(sel);

  const OVERLAY_SELECTORS = [
    ".aboutme-overlay",
    ".charity-all-overlay",
    ".assoc-all-overlay",
    ".sa-overlay",
    ".assoc-overlay"
  ];
  const ALL_OVERLAYS_SELECTOR = OVERLAY_SELECTORS.join(", ");

  function anyOverlayOpen() {
    return Array.from(qsa(ALL_OVERLAYS_SELECTOR)).some(ov =>
      ov.classList.contains("is-visible")
    );
  }

  function lockPageScroll() {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function unlockPageScroll() {
    if (!anyOverlayOpen()) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }

  function updateScrollLock() {
    if (anyOverlayOpen()) {
      lockPageScroll();
    } else {
      unlockPageScroll();
    }
  }

  // Trigger CSS animation on element
  function triggerAnimation(element, direction = "left") {
    if (!element) return;

    const classMap = {
      left: "animate-from-left",
      right: "animate-from-right",
      top: "animate-from-top",
      bottom: "animate-from-bottom"
    };

    const cls = classMap[direction] || classMap.left;

    element.classList.remove(
      "animate-from-left",
      "animate-from-right",
      "animate-from-top",
      "animate-from-bottom"
    );

    // force reflow so animation can restart
    void element.offsetWidth;

    element.classList.add(cls);
    element.addEventListener(
      "animationend",
      () => element.classList.remove(cls),
      { once: true }
    );
  }

  // Helper: open overlay + register history entry
  function showOverlay(overlayEl) {
    if (!overlayEl) return;
    overlayEl.classList.add("is-visible");
    updateScrollLock();

    try {
      history.pushState(
        { overlay: overlayEl.id || true },
        "",
        window.location.href
      );
    } catch {
      // ignore history errors
    }
  }

  function hideAllOverlays() {
    qsa(ALL_OVERLAYS_SELECTOR).forEach(ov =>
      ov.classList.remove("is-visible")
    );
    updateScrollLock();
  }

  // ---------------------------------------------------
  // HERO + SECTION REVEAL
  // ---------------------------------------------------

  function animateHero() {
    const heroContent = qs("#home .hero-content");
    const heroText = qs("#home .hero-text");

    if (heroContent) triggerAnimation(heroContent, "left");
    if (heroText) triggerAnimation(heroText, "right");
  }

  function revealSectionsInOrder() {
    const order = ["home", "about", "charity", "associations", "contact"];
    let delay = 0;

    order.forEach(key => {
      const section = qs(`[data-section="${key}"]`);
      if (!section) return;

      setTimeout(() => {
        section.classList.add("section-visible");
      }, delay);

      delay += 400;
    });
  }

  let contentRevealed = false;
  let scrollUnlocked = false;

    // 1) Hide loader + show homepage, but KEEP SCROLL LOCKED
    function hideLoaderAndRevealContent() {
      if (contentRevealed) return;
      contentRevealed = true;

      const loader = qs("#loader");
      if (loader && !loader.classList.contains("fade-out")) {
        loader.classList.add("fade-out");
      }

      setTimeout(() => {
        if (loader) loader.style.display = "none";
      }, 400); 

    revealSectionsInOrder();
  animateHero();
}

// 2) After ALL assets (images, etc.) are loaded → unlock scroll
function unlockScrollAfterAssets() {
  if (scrollUnlocked) return;
  scrollUnlocked = true;

  document.documentElement.classList.remove("page-loading");
  document.body.classList.remove("page-loading");

  if (!anyOverlayOpen()) {
    unlockPageScroll();
  } else {
    updateScrollLock();
  }
}


  // ---------------------------------------------------
  // CHARITY PAGINATION + CARDS
  // ---------------------------------------------------

  function initCharityPagination() {
    const cards = Array.from(
      qsa("#charity-overlay .charity-card")
    );
    const pagerRoot = qs("#charity-pagination");
    const perPage = 10;

    if (!cards.length || !pagerRoot) return;

    const totalPages = Math.ceil(cards.length / perPage);
    let currentPage = 1;

    function buildPager() {
      pagerRoot.innerHTML = "";
      if (totalPages <= 1) return;

      const MAX_VISIBLE = 3;

      const createPageBtn = pageNum => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "charity-page-btn";
        btn.textContent = pageNum;
        btn.dataset.page = pageNum;
        if (pageNum === currentPage) {
          btn.classList.add("is-active");
        }
        btn.addEventListener("click", () => renderPage(pageNum));
        return btn;
      };

      const createArrowBtn = direction => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "charity-page-btn charity-page-btn--arrow";
        btn.innerHTML = direction === "prev" ? "&lsaquo;" : "&rsaquo;";

        const target =
          direction === "prev" ? currentPage - 1 : currentPage + 1;
        const disabled =
          (direction === "prev" && currentPage === 1) ||
          (direction === "next" && currentPage === totalPages);

        if (disabled) {
          btn.disabled = true;
        } else {
          btn.addEventListener("click", () => renderPage(target));
        }

        return btn;
      };

      const addEllipsis = () => {
        const span = document.createElement("span");
        span.className = "charity-page-ellipsis";
        span.textContent = "…";
        pagerRoot.appendChild(span);
      };

      // PREV
      pagerRoot.appendChild(createArrowBtn("prev"));

      if (totalPages <= MAX_VISIBLE + 2) {
        for (let i = 1; i <= totalPages; i++) {
          pagerRoot.appendChild(createPageBtn(i));
        }
      } else {
        const firstPage = 1;
        const lastPage = totalPages;
        let start = currentPage - 1;
        let end = currentPage + 1;

        if (start <= 2) {
          start = 2;
          end = start + (MAX_VISIBLE - 1);
        } else if (end >= lastPage - 1) {
          end = lastPage - 1;
          start = end - (MAX_VISIBLE - 1);
        }

        pagerRoot.appendChild(createPageBtn(firstPage));

        if (start > 2) addEllipsis();

        for (let p = start; p <= end && p < lastPage; p++) {
          pagerRoot.appendChild(createPageBtn(p));
        }

        if (end < lastPage - 1) addEllipsis();
        pagerRoot.appendChild(createPageBtn(lastPage));
      }

      // NEXT
      pagerRoot.appendChild(createArrowBtn("next"));
    }

    function renderPage(page) {
      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      currentPage = page;
      const start = (page - 1) * perPage;
      const end = start + perPage;

      cards.forEach((card, index) => {
        card.style.display =
          index >= start && index < end ? "" : "none";
      });

      buildPager();

      const stack = qs("#charity-stack");
      if (stack) {
        stack.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    // expose reset for nav links / overlay close
    window.resetCharityOverlayState = () => {
      renderPage(1);
      const stack = qs("#charity-stack");
      if (stack)
        stack.scrollTo({ top: 0, behavior: "auto" });
    };

    renderPage(1);
  }

  function initCharityCards() {
    const cards = Array.from(qsa("#charity-overlay .charity-card"));

    cards.forEach(card => {
      const toggle = qs(".charity-read-toggle", card);
      const extra = qs(".charity-extra-wrapper", card);
      const videoSlide = qs(".video-wrapper", card);
      const slides = qsa(".media-slide", card);
      const prev = qs(".media-prev", card);
      const next = qs(".media-next", card);

      let currentIndex = 0;
      let dotsWrap = null;
      let dots = [];

      // Dots for >=2 slides
      if (slides.length >= 2) {
        dotsWrap = document.createElement("div");
        dotsWrap.className = "media-dots";
        dotsWrap.style.display = "none";

        slides.forEach((_slide, i) => {
          const dot = document.createElement("div");
          dot.className = "media-dot";
          if (i === 0) dot.classList.add("is-active");
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });

        const mediaInner = qs(".media-inner", card);
        if (mediaInner) {
          mediaInner.appendChild(dotsWrap);
        }
      }

      // video click-to-play
      if (videoSlide) {
        const video = qs("video", videoSlide);
        const playIcon = qs(".play-icon", videoSlide);

        videoSlide.addEventListener("click", e => {
          e.stopPropagation();
          if (currentIndex !== Array.from(slides).indexOf(videoSlide)) return;

          if (video) {
            video.play();
            if (playIcon) playIcon.style.display = "none";
          }
        });
      }

      // slide logic
      function showSlide(index) {
        if (!slides.length) return;

        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;

        slides.forEach((slide, i) => {
          const isActive = i === currentIndex;
          slide.classList.toggle("is-active", isActive);

          const video = qs("video", slide);
          const playIcon = qs(".play-icon", slide);

          if (!video) return;

          if (isActive) {
            video.currentTime = 0;
            video.play();
            if (playIcon) playIcon.style.display = "none";
          } else {
            video.pause();
            video.currentTime = 0;
            if (playIcon) playIcon.style.display = "flex";
          }
        });

        if (dots.length) {
          dots.forEach((dot, i) =>
            dot.classList.toggle("is-active", i === currentIndex)
          );
        }
      }

      if (slides.length <= 1) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
      } else {
        showSlide(0);

        if (prev) {
          prev.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex - 1);
          });
        }

        if (next) {
          next.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex + 1);
          });
        }
      }

        // expand / collapse, only one open at a time
        if (toggle && extra) {
          toggle.style.cursor = "pointer";

        toggle.addEventListener("click", e => {
          e.stopPropagation();

          const isExpanded = card.classList.contains("expanded");
          const willExpand = !isExpanded;

          // Close other cards
          cards.forEach(otherCard => {
            if (otherCard === card) return;
            otherCard.classList.remove("expanded");
            const otherToggle = qs(".charity-read-toggle", otherCard);
            if (otherToggle) otherToggle.textContent = "Read more";

            const otherDotsWrap = qs(".media-dots", otherCard);
            if (otherDotsWrap) otherDotsWrap.style.display = "none";

            // Reset slides to first slide
            const otherSlides = qsa(".media-slide", otherCard);
            otherSlides.forEach((slide, i) =>
              slide.classList.toggle("is-active", i === 0)
            );
          });

          // Toggle current card
          card.classList.toggle("expanded", willExpand);
          toggle.textContent = willExpand ? "Read less" : "Read more";

          if (dotsWrap) {
            dotsWrap.style.display = willExpand ? "flex" : "none";
          }

          // Reset active slide if collapsing
          if (!willExpand) {
            showSlide(0);
          }
        });
      }
    });
  }

  // ---------------------------------------------------
  // ASSOCIATIONS (CARDS + SMALL OVERLAYS)
  // ---------------------------------------------------

  function initAssociationsOverlays() {
    const assocOverlay = qs("#associations-overlay");
    const assocOpen = qs(".js-assoc-open");

    // small individual overlays (js-sa-open)
    qsa(".js-sa-open").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        const key = btn.dataset.assoc;
        const overlay = qs(`#sa-${key}`);
        if (overlay) showOverlay(overlay);
      });
    });

    // close those small overlays by clicking backdrop
    qsa(".sa-overlay").forEach(overlay => {
      overlay.addEventListener("click", e => {
        if (e.target === overlay) {
          overlay.classList.remove("is-visible");
          updateScrollLock();
        }
      });
    });

    // main "view all" overlay
    if (assocOverlay && assocOpen) {
      assocOpen.addEventListener("click", () => {
        showOverlay(assocOverlay);
      });

      assocOverlay.addEventListener("click", e => {
        if (e.target === assocOverlay) {
          assocOverlay.classList.remove("is-visible");
          updateScrollLock();
        }
      });
    }
  }

  function initAssocCards() {
    const assocCards = Array.from(qsa(".assoc-card"));

    assocCards.forEach(card => {
      const toggle = qs(".assoc-read-toggle", card);
      const extra = qs(".assoc-extra-wrapper", card);
      const slides = qsa(".media-slide", card);
      const prev = qs(".media-prev", card);
      const next = qs(".media-next", card);

      let currentIndex = 0;
      let dotsWrap = null;
      let dots = [];

      if (slides.length >= 2) {
        dotsWrap = document.createElement("div");
        dotsWrap.className = "media-dots";
        dotsWrap.style.display = "none";

        slides.forEach((_s, i) => {
          const dot = document.createElement("div");
          dot.className = "media-dot";
          if (i === 0) dot.classList.add("is-active");
          dotsWrap.appendChild(dot);
          dots.push(dot);

          dot.addEventListener("click", e => {
            e.stopPropagation();
            showSlide(i);
          });
        });

        const mediaInner = qs(".media-inner", card);
        if (mediaInner) {
          mediaInner.appendChild(dotsWrap);
        }
      }

      function showSlide(index) {
        if (!slides.length) return;

        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;

        slides.forEach((slide, i) =>
          slide.classList.toggle("is-active", i === currentIndex)
        );

        if (dots.length) {
          dots.forEach((dot, i) =>
            dot.classList.toggle("is-active", i === currentIndex)
          );
        }
      }

      if (slides.length <= 1) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
      } else {
        showSlide(0);

        if (prev) {
          prev.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex - 1);
          });
        }

        if (next) {
          next.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex + 1);
          });
        }
      }

      if (!toggle || !extra) return;

      toggle.style.cursor = "pointer";

      toggle.addEventListener("click", e => {
        e.stopPropagation();

        const isExpanded = card.classList.contains("expanded");
        const willExpand = !isExpanded;

        // close others
        assocCards.forEach(otherCard => {
          if (otherCard === card) return;
          if (!otherCard.classList.contains("expanded")) return;

          otherCard.classList.remove("expanded");
          const otherToggle = qs(".assoc-read-toggle", otherCard);
          if (otherToggle) otherToggle.textContent = "Read more";

          const otherDotsWrap = qs(".media-dots", otherCard);
          if (otherDotsWrap) otherDotsWrap.style.display = "none";

          const otherSlides = qsa(".media-slide", otherCard);
          const otherDots = qsa(".media-dot", otherCard);

          otherSlides.forEach((slide, i) =>
            slide.classList.toggle("is-active", i === 0)
          );
          otherDots.forEach((dot, i) =>
            dot.classList.toggle("is-active", i === 0)
          );
        });

        card.classList.toggle("expanded", willExpand);
        toggle.textContent = willExpand ? "Read less" : "Read more";

        if (dotsWrap) {
          dotsWrap.style.display = willExpand ? "flex" : "none";
        }

        if (!willExpand) {
          showSlide(0);
        }
      });
    });

    // for external resets
    const assocStack = qs("#associations-overlay .assoc-stack");
    window.resetAssocOverlayState = () => {
      if (assocStack) assocStack.scrollTo({ top: 0, behavior: "auto" });
    };
  }

  // ---------------------------------------------------
  // AUTO-SLIDE CAROUSEL (charity & assoc cards)
  // ---------------------------------------------------

  function initAutoSlideCarousels() {
    qsa(".charity-card, .assoc-card").forEach(card => {
      const mediaInner = qs(".media-inner", card);
      if (!mediaInner) return;

      const slides = qsa(".media-slide", mediaInner);
      const prevBtn = qs(".media-prev", mediaInner);
      const nextBtn = qs(".media-next", mediaInner);

      if (slides.length <= 1) return;

      let index = 0;
      let autoTimer = null;

      const showSlide = i => {
        slides.forEach(s => s.classList.remove("is-active"));
        slides[i].classList.add("is-active");

        const dots = qsa(".media-dot", mediaInner);
        if (dots.length) {
          dots.forEach(d => d.classList.remove("is-active"));
          dots[i].classList.add("is-active");
        }
      };

      const nextSlide = () => {
        index = (index + 1) % slides.length;
        showSlide(index);
      };

      const prevSlide = () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
      };

      const startAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(nextSlide, 3000);
      };

      const stopAuto = () => {
        clearInterval(autoTimer);
        autoTimer = null;
      };

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          nextSlide();
          if (card.classList.contains("expanded")) startAuto();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          prevSlide();
          if (card.classList.contains("expanded")) startAuto();
        });
      }

      const toggleBtn = qs(
        ".charity-read-toggle, .assoc-read-toggle",
        card
      );
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          setTimeout(() => {
            if (card.classList.contains("expanded")) {
              startAuto();
            } else {
              stopAuto();
            }
          }, 50);
        });
      }

      card.addEventListener("transitionend", () => {
        if (!card.classList.contains("expanded")) stopAuto();
      });
    });
  }

  // ---------------------------------------------------
  // RESET EXPANDABLE CARDS
  // ---------------------------------------------------

  function resetAllExpandableCards() {
    qsa(".charity-card, .assoc-card").forEach(card => {
      card.classList.remove("expanded");

      const toggle = qs(
        ".charity-read-toggle, .assoc-read-toggle",
        card
      );
      if (toggle) toggle.textContent = "Read more";

      const dotsWrap = qs(".media-dots", card);
      if (dotsWrap) dotsWrap.style.display = "none";

      const slides = qsa(".media-slide", card);
      const dots = qsa(".media-dot", card);

      slides.forEach((slide, i) =>
        slide.classList.toggle("is-active", i === 0)
      );
      dots.forEach((dot, i) =>
        dot.classList.toggle("is-active", i === 0)
      );
    });
  }

  // ---------------------------------------------------
  // NAVIGATION LINKS (close overlays, reset stuff)
  // ---------------------------------------------------

  function initNavLinksBehavior() {
    const navLinks = qsa(".nav-link, .nav-center");

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        hideAllOverlays();
        resetAllExpandableCards();

        if (window.resetCharityOverlayState) window.resetCharityOverlayState();
        if (window.resetAssocOverlayState) window.resetAssocOverlayState();
      });
    });

    const homeLink = qs('[href="#home"]');
    const aboutLink = qs('[href="#about"]');
    const charityLink = qs('[href="#charity"]');
    const assocNavLink = qs('[href="#associations"]');

    if (homeLink) {
      homeLink.addEventListener("click", () => {
        animateHero();
      });
    }

    if (aboutLink) {
      aboutLink.addEventListener("click", () => {
        triggerAnimation(qs("#about .copy"), "left");
        triggerAnimation(qs("#about .image-stack"), "right");
      });
    }

    if (charityLink) {
      charityLink.addEventListener("click", () => {
        triggerAnimation(qs("#charity .charity-content"), "bottom");
      });
    }

    if (assocNavLink) {
      assocNavLink.addEventListener("click", () => {
        const saItems = qsa("#associations .sa-item");
        saItems.forEach((item, index) => {
          const itemIndex = index + 1;
          const dir = [1, 2, 4, 5].includes(itemIndex)
            ? "left"
            : "right";
          triggerAnimation(item, dir);
        });
      });
    }
  }

  // ---------------------------------------------------
  // ABOUT & CHARITY OVERLAYS
  // ---------------------------------------------------

  function initAboutOverlay() {
    const aboutOverlay = qs("#aboutme-overlay");
    const aboutOpen = qs(".js-about-open");

    if (!aboutOverlay || !aboutOpen) return;

    aboutOpen.addEventListener("click", () => {
      showOverlay(aboutOverlay);
    });

    aboutOverlay.addEventListener("click", e => {
      if (e.target === aboutOverlay) {
        aboutOverlay.classList.remove("is-visible");
        updateScrollLock();
      }
    });
  }

  function initCharityOverlay() {
    const charityOverlay = qs("#charity-overlay");
    const charityOpen = qs(".js-charity-open");

    if (!charityOverlay || !charityOpen) return;

    charityOpen.addEventListener("click", () => {
      showOverlay(charityOverlay);
    });

    charityOverlay.addEventListener("click", e => {
      if (e.target === charityOverlay) {
        charityOverlay.classList.remove("is-visible");
        updateScrollLock();
      }
    });
  }

  // ---------------------------------------------------
  // GLOBAL OVERLAY BACKDROP CLICK
  // ---------------------------------------------------

  function initOverlayBackdropClose() {
    document.addEventListener("click", e => {
      const overlay = e.target.closest(ALL_OVERLAYS_SELECTOR);
      if (!overlay) return;

      const innerCard = e.target.closest(
        ".aboutme-inner, .stack, .assoc-stack, .sa-overlay-card"
      );
      if (innerCard) return;

      overlay.classList.remove("is-visible");
      updateScrollLock();
      resetAllExpandableCards();
      if (window.resetCharityOverlayState) window.resetCharityOverlayState();
      if (window.resetAssocOverlayState) window.resetAssocOverlayState();
    });
  }

  // ---------------------------------------------------
  // HISTORY POPSTATE → CLOSE OVERLAYS
  // ---------------------------------------------------

  function initHistoryOverlayHandling() {
    window.addEventListener("popstate", hideAllOverlays);
  }

  // ---------------------------------------------------
  // COMPANIES I WORKED FOR (BUBBLE TRACK)
  // ---------------------------------------------------

  function initCompaniesCarousel() {
    const track = qs(".companies-track");
    const bubbles = Array.from(qsa(".company-bubble"));
    const prevBtn = qs(".companies-arrow--prev");
    const nextBtn = qs(".companies-arrow--next");

    if (!track || !bubbles.length) return;

    const SPACING = 300;
    const SPEED = 40;

    let baseOffset = 0;
    let lastTime = null;
    let animID = null;

    let isDragging = false;
    let dragStartX = 0;
    let dragOffsetStart = 0;
    let hasDragged = false;

    function layoutBubbles() {
      const trackWidth = track.clientWidth;
      const centerX = trackWidth / 2;
      const totalWidth = SPACING * bubbles.length;

      bubbles.forEach((bubble, i) => {
        const logicalX = i * SPACING + baseOffset;
        const wrapped =
          ((logicalX % totalWidth) + totalWidth) % totalWidth -
          totalWidth / 2;

        const x = centerX + wrapped;
        bubble.style.left = `${x}px`;
      });
    }

    function updateCenterHighlight() {
      const trackRect = track.getBoundingClientRect();
      const centerPoint = trackRect.left + trackRect.width / 2;

      let closest = null;
      let closestDist = Infinity;

      bubbles.forEach(bubble => {
        const rect = bubble.getBoundingClientRect();
        const bubbleCenter = rect.left + rect.width / 2;
        const dist = Math.abs(bubbleCenter - centerPoint);

        if (dist < closestDist) {
          closestDist = dist;
          closest = bubble;
        }
      });

      bubbles.forEach(b => b.classList.remove("is-center"));
      if (closest) closest.classList.add("is-center");
    }

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

    function dragStart(clientX) {
      isDragging = true;
      hasDragged = false;
      dragStartX = clientX;
      dragOffsetStart = baseOffset;
      track.classList.add("is-dragging");

      if (animID) {
        cancelAnimationFrame(animID);
        animID = null;
      }
    }

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

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");

      lastTime = null;
      animID = requestAnimationFrame(loop);
    }

    // mouse
    track.addEventListener("mousedown", e => {
      dragStart(e.clientX);
    });

    bubbles.forEach(bubble => {
      bubble.addEventListener("mousedown", e => {
        e.preventDefault();
        dragStart(e.clientX);
      });
    });

    window.addEventListener("mousemove", e => dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);

    // touch
    track.addEventListener(
      "touchstart",
      e => dragStart(e.touches[0].clientX),
      { passive: true }
    );
    track.addEventListener(
      "touchmove",
      e => dragMove(e.touches[0].clientX),
      { passive: true }
    );
    track.addEventListener("touchend", dragEnd);

    // prevent click-through when dragging
    bubbles.forEach(bubble => {
      const link = qs("a", bubble);
      if (!link) return;
      link.addEventListener("click", e => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    // arrow buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        baseOffset += SPACING;
        layoutBubbles();
        updateCenterHighlight();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", e => {
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
  }

  // ---------------------------------------------------
  // IMAGE LIGHTBOX + TOOLBAR
  // ---------------------------------------------------

  function initLightbox() {
    const lightbox = qs("#image-lightbox");
    if (!lightbox) return;

    const lightboxImg = qs(".lightbox-img", lightbox);
    if (!lightboxImg) return;

    // toolbar container
    const controls = document.createElement("div");
    controls.classList.add("lightbox-controls");
    lightbox.appendChild(controls);

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

    controls.append(zoomBtn, fullscreenBtn, shareBtn, closeBtn);

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
    `;
    lightbox.appendChild(shareMenu);

    function openLightbox(src) {
      if (!src) return;
      lightboxImg.src = src;
      lightbox.classList.add("active");
      lockPageScroll();
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      unlockPageScroll();
      lightboxImg.style.transform = "scale(1)";
      shareMenu.classList.remove("open");
      document.body.style.overflow = "";
    }

    // open from media
    qsa(".media img, .media-slide, .sa-overlay-media img").forEach(el => {
      el.style.cursor = "zoom-in";

      el.addEventListener("click", e => {
        e.stopPropagation();

        let sourceEl = el;
        if (el.classList.contains("media-slide")) {
          const active = el.parentElement.querySelector(
            ".media-slide.is-active"
          );
          if (active) sourceEl = active;
        }

        let src = sourceEl.src;
        const inner = sourceEl.querySelector("img, video");
        if (!src && inner) src = inner.src;
        openLightbox(src);
      });
    });

    // close actions
    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", e => {
      if (e.target.classList.contains("lightbox-backdrop")) {
        closeLightbox();
      }
    });

    // zoom
    zoomBtn.addEventListener("click", e => {
      e.stopPropagation();
      lightboxImg.style.transform =
        lightboxImg.style.transform === "scale(2)"
          ? "scale(1)"
          : "scale(2)";
    });

    // fullscreen
    fullscreenBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        lightbox.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // share menu toggle
    shareBtn.addEventListener("click", e => {
      e.stopPropagation();
      shareMenu.classList.toggle("open");
    });

    // share / download
    shareMenu.addEventListener("click", e => {
      const target = e.target.closest("li");
      if (!target) return;

      const imgUrl = lightboxImg.src;

      if (target.dataset.share === "facebook") {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            imgUrl
          )}`
        );
      } else if (target.dataset.share === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            imgUrl
          )}`
        );
      } else if (target.dataset.share === "pinterest") {
        window.open(
          `https://pinterest.com/pin/create/button/?media=${encodeURIComponent(
            imgUrl
          )}`
        );
      } else if (target.dataset.download !== undefined) {
        const a = document.createElement("a");
        a.href = imgUrl;
        a.download = imgUrl.split("/").pop();
        a.click();
      }
    });

    document.addEventListener("click", () => {
      shareMenu.classList.remove("open");
    });
  }


  // ---------------------------------------------------
  // DOM READY / LOAD
  // ---------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("page-loading");
    document.body.classList.add("page-loading");

    initHistoryOverlayHandling();
    initNavLinksBehavior();
    initAboutOverlay();
    initCharityOverlay();
    initCharityPagination();
    initCharityCards();
    initAssociationsOverlays();
    initAssocCards();
    initAutoSlideCarousels();
    initOverlayBackdropClose();
    initCompaniesCarousel();
    initLightbox();

    setTimeout(hideLoaderAndRevealContent, 200);
  });

  window.addEventListener("load", () => {
    unlockScrollAfterAssets();
});

})();

