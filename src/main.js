/* ==========================================================================
   EXTRA TIME RADIO — MAIN APPLICATION CONTROLLER
   ========================================================================== */

import { BackgroundSlideshow } from './slideshow.js';
import { AudioEngine } from './audioEngine.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Environmental Background Slideshow (01 -> 02 -> 03 -> 04 -> repeat)
  const slideshow = new BackgroundSlideshow('bgLayer1', 'bgLayer2');

  // 2. Initialize Audio Engine
  const engine = new AudioEngine('waveformCanvas');

  // DOM Elements
  const liveClock = document.getElementById('liveClock');
  const enterRadioBtn = document.getElementById('enterRadioBtn');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const artworkThumb = document.getElementById('artworkThumb');

  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');

  const seekSlider = document.getElementById('seekSlider');
  const sliderFill = document.getElementById('sliderFill');
  const currentTimeEl = document.getElementById('currentTime');
  const durationTimeEl = document.getElementById('durationTime');

  const volumeSlider = document.getElementById('volumeSlider');
  const volumeFill = document.getElementById('volumeFill');
  const btnMute = document.getElementById('btnMute');
  const volumeIcon = document.getElementById('volumeIcon');

  const pillPlayer = document.getElementById('pillPlayer');

  // Live Digital Clock Updates
  const updateClock = () => {
    if (liveClock) {
      const now = new Date();
      liveClock.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  };
  updateClock();
  setInterval(updateClock, 1000);

  // Autoplay blocked callback: show ENTER ET RADIO prompt
  engine.onAutoplayBlocked = () => {
    if (enterRadioBtn) {
      enterRadioBtn.style.display = 'inline-flex';
    }
  };

  if (enterRadioBtn) {
    enterRadioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      enterRadioBtn.style.display = 'none';
      engine.playTrack();
    });
  }

  // Track metadata updates with smooth crossfade
  engine.onTrackChange = (track) => {
    if (trackTitle) {
      trackTitle.style.opacity = '0';
      setTimeout(() => {
        trackTitle.textContent = track.title;
        trackTitle.style.opacity = '1';
      }, 150);
    }

    if (trackArtist) {
      trackArtist.style.opacity = '0';
      setTimeout(() => {
        trackArtist.textContent = track.artist;
        trackArtist.style.opacity = '1';
      }, 150);
    }

    if (artworkThumb && track.artworkUrl) {
      artworkThumb.src = track.artworkUrl;
    }

    if (seekSlider) seekSlider.value = 0;
    if (sliderFill) sliderFill.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    if (durationTimeEl) durationTimeEl.textContent = track.duration || '3:22';
  };

  // Play / Pause state updates
  engine.onStateChange = (isPlaying) => {
    if (playIcon) {
      playIcon.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (pillPlayer) {
      pillPlayer.classList.toggle('is-playing', isPlaying);
    }
  };

  // Time update handler
  engine.onTimeUpdate = (currentSec, durationSec) => {
    if (currentTimeEl) currentTimeEl.textContent = AudioEngine.formatTime(currentSec);
    if (durationSec && !isNaN(durationSec)) {
      if (durationTimeEl) durationTimeEl.textContent = AudioEngine.formatTime(durationSec);
      const pct = (currentSec / durationSec) * 100;
      if (seekSlider) seekSlider.value = pct;
      if (sliderFill) sliderFill.style.width = `${pct}%`;
    }
  };

  // Controls bindings
  if (btnPlayPause) {
    btnPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      if (enterRadioBtn) enterRadioBtn.style.display = 'none';
      engine.togglePlay();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      engine.nextTrack();
    });
  }
  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      engine.prevTrack();
    });
  }

  // Seek slider
  if (seekSlider) {
    seekSlider.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value);
      if (sliderFill) sliderFill.style.width = `${pct}%`;
      const track = engine.getCurrentTrack();
      const totalSec = engine.audio.duration || track.durationSeconds || 210;
      engine.seekTo((pct / 100) * totalSec);
    });
  }

  // Volume slider
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      engine.setVolume(val);
      if (volumeFill) volumeFill.style.width = `${val * 100}%`;
      if (volumeIcon) {
        if (val === 0) volumeIcon.className = 'fa-solid fa-volume-xmark';
        else if (val < 0.5) volumeIcon.className = 'fa-solid fa-volume-low';
        else volumeIcon.className = 'fa-solid fa-volume-high';
      }
    });
  }

  // Mute button
  if (btnMute) {
    btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = engine.toggleMute();
      if (volumeIcon) {
        volumeIcon.className = muted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
      }
      if (volumeSlider) volumeSlider.value = muted ? 0 : engine.volume;
      if (volumeFill) volumeFill.style.width = muted ? '0%' : `${engine.volume * 100}%`;
    });
  }

  // Keyboard Shortcuts (Space, Arrows, M key)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.code === 'Space') {
      e.preventDefault();
      engine.togglePlay();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      engine.nextTrack();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      engine.prevTrack();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      if (btnMute) btnMute.click();
    }
  });

  // Load initial track
  engine.loadTrack(0);

  // Schedule 2-Second Automatic Autoplay Protocol per Requirement 21
  engine.scheduleAutoplay();
});
