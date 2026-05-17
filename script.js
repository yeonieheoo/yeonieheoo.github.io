/* ============================================
   YEONIE HEO — PORTFOLIO INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  const nav = document.getElementById('nav');
  const navToggle = nav.querySelector('.nav__toggle');

  const handleScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  navToggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });

  // Close mobile menu on link click
  nav.querySelectorAll('.nav__links a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('is-open'));
  });

  /* ---------- Text scramble for narrative heading ---------- */
  function initScramble(el) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#@&·%$';

    // Walk all text nodes, wrap each non-whitespace char in a span
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) textNodes.push(node);

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const frag = document.createDocumentFragment();
      [...text].forEach(char => {
        if (/\s/.test(char)) {
          frag.appendChild(document.createTextNode(char));
        } else {
          const span = document.createElement('span');
          span.className = 'scramble-char';
          span.dataset.final = char;
          span.textContent = chars[Math.floor(Math.random() * chars.length)];
          frag.appendChild(span);
        }
      });
      textNode.parentNode.replaceChild(frag, textNode);
    });

    const spans = [...el.querySelectorAll('.scramble-char')];
    const DURATION = 250;
    const STAGGER = 10;

    spans.forEach((span, i) => {
      const finalChar = span.dataset.final;
      const startAt = performance.now() + i * STAGGER;

      const tick = (now) => {
        if (now < startAt) { requestAnimationFrame(tick); return; }
        const elapsed = now - startAt;
        if (elapsed < DURATION) {
          span.textContent = chars[Math.floor(Math.random() * chars.length)];
          requestAnimationFrame(tick);
        } else {
          span.textContent = finalChar;
        }
      };
      requestAnimationFrame(tick);
    });
  }

  const narrativeHeading = document.querySelector('.narrative__heading');
  if (narrativeHeading) {
    const scrambleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initScramble(narrativeHeading);
          scrambleObserver.unobserve(narrativeHeading);
        }
      });
    }, { threshold: 0.3 });
    scrambleObserver.observe(narrativeHeading);
  }

  /* ---------- Animated counters for impact metrics + narrative metrics ---------- */
  const metricValues = document.querySelectorAll('.metric__value, .n-metric__val');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  metricValues.forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = target % 1 !== 0;
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const display = isDecimal ? current.toFixed(1) : Math.floor(current);
      el.textContent = `${prefix}${display}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = `${prefix}${isDecimal ? target.toFixed(1) : target}${suffix}`;
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Project tabs (top-level: which case study) ---------- */
  const projTabs = document.querySelectorAll('.proj-tab');
  const cases = document.querySelectorAll('.case');

  projTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const projectId = tab.dataset.project;

      projTabs.forEach(t => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });

      cases.forEach(c => {
        c.classList.toggle('is-active', c.dataset.project === projectId);
      });

      // Reset section nav to ① Problem when switching cases
      const activeCase = document.querySelector(`.case[data-project="${projectId}"]`);
      if (activeCase) {
        activeCase.querySelectorAll('.case-section-btn').forEach((btn, i) => {
          btn.classList.toggle('is-active', i === 0);
        });
        activeCase.querySelectorAll('.case__section').forEach((sec, i) => {
          sec.classList.toggle('is-active', i === 0);
        });
      }

      // Smooth scroll to top of projects section
      const projectsSection = document.getElementById('projects');
      const offset = projectsSection.offsetTop - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ---------- Case study section nav (Problem / Strategy / Tech / Impact) ---------- */
  document.querySelectorAll('.case').forEach(caseEl => {
    const sectionBtns = caseEl.querySelectorAll('.case-section-btn');
    const sections = caseEl.querySelectorAll('.case__section');

    sectionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sectionId = btn.dataset.section;

        sectionBtns.forEach(b => b.classList.toggle('is-active', b === btn));
        sections.forEach(s => {
          s.classList.toggle('is-active', s.dataset.section === sectionId);
        });
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(
    '.section__title, .narrative__heading, .pillar, .metric, .timeline__item, .skill-block, .contact__title, .case__cover, .projects__nav, .pub-card, .mini-project, .research__pub-header'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Active nav link highlighting ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive ? 'var(--accent)' : '';
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- Subtle parallax on hero accent shape ---------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      hero.style.setProperty('--mouse-x', `${x}px`);
      hero.style.setProperty('--mouse-y', `${y}px`);
    }, { passive: true });
  }

  /* ---------- Keyboard nav for project tabs (accessibility) ---------- */
  projTabs.forEach((tab, i) => {
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        projTabs[(i + 1) % projTabs.length].focus();
        projTabs[(i + 1) % projTabs.length].click();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = (i - 1 + projTabs.length) % projTabs.length;
        projTabs[prev].focus();
        projTabs[prev].click();
      }
    });
  });

});
