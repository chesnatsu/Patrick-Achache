(() => {
  const doc = document;
  const docEl = doc.documentElement;
  let body;

  // ---------------------------------------
  // SHORTCUTS
  // ---------------------------------------
  const qs = (sel, root = doc) => root.querySelector(sel);
  const qsa = (sel, root = doc) => root.querySelectorAll(sel);

  const OVERLAY_SELECTORS = [
    ".aboutme-overlay",
    ".charity-all-overlay",
    ".assoc-all-overlay",
    ".sa-overlay",
    ".assoc-overlay"
  ];
  const ALL_OVERLAYS_SELECTOR = OVERLAY_SELECTORS.join(", ");

  let contentRevealed = false;
  let scrollUnlocked = false;

  // ---------------------------------------
  // NAVIGATION LINKS
  // ---------------------------------------
  const initNavLinksBehavior = () => {
    qsa(".nav-link, .nav-center").forEach(link => {
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

    if (homeLink) homeLink.addEventListener("click", animateHero);

    if (aboutLink)
      aboutLink.addEventListener("click", () => {
        triggerAnimation(qs("#about .copy"), "left");
        triggerAnimation(qs("#about .image-stack"), "right");
      });

    if (charityLink)
      charityLink.addEventListener("click", () => {
        triggerAnimation(qs("#charity .charity-content"), "bottom");
      });

    if (assocNavLink)
      assocNavLink.addEventListener("click", () => {
        qsa("#associations .sa-item").forEach((item, i) => {
          const idx = i + 1;
          const dir = [1, 2, 3, 5].includes(idx) ? "left" : "right";
          triggerAnimation(item, dir);
        });
      });
  };

  // ---------------------------------------
  // SCROLL LOCK / OVERLAY HELPERS
  // ---------------------------------------
  const anyOverlayOpen = () =>
    [...qsa(ALL_OVERLAYS_SELECTOR)].some(ov =>
      ov.classList.contains("is-visible")
    );

  const lockPageScroll = () => {
    docEl.style.overflow = "hidden";
    body.style.overflow = "hidden";
  };

  const unlockPageScroll = () => {
    if (anyOverlayOpen()) return;
    docEl.style.overflow = "";
    body.style.overflow = "";
  };

  const updateScrollLock = () =>
    anyOverlayOpen() ? lockPageScroll() : unlockPageScroll();

  const ANIM_CLASSES = [
    "animate-from-left",
    "animate-from-right",
    "animate-from-top",
    "animate-from-bottom"
  ];

  const triggerAnimation = (el, dir = "left") => {
    if (!el) return;
    const classMap = {
      left: ANIM_CLASSES[0],
      right: ANIM_CLASSES[1],
      top: ANIM_CLASSES[2],
      bottom: ANIM_CLASSES[3]
    };
    const cls = classMap[dir] || classMap.left;
    el.classList.remove(...ANIM_CLASSES);
    void el.offsetWidth;
    el.classList.add(cls);
    el.addEventListener("animationend", () => el.classList.remove(cls), {
      once: true
    });
  };

  const showOverlay = overlayEl => {
    if (!overlayEl) return;
    overlayEl.classList.add("is-visible");
    updateScrollLock();
    try {
      history.pushState({ overlay: overlayEl.id || true }, "", window.location.href);
    } catch {
    }
    if (window.updateBackToTopVisibility) window.updateBackToTopVisibility();
  };

  const hideAllOverlays = () => {
    qsa(ALL_OVERLAYS_SELECTOR).forEach(ov =>
      ov.classList.remove("is-visible")
    );
    updateScrollLock();
  };

  // ---------------------------------------
  // HERO + SECTION REVEAL
  // ---------------------------------------
  const animateHero = () => {
    triggerAnimation(qs("#home .hero-content"), "left");
    triggerAnimation(qs("#home .hero-text"), "right");
  };

  const revealSectionsInOrder = () => {
    ["home", "about", "charity", "associations", "contact"].forEach(
      (key, i) => {
        const section = qs(`[data-section="${key}"]`);
        if (!section) return;
        setTimeout(
          () => section.classList.add("section-visible"),
          i * 400
        );
      }
    );
  };

  // ---------------------------------------
  // LOADER + INITIAL SCROLL CONTROL
  // ---------------------------------------
  const hideLoaderAndRevealContent = () => {
    if (contentRevealed) return;
    contentRevealed = true;

    const loader = qs("#loader");
    if (loader && !loader.classList.contains("fade-out")) {
      loader.classList.add("fade-out");
      setTimeout(() => {
        loader.style.display = "none";
      }, 400);
    }

    revealSectionsInOrder();
    animateHero();
  };
  

  const unlockScrollAfterAssets = () => {
    if (scrollUnlocked) return;
    scrollUnlocked = true;

    const nav = qs(".nav-wrap");
    if (nav) nav.classList.remove("nav-hidden");

    docEl.classList.remove("page-loading");
    body.classList.remove("page-loading");

    anyOverlayOpen() ? updateScrollLock() : unlockPageScroll();
  };

  // ---------- CHARITY PAGINATION + CARDS ----------
  const initCharityPagination = () =>
    initPaginatedOverlay({
      cardSelector: "#charity-overlay .charity-card",
      pagerSelector: "#charity-pagination",
      perPage: 10,
      stackSelectors: ["#charity-stack"],
      resetName: "resetCharityOverlayState"
    });

  // ---------- ASSOCIATIONS PAGINATION ----------
  const initAssocPagination = () =>
    initPaginatedOverlay({
      cardSelector: "#associations-overlay .assoc-card",
      pagerSelector: "#assoc-pagination",
      perPage: 10,
      stackSelectors: ["#assoc-stack", "#associations-overlay .assoc-stack"],
      resetName: "resetAssocOverlayState"
    });

  const initCards = () => {
    const cards = [...qsa("#charity-overlay .charity-card")];

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

      // dots
      if (slides.length >= 2) {
        dotsWrap = doc.createElement("div");
        dotsWrap.className = "media-dots";
        dotsWrap.style.display = "none";

        slides.forEach((_s, i) => {
          const dot = doc.createElement("div");
          dot.className = "media-dot";
          if (i === 0) dot.classList.add("is-active");
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });

        const mediaInner = qs(".media-inner", card);
        if (mediaInner) mediaInner.appendChild(dotsWrap);
      }

      // video click
      if (videoSlide) {
        const video = qs("video", videoSlide);
        const playIcon = qs(".play-icon", videoSlide);

        videoSlide.addEventListener("click", e => {
          e.stopPropagation();
          if (currentIndex !== [...slides].indexOf(videoSlide)) return;
          if (!video) return;
          video.play();
          if (playIcon) playIcon.style.display = "none";
        });
      }

      const showSlide = index => {
        if (!slides.length) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;

        slides.forEach((slide, i) => {
          const active = i === currentIndex;
          slide.classList.toggle("is-active", active);

          const video = qs("video", slide);
          const playIcon = qs(".play-icon", slide);
          if (!video) return;

          if (active) {
            video.currentTime = 0;
            video.play();
            if (playIcon) playIcon.style.display = "none";
          } else {
            video.pause();
            video.currentTime = 0;
            if (playIcon) playIcon.style.display = "flex";
          }
        });

        dots.forEach((dot, i) =>
          dot.classList.toggle("is-active", i === currentIndex)
        );
      };

      if (slides.length <= 1) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
      } else {
        showSlide(0);
        if (prev)
          prev.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex - 1);
          });
        if (next)
          next.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex + 1);
          });
      }

      if (!toggle || !extra) return;

      toggle.style.cursor = "pointer";

      toggle.addEventListener("click", () => {
        const willExpand = !card.classList.contains("expanded");

        // close others
        cards.forEach(other => {
          if (other === card) return;
          other.classList.remove("expanded");
          const otherToggle = qs(".charity-read-toggle", other);
          if (otherToggle) otherToggle.textContent = "Read more";
          const otherDotsWrap = qs(".media-dots", other);
          if (otherDotsWrap) otherDotsWrap.style.display = "none";
          qsa(".media-slide", other).forEach((slide, i) =>
            slide.classList.toggle("is-active", i === 0)
          );
        });

        card.classList.toggle("expanded", willExpand);
        toggle.textContent = willExpand ? "Read less" : "Read more";
        if (dotsWrap) dotsWrap.style.display = willExpand ? "flex" : "none";
        if (!willExpand) showSlide(0);
      });
    });
  };

  // ---------------------------------------
  // GENERIC PAGINATION HELPER (USED BY BOTH OVERLAYS)
  // ---------------------------------------
  function initPaginatedOverlay({
    cardSelector,
    pagerSelector,
    perPage = 10,
    stackSelectors = [],
    resetName
  }) {
    const cards = [...qsa(cardSelector)];
    const pagerRoot = qs(pagerSelector);
    if (!cards.length || !pagerRoot) return;

    const totalPages = Math.ceil(cards.length / perPage);
    let currentPage = 1;

    const getStack = () => {
      for (const sel of stackSelectors) {
        const el = qs(sel);
        if (el) return el;
      }
      return null;
    };

    const renderPage = page => {
      page = Math.max(1, Math.min(page, totalPages));
      currentPage = page;

      const start = (page - 1) * perPage;
      const end = start + perPage;

      cards.forEach((card, i) => {
        card.style.display = i >= start && i < end ? "" : "none";
      });

      buildPager();

      const stack = getStack();
      if (stack) stack.scrollTo({ top: 0, behavior: "smooth" });
    };

    const buildPager = () => {
      pagerRoot.innerHTML = "";
      if (totalPages <= 1) return;

      const MAX_VISIBLE = 3;

      const createPageBtn = n => {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "charity-page-btn";
        btn.textContent = n;
        btn.dataset.page = n;
        if (n === currentPage) btn.classList.add("is-active");
        btn.addEventListener("click", () => renderPage(n));
        return btn;
      };

      const createArrowBtn = direction => {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "charity-page-btn charity-page-btn--arrow";
        btn.innerHTML = direction === "prev" ? "&lsaquo;" : "&rsaquo;";

        const target = direction === "prev" ? currentPage - 1 : currentPage + 1;
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
        const span = doc.createElement("span");
        span.className = "charity-page-ellipsis";
        span.textContent = "…";
        pagerRoot.appendChild(span);
      };

      // prev arrow
      pagerRoot.appendChild(createArrowBtn("prev"));

      if (totalPages <= MAX_VISIBLE + 2) {
        for (let i = 1; i <= totalPages; i++) {
          pagerRoot.appendChild(createPageBtn(i));
        }
      } else {
        const first = 1;
        const last = totalPages;
        let start = currentPage - 1;
        let end = currentPage + 1;

        if (start <= 2) {
          start = 2;
          end = start + (MAX_VISIBLE - 1);
        } else if (end >= last - 1) {
          end = last - 1;
          start = end - (MAX_VISIBLE - 1);
        }

        pagerRoot.appendChild(createPageBtn(first));
        if (start > 2) addEllipsis();

        for (let p = start; p <= end && p < last; p++) {
          pagerRoot.appendChild(createPageBtn(p));
        }

        if (end < last - 1) addEllipsis();
        pagerRoot.appendChild(createPageBtn(last));
      }

      // next arrow
      pagerRoot.appendChild(createArrowBtn("next"));
    };

    // global reset used by nav + overlay close
    if (resetName) {
      window[resetName] = () => {
        renderPage(1);
        const stack = getStack();
        if (stack) stack.scrollTo({ top: 0, behavior: "auto" });
      };
    }

    renderPage(1);
  }

  // ---------------------------------------
  // ASSOCIATIONS (CARDS + SMALL OVERLAYS)
  // ---------------------------------------
  const initAssociationsOverlays = () => {
    const assocOverlay = qs("#associations-overlay");
    const assocOpen = qs(".js-assoc-open");

    // small SA overlays
    qsa(".js-sa-open").forEach(btn => {
      btn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const overlay = qs(`#sa-${btn.dataset.assoc}`);
        if (overlay) showOverlay(overlay);
      });
    });

    if (assocOverlay && assocOpen) {
      assocOpen.addEventListener("click", () => showOverlay(assocOverlay));
    }
  };

  const initAssocCards = () => {
    const assocCards = [...qsa(".assoc-card")];

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
        dotsWrap = doc.createElement("div");
        dotsWrap.className = "media-dots";
        dotsWrap.style.display = "none";

        slides.forEach((_s, i) => {
          const dot = doc.createElement("div");
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
        if (mediaInner) mediaInner.appendChild(dotsWrap);
      }

      const showSlide = index => {
        if (!slides.length) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentIndex = index;

        slides.forEach((slide, i) =>
          slide.classList.toggle("is-active", i === currentIndex)
        );
        dots.forEach((dot, i) =>
          dot.classList.toggle("is-active", i === currentIndex)
        );
      };

      if (slides.length <= 1) {
        if (prev) prev.style.display = "none";
        if (next) next.style.display = "none";
      } else {
        showSlide(0);
        if (prev)
          prev.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex - 1);
          });
        if (next)
          next.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            showSlide(currentIndex + 1);
          });
      }

      if (!toggle || !extra) return;

      toggle.style.cursor = "pointer";

      toggle.addEventListener("click", () => {
        const willExpand = !card.classList.contains("expanded");

        assocCards.forEach(other => {
          if (other === card) return;
          if (!other.classList.contains("expanded")) return;
          other.classList.remove("expanded");
          const otherToggle = qs(".assoc-read-toggle", other);
          if (otherToggle) otherToggle.textContent = "Read more";
          const otherDotsWrap = qs(".media-dots", other);
          if (otherDotsWrap) otherDotsWrap.style.display = "none";
          const otherSlides = qsa(".media-slide", other);
          const otherDots = qsa(".media-dot", other);
          otherSlides.forEach((slide, i) =>
            slide.classList.toggle("is-active", i === 0)
          );
          otherDots.forEach((dot, i) =>
            dot.classList.toggle("is-active", i === 0)
          );
        });

        card.classList.toggle("expanded", willExpand);
        toggle.textContent = willExpand ? "Read less" : "Read more";
        if (dotsWrap) dotsWrap.style.display = willExpand ? "flex" : "none";
        if (!willExpand) showSlide(0);
      });
    });
  };

  // ---------------------------------------
  // RESET EXPANDABLE CARDS
  // ---------------------------------------
  const resetAllExpandableCards = () => {
    qsa(".charity-card, .assoc-card").forEach(card => {
      card.classList.remove("expanded");

      const toggle = qs(".charity-read-toggle, .assoc-read-toggle", card);
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
  };

  // ---------------------------------------
  // GENERIC OVERLAY HELPERS
  // ---------------------------------------
  const initSimpleOverlay = (triggerSel, overlaySel) => {
    const overlay = qs(overlaySel);
    const trigger = qs(triggerSel);
    if (!overlay || !trigger) return;

    trigger.addEventListener("click", () => showOverlay(overlay));
  };

  const initOverlayBackdropClose = () => {
    doc.addEventListener("click", e => {
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
  };

  const initHistoryOverlayHandling = () => {
    window.addEventListener("popstate", hideAllOverlays);
  };

  // ---------------------------------------
  // AUTO-SLIDE CAROUSELS FOR CHARITY AND ASSOC CARD
  // ---------------------------------------
  const initAutoSlideCarousels = () => {
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
        dots.forEach(d => d.classList.remove("is-active"));
        if (dots[i]) dots[i].classList.add("is-active");
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

      if (nextBtn)
        nextBtn.addEventListener("click", () => {
          nextSlide();
          if (card.classList.contains("expanded")) startAuto();
        });

      if (prevBtn)
        prevBtn.addEventListener("click", () => {
          prevSlide();
          if (card.classList.contains("expanded")) startAuto();
        });

      const toggleBtn = qs(".charity-read-toggle, .assoc-read-toggle", card);
      if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
          setTimeout(() => {
            card.classList.contains("expanded") ? startAuto() : stopAuto();
          }, 50);
        });
      }

      card.addEventListener("transitionend", () => {
        if (!card.classList.contains("expanded")) stopAuto();
      });
    });
  };

  // ---------------------------------------
  // COMPANIES CAROUSEL
  // ---------------------------------------
  const initCompaniesCarousel = () => {
    const track = qs(".companies-track");
    const bubbles = [...qsa(".company-bubble")];
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

    const layoutBubbles = () => {
      const trackWidth = track.clientWidth;
      const centerX = trackWidth / 2;
      const totalWidth = SPACING * bubbles.length;

      bubbles.forEach((bubble, i) => {
        const logicalX = i * SPACING + baseOffset;
        const wrapped =
          ((logicalX % totalWidth) + totalWidth) % totalWidth -
          totalWidth / 2;

        bubble.style.left = `${centerX + wrapped}px`;
      });
    };

    const updateCenterHighlight = () => {
      const rect = track.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let closest = null;
      let closestDist = Infinity;

      bubbles.forEach(b => {
        const r = b.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const d = Math.abs(c - center);
        if (d < closestDist) {
          closestDist = d;
          closest = b;
        }
      });

      bubbles.forEach(b => b.classList.remove("is-center"));
      if (closest) closest.classList.add("is-center");
    };

    const loop = t => {
      if (!lastTime) lastTime = t;
      const dt = (t - lastTime) / 1000;
      lastTime = t;

      if (!isDragging) baseOffset -= SPEED * dt;

      const totalWidth = SPACING * bubbles.length;
      if (baseOffset <= -totalWidth) baseOffset += totalWidth;

      layoutBubbles();
      updateCenterHighlight();
      animID = requestAnimationFrame(loop);
    };

    const dragStart = x => {
      isDragging = true;
      hasDragged = false;
      dragStartX = x;
      dragOffsetStart = baseOffset;
      track.classList.add("is-dragging");
      if (animID) cancelAnimationFrame(animID);
      animID = null;
    };

    const dragMove = x => {
      if (!isDragging) return;
      const delta = x - dragStartX;
      if (Math.abs(delta) > 5) hasDragged = true;
      baseOffset = dragOffsetStart + delta;
      layoutBubbles();
      updateCenterHighlight();
    };

    const dragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");
      lastTime = null;
      animID = requestAnimationFrame(loop);
    };

    track.addEventListener("mousedown", e => dragStart(e.clientX));
    bubbles.forEach(bubble => {
      bubble.addEventListener("mousedown", e => {
        e.preventDefault();
        dragStart(e.clientX);
      });
    });
    window.addEventListener("mousemove", e => dragMove(e.clientX));
    window.addEventListener("mouseup", dragEnd);

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

    if (prevBtn)
      prevBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        baseOffset += SPACING;
        layoutBubbles();
        updateCenterHighlight();
      });

    if (nextBtn)
      nextBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        baseOffset -= SPACING;
        layoutBubbles();
        updateCenterHighlight();
      });

    layoutBubbles();
    updateCenterHighlight();
    animID = requestAnimationFrame(loop);
  };

  // ---------------------------------------
  // LIGHTBOX
  // ---------------------------------------
  const initLightbox = () => {
    const lightbox = qs("#image-lightbox");
    if (!lightbox) return;

    const lightboxImg = qs(".lightbox-img", lightbox);
    if (!lightboxImg) return;

    const controls = doc.createElement("div");
    controls.classList.add("lightbox-controls");
    lightbox.appendChild(controls);

    const mkBtn = (cls, html) => {
      const btn = doc.createElement("button");
      btn.className = cls;
      btn.innerHTML = html;
      return btn;
    };

    const zoomBtn = mkBtn(
      "zoom-in-btn",
      `
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="20" viewBox="0 -3 26 30" fill="white">
        <path d="M10 2a8 8 0 105.292 14.292l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/>
      </svg>
    `
    );
    const fullscreenBtn = mkBtn("fullscreen-btn", "⛶");
    const shareBtn = mkBtn("share-btn", "↗");
    const closeBtn = mkBtn("lightbox-close", "✕");

    controls.append(zoomBtn, fullscreenBtn, shareBtn, closeBtn);

    const shareMenu = doc.createElement("div");
    shareMenu.classList.add("share-menu");
    shareMenu.innerHTML = `
      <ul>
        <li data-share="facebook">
          <img src="https://img.icons8.com/color/24/000000/facebook-new.png" alt="Facebook" style="vertical-align:middle;margin-right:8px;width:20px;height:20px;" />
          Share on Facebook
        </li>
        <li data-share="twitter">
          <img src="https://img.icons8.com/color/24/000000/twitter--v1.png" alt="Twitter" style="vertical-align:middle;margin-right:8px;width:20px;height:20px;" />
          Share on Twitter
        </li>
        <li data-share="pinterest">
          <img src="https://img.icons8.com/color/24/000000/pinterest--v1.png" alt="Pinterest" style="vertical-align:middle;margin-right:8px;width:20px;height:20px;" />
          Pin it
        </li>
        <li data-download>
          <img src="https://img.icons8.com/color/24/000000/download--v1.png" alt="Download" style="vertical-align:middle;margin-right:8px;width:20px;height:20px;" />
          Download image
        </li>
      </ul>
    `;
    lightbox.appendChild(shareMenu);

    const openLightbox = src => {
      if (!src) return;
      lightboxImg.src = src;
      lightbox.classList.add("active");
      lockPageScroll();
      body.style.overflow = "hidden";
    };

    const closeLightbox = () => {
      lightbox.classList.remove("active");
      unlockPageScroll();
      lightboxImg.style.transform = "scale(1)";
      shareMenu.classList.remove("open");
      body.style.overflow = "";
    };

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

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", e => {
      if (e.target.classList.contains("lightbox-backdrop")) closeLightbox();
    });

    zoomBtn.addEventListener("click", e => {
      e.stopPropagation();
      lightboxImg.style.transform =
        lightboxImg.style.transform === "scale(2)" ? "scale(1)" : "scale(2)";
    });

    fullscreenBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (!doc.fullscreenElement) {
        lightbox.requestFullscreen();
      } else {
        doc.exitFullscreen();
      }
    });

    shareBtn.addEventListener("click", e => {
      e.stopPropagation();
      shareMenu.classList.toggle("open");
    });

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
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(imgUrl)}`
        );
      } else if (target.dataset.share === "pinterest") {
        window.open(
          `https://pinterest.com/pin/create/button/?media=${encodeURIComponent(
            imgUrl
          )}`
        );
      } else if (target.dataset.download !== undefined) {
        const a = doc.createElement("a");
        a.href = imgUrl;
        a.download = imgUrl.split("/").pop();
        a.click();
      }
    });

    doc.addEventListener("click", () => shareMenu.classList.remove("open"));
  };

    const initBackToTop = () => {
    const btn = qs("#backToTop");
    if (!btn) return;

    const isOverlayOpen = () =>
      [...qsa(ALL_OVERLAYS_SELECTOR)].some(ov => ov.classList.contains("is-visible"));

    const updateVisibility = () => {
      if (isOverlayOpen()) {
        btn.classList.remove("is-visible");
        btn.style.pointerEvents = "none";
        return;
      }

      btn.style.pointerEvents = "";
      const scrollTop = window.scrollY || docEl.scrollTop || 0;
      btn.classList.toggle("is-visible", scrollTop > 200);
    };

    window.updateBackToTopVisibility = updateVisibility;
    window.addEventListener("scroll", updateVisibility, { passive: true });

    btn.addEventListener("click", e => {
      e.preventDefault();
      if (isOverlayOpen()) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateVisibility();
  };

  // ---------------------------------------
  // Contact Form Initialization
  // ---------------------------------------
  function initContactForm() {
    const form = document.querySelector(".contact-form");
    if (form) {
      form.addEventListener("submit", sendMail);
    }
  }

  function sendMail(event) {
    event.preventDefault();

    const btn = document.getElementById("contact-btn");
    const form = document.querySelector(".contact-form");

    const fields = {
      first: document.getElementById("first").value.trim(),
      last: document.getElementById("last").value.trim(),
      email: document.getElementById("email").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    if (!fields.email || !fields.subject || !fields.message) return;

    const setButtonState = (loading) => {
      btn.textContent = loading ? "Submitting..." : "SUBMIT";
      btn.disabled = loading;
    };

    setButtonState(true);

    grecaptcha.ready(() => {
      grecaptcha.execute('6Lc4Wi8sAAAAAHLfTZ5mhP4XP73zFdKXst0cMHCZ', { action: 'contact_form' })
        .then((token) => {
          fields['recaptchaToken'] = token;

          emailjs.send("service_8blvy2j", "template_1m0n517", fields)
            .then(() => {
              form.reset();
              setButtonState(false);
            })
            .catch((err) => {
              console.error(err);
              setButtonState(false);
            });
        });
    });
  }

  // ---------------------------
  // Google Analytics (GA4)
  // ---------------------------
  (function() {
    // Load GA script asynchronously
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-95N276228J';
    document.head.appendChild(gaScript);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-95N276228J');
  })();

  // ---------------------------------------
  // DOM READY / LOAD
  // ---------------------------------------
  doc.addEventListener("DOMContentLoaded", () => {
    body = doc.body;

    emailjs.init("uelTOKuwbo0YX28lb");
    
    const yearSpan = qs("#year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    docEl.classList.add("page-loading");
    body.classList.add("page-loading");

    initHistoryOverlayHandling();
    initNavLinksBehavior();
    initSimpleOverlay(".js-about-open", "#aboutme-overlay");
    initSimpleOverlay(".js-charity-open", "#charity-overlay");
    initCharityPagination();
    initAssocPagination();
    initCards();
    initBackToTop();
    initAssociationsOverlays();
    initAssocCards();
    initAutoSlideCarousels();
    initOverlayBackdropClose();
    initCompaniesCarousel();
    initLightbox();
    initContactForm();

    setTimeout(hideLoaderAndRevealContent, 200);
  });

  window.addEventListener("load", unlockScrollAfterAssets);
})();
