/* ============================================================
   AyoCloudi – Main JavaScript
   ============================================================ */

'use strict';

/* ---------- Navbar ---------- */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll state
  function handleScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on nav link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navbar.contains(e.target)) {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}());

/* ---------- Scroll Reveal ---------- */
(function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger children in the same parent
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
        const index = siblings.indexOf(entry.target);
        const delay = Math.min(index * 80, 400);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
}());

/* ---------- Mini Player (Simulated) ---------- */
(function initMiniPlayer() {
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playIcon');
  const progressFill = document.getElementById('progressFill');
  const progressTime = document.getElementById('progressTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const trackNameEl = document.querySelector('.mini-player-track');

  if (!playPauseBtn) return;

  const tracks = [
    { title: 'Cloud Nine', duration: 213 },
    { title: 'Midnight Static', duration: 195 },
    { title: 'Neon Shadows', duration: 228 },
    { title: 'Cloud Archive Vol. 1', duration: 187 }
  ];

  let currentTrack = 0;
  let isPlaying = false;
  let progress = 0;
  let interval = null;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function updateProgress() {
    if (!isPlaying) return;
    progress += 0.5;
    if (progress >= tracks[currentTrack].duration) {
      progress = 0;
      nextTrack();
    }
    const pct = (progress / tracks[currentTrack].duration) * 100;
    progressFill.style.width = pct + '%';
    progressTime.textContent = formatTime(progress);
  }

  function play() {
    isPlaying = true;
    playIcon.className = 'fas fa-pause';
    interval = setInterval(updateProgress, 500);
  }

  function pause() {
    isPlaying = false;
    playIcon.className = 'fas fa-play';
    clearInterval(interval);
  }

  function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    progress = 0;
    trackNameEl.textContent = tracks[currentTrack].title;
    if (isPlaying) { clearInterval(interval); interval = setInterval(updateProgress, 500); }
  }

  function prevTrack() {
    if (progress > 5) {
      progress = 0;
    } else {
      currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
      progress = 0;
    }
    trackNameEl.textContent = tracks[currentTrack].title;
    progressFill.style.width = '0%';
    progressTime.textContent = '0:00';
    if (isPlaying) { clearInterval(interval); interval = setInterval(updateProgress, 500); }
  }

  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) { pause(); } else { play(); }
  });

  document.getElementById('nextBtn').addEventListener('click', nextTrack);
  document.getElementById('prevBtn').addEventListener('click', prevTrack);

  // Progress bar click
  document.getElementById('progressBar').addEventListener('click', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    progress = pct * tracks[currentTrack].duration;
    progressFill.style.width = (pct * 100) + '%';
    progressTime.textContent = formatTime(progress);
  });

  // Volume
  volumeSlider.addEventListener('input', () => {
    // Purely visual – no actual audio
    const vol = volumeSlider.value;
    const volIcon = volumeSlider.previousElementSibling;
    if (vol === '0') {
      volIcon.className = 'fas fa-volume-xmark';
    } else if (vol < 50) {
      volIcon.className = 'fas fa-volume-low';
    } else {
      volIcon.className = 'fas fa-volume-high';
    }
  });
}());

/* ---------- Music Card Audio Preview ---------- */
(function initAudioPreview() {
  const previewPlayer = document.getElementById('audioPreview');
  const previewTitle = document.getElementById('previewTitle');
  const previewArtwork = document.getElementById('previewArtwork');
  const previewClose = document.getElementById('previewClose');

  if (!previewPlayer) return;

  const trackData = [
    { title: 'Cloud Nine', artClass: 'artwork-1' },
    { title: 'Midnight Static', artClass: 'artwork-2' },
    { title: 'Neon Shadows', artClass: 'artwork-3' },
    { title: 'Cloud Archive Vol. 1', artClass: 'artwork-4' }
  ];

  let activeTrack = null;

  document.querySelectorAll('.artwork-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackIndex = parseInt(btn.dataset.track, 10);

      if (activeTrack === trackIndex && previewPlayer.classList.contains('active')) {
        // Close same track
        previewPlayer.classList.remove('active');
        activeTrack = null;
        return;
      }

      activeTrack = trackIndex;
      const data = trackData[trackIndex];
      previewTitle.textContent = data.title;
      previewArtwork.className = 'artwork-placeholder ' + data.artClass;
      previewPlayer.classList.add('active');
    });
  });

  previewClose.addEventListener('click', () => {
    previewPlayer.classList.remove('active');
    activeTrack = null;
  });
}());

/* ---------- Merch Filter ---------- */
(function initMerchFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const merchCards = document.querySelectorAll('.merch-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      merchCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // Re-trigger reveal
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}());

/* ---------- Merch Wishlist ---------- */
(function initWishlist() {
  document.querySelectorAll('.merch-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.className = 'fas fa-heart';
        btn.style.color = '';
        showToast('Added to wishlist ♥');
      } else {
        icon.className = 'far fa-heart';
        showToast('Removed from wishlist');
      }
    });
  });
}());

/* ---------- Buy Now Buttons ---------- */
(function initBuyButtons() {
  document.querySelectorAll('.btn-buy:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Redirecting to store… 🛒');
    });
  });
}());

/* ---------- Contact Form ---------- */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#contactName').value.trim();
    const email = form.querySelector('#contactEmail').value.trim();
    const message = form.querySelector('#contactMessage').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    // Simulate submission
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      successMsg.classList.add('show');
      btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
      btn.disabled = false;

      setTimeout(() => successMsg.classList.remove('show'), 6000);
    }, 1200);
  });
}());

/* ---------- Newsletter Form ---------- */
(function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const successMsg = document.getElementById('newsletterSuccess');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.querySelector('#newsletterEmail').value.trim();

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      successMsg.classList.add('show');
      btn.disabled = false;

      setTimeout(() => successMsg.classList.remove('show'), 6000);
    }, 800);
  });
}());

/* ---------- Back to Top ---------- */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');

  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());

/* ---------- Footer Year ---------- */
(function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}());

/* ---------- Toast Notification ---------- */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(16, 16, 16, 0.96);
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: #f5f5f5;
    padding: 12px 20px;
    border-radius: 50px;
    font-size: 0.875rem;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 500;
    backdrop-filter: blur(10px);
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  `;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ---------- Helpers ---------- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
