// Main Application Logic for Romantic Scrapbook Experience
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const dotsContainer = document.querySelector('.nav-dots-container');
  const prevBtn = document.getElementById('prev-slide-btn');
  const nextBtn = document.getElementById('next-slide-btn');
  const modePresentBtn = document.getElementById('mode-presentation');
  const modeAlbumBtn = document.getElementById('mode-album');
  const welcomeModal = document.getElementById('welcome-modal');
  const startStoryBtn = document.getElementById('start-story-btn');
  const slide1StartBtn = document.getElementById('slide1-start-btn');

  let currentSlide = 0;
  const totalSlides = slides.length;

  // Initialize navigation dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `nav-dot ${idx === 0 ? 'active' : ''}`;
    dot.title = `Diapositiva ${idx + 1}`;
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.nav-dot');

  function updateSlideUI() {
    slides.forEach((s, idx) => {
      s.classList.toggle('active', idx === currentSlide);
    });

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSlide);
    });

    // Update button states
    if (prevBtn) prevBtn.style.opacity = currentSlide === 0 ? '0.4' : '1';
    if (nextBtn) {
      nextBtn.innerHTML = currentSlide === totalSlides - 1 ? 'Volver al Inicio 💖' : 'Siguiente ➔';
    }

    // Trigger special slide events
    if (currentSlide === 1) {
      // Slide 2: replay chat sequence
      triggerChatSequence();
    }
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = 0;
    currentSlide = index;
    updateSlideUI();

    // In album mode, scroll to the target slide
    if (document.body.classList.contains('mode-album')) {
      slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // Navigation Event Listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      prevSlide();
    }
  });

  // Touch swipe detection for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide(); // swipe left -> next
      else prevSlide(); // swipe right -> prev
    }
  }, { passive: true });

  // Mode Switching (Presentation vs Album)
  if (modePresentBtn && modeAlbumBtn) {
    modePresentBtn.addEventListener('click', () => {
      document.body.classList.remove('mode-album');
      modePresentBtn.classList.add('active');
      modeAlbumBtn.classList.remove('active');
      updateSlideUI();
    });

    modeAlbumBtn.addEventListener('click', () => {
      document.body.classList.add('mode-album');
      modeAlbumBtn.classList.add('active');
      modePresentBtn.classList.remove('active');
    });
  }

  // Welcome Modal & Music Start
  function enterExperience() {
    if (welcomeModal) welcomeModal.classList.add('hidden');
    window.romanticAudio.play();
    updateMusicUI(true);
    goToSlide(0);
    // Launch celebratory hearts
    if (window.heartConfetti) {
      window.heartConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 40);
    }
  }

  if (startStoryBtn) startStoryBtn.addEventListener('click', enterExperience);
  if (slide1StartBtn) slide1StartBtn.addEventListener('click', () => nextSlide());

  // Music Widget Controls
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicDiscIcon = document.getElementById('music-disc-icon');
  const volumeSlider = document.getElementById('volume-slider');
  const customAudioInput = document.getElementById('custom-audio-file');
  const uploadCustomBtn = document.getElementById('upload-custom-btn');

  function updateMusicUI(playing) {
    if (musicDiscIcon) {
      musicDiscIcon.classList.toggle('playing', playing);
      musicDiscIcon.innerHTML = playing ? '🎵' : '💤';
    }
    if (musicToggleBtn) {
      musicToggleBtn.innerHTML = playing ? '⏸' : '▶';
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      const isPlaying = window.romanticAudio.toggle();
      updateMusicUI(isPlaying);
    });
  }

  if (musicDiscIcon) {
    musicDiscIcon.addEventListener('click', () => {
      const isPlaying = window.romanticAudio.toggle();
      updateMusicUI(isPlaying);
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      window.romanticAudio.setVolume(parseFloat(e.target.value));
    });
  }

  if (uploadCustomBtn && customAudioInput) {
    uploadCustomBtn.addEventListener('click', () => customAudioInput.click());
    customAudioInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        window.romanticAudio.loadCustomAudioFile(e.target.files[0]);
        document.querySelector('.music-title').textContent = e.target.files[0].name.slice(0, 18) + '...';
        updateMusicUI(true);
      }
    });
  }

  // Slide 2: Chat sequence trigger
  function triggerChatSequence() {
    const bubbles = document.querySelectorAll('#slide-2 .chat-bubble');
    bubbles.forEach((b) => {
      b.style.opacity = '0';
      b.style.transform = 'translateY(12px) scale(0.9)';
    });

    setTimeout(() => {
      bubbles.forEach((b, i) => {
        setTimeout(() => {
          b.style.opacity = '1';
          b.style.transform = 'translateY(0) scale(1)';
          // Gentle chime
          if (window.romanticAudio && window.romanticAudio.ctx) {
            window.romanticAudio.playNote(72 + i * 2, window.romanticAudio.ctx.currentTime, 0.4, true, 0.25);
          }
        }, i * 750);
      });
    }, 300);
  }

  const laptop = document.querySelector('.s2-laptop-wrap');
  if (laptop) {
    laptop.addEventListener('click', () => {
      triggerChatSequence();
      if (window.heartConfetti) {
        const rect = laptop.getBoundingClientRect();
        window.heartConfetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      }
    });
  }

  // Slide 4: Interactive CD player
  const cdBox = document.querySelector('.s4-cd-box');
  if (cdBox) {
    cdBox.addEventListener('click', () => {
      cdBox.classList.toggle('spinning');
      const isPlaying = window.romanticAudio.toggle();
      updateMusicUI(isPlaying);
      if (window.heartConfetti) {
        const rect = cdBox.getBoundingClientRect();
        window.heartConfetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      }
    });
  }

  // Slide 6: Magic 8-Ball Romantic Fortunes
  const ball8 = document.querySelector('.s6-ball8');
  const fortunePopup = document.querySelector('.fortune-popup');
  const fortunes = [
    'Destino: ¡Juntos por siempre! ❤️',
    'Amor: 100% infinito y eterno ✨',
    'Eres la persona más especial de mi vida 🌸',
    'El universo conspira para nuestra felicidad 💫',
    'Cada día a tu lado es un regalo 💖',
    'Nuestra conexión va más allá de las palabras 🔮'
  ];
  let fortuneIdx = 0;

  if (ball8 && fortunePopup) {
    ball8.addEventListener('click', () => {
      ball8.classList.add('shaking');
      setTimeout(() => {
        ball8.classList.remove('shaking');
        fortuneIdx = (fortuneIdx + 1) % fortunes.length;
        fortunePopup.textContent = fortunes[fortuneIdx];
        fortunePopup.classList.add('show');
        if (window.romanticAudio && window.romanticAudio.ctx) {
          window.romanticAudio.playNote(84, window.romanticAudio.ctx.currentTime, 0.6, true, 0.4);
        }
        setTimeout(() => fortunePopup.classList.remove('show'), 3800);
      }, 500);
    });
  }

  // Slide 7: Finger Heart Burst
  const handHeart = document.querySelector('.s7-hand-heart');
  if (handHeart) {
    handHeart.addEventListener('click', () => {
      const rect = handHeart.getBoundingClientRect();
      if (window.heartConfetti) {
        window.heartConfetti.burst(rect.left + rect.width / 2, rect.top + 40, 35);
      }
      if (window.romanticAudio && window.romanticAudio.ctx) {
        window.romanticAudio.playNote(79, window.romanticAudio.ctx.currentTime, 0.5, true, 0.35);
        window.romanticAudio.playNote(84, window.romanticAudio.ctx.currentTime + 0.1, 0.8, true, 0.4);
      }
    });
  }

  // Slide 10: Celebrate Love Button
  const celebrateBtn = document.getElementById('celebrate-love-btn');
  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      window.romanticAudio.playCelebrationChime();
      if (window.heartConfetti) {
        window.heartConfetti.burst(window.innerWidth / 2, window.innerHeight / 2, 100);
        setTimeout(() => {
          window.heartConfetti.burst(window.innerWidth * 0.3, window.innerHeight * 0.4, 70);
          window.heartConfetti.burst(window.innerWidth * 0.7, window.innerHeight * 0.4, 70);
        }, 400);
      }
    });
  }

  // Lightbox & Custom Polaroid Photo Uploader
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const uploadPhotoBtn = document.getElementById('upload-photo-btn');
  const polaroidFileInput = document.getElementById('polaroid-file-input');

  let activePolaroidCard = null;

  document.querySelectorAll('.polaroid-card, .filmstrip-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      activePolaroidCard = card;
      const img = card.querySelector('img, svg');
      const dateText = card.querySelector('.polaroid-date, .film-caption');
      if (img && lightbox && lightboxImg) {
        lightboxImg.innerHTML = img.outerHTML;
        if (lightboxCaption && dateText) {
          lightboxCaption.textContent = dateText.textContent || 'Nuestros Momentos Juntos 💕';
        }
        lightbox.classList.add('open');
      }
    });
  });

  if (closeLightboxBtn && lightbox) {
    closeLightboxBtn.addEventListener('click', () => lightbox.classList.remove('open'));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
  }

  if (uploadPhotoBtn && polaroidFileInput) {
    uploadPhotoBtn.addEventListener('click', () => polaroidFileInput.click());
    polaroidFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0] && activePolaroidCard) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const frame = activePolaroidCard.querySelector('.polaroid-photo-frame, .film-img-frame');
          if (frame) {
            frame.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
          }
          if (lightboxImg) {
            lightboxImg.innerHTML = `<img src="${ev.target.result}" style="max-width:100%;max-height:50vh;object-fit:contain;">`;
          }
          // Save in localStorage
          try {
            const cardId = activePolaroidCard.getAttribute('data-polaroid-id');
            if (cardId) localStorage.setItem(`custom_photo_${cardId}`, ev.target.result);
          } catch (err) {}
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }

  // Load any saved custom photos from localStorage
  document.querySelectorAll('[data-polaroid-id]').forEach((card) => {
    const cardId = card.getAttribute('data-polaroid-id');
    try {
      const saved = localStorage.getItem(`custom_photo_${cardId}`);
      if (saved) {
        const frame = card.querySelector('.polaroid-photo-frame, .film-img-frame');
        if (frame) {
          frame.innerHTML = `<img src="${saved}" style="width:100%;height:100%;object-fit:cover;">`;
        }
      }
    } catch (e) {}
  });

  // Initial UI state
  updateSlideUI();
});
