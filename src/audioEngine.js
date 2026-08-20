/* ==========================================================================
   EXTRA TIME RADIO — PERFECT SHUFFLE & CONTINUOUS AUTOPLAY ENGINE
   ========================================================================== */

import { MOCK_TRACKS } from './mockData.js';

/**
 * AudioEngine manages state, YouTube IFrame API playback, 
 * HTML5 audio fallbacks, and live equalizer canvas rendering.
 */
export class AudioEngine {
  constructor(canvasElementId) {
    this.canvas = document.getElementById(canvasElementId);
    this.canvasCtx = this.canvas ? this.canvas.getContext('2d') : null;

    // Playback state machine: IDLE | LOADING | PLAYING | PAUSED | ERROR
    this.state = 'IDLE';
    this.isUserPaused = false; // Set to true ONLY when user clicks Pause
    this.hasInitialAutoplayAttempted = false;

    this.currentMood = 'pre-match';
    this.playlist = MOCK_TRACKS['pre-match'];
    this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
    this.isMuted = false;
    this.volume = 0.9;
    this.isTransitioning = false;

    // YouTube Player State Configuration
    this.ytPlayer = null;
    this.isYtReady = false;
    this.playlistId = 'PLZHNkTV1FW4c'; 
    this.ytPollInterval = null;

    // HTML5 Audio & Web Audio Fallbacks
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audioCtx = null;
    this.synthNodes = [];
    this.synthGain = null;
    this.animationFrameId = null;

    // Event Callbacks
    this.onTrackChange = null;
    this.onStateChange = null;
    this.onTimeUpdate = null;
    this.onAutoplayBlocked = null;
    this.onError = null;

    this.initHTML5Listeners();
    this.initYouTubeAPI();
    this.initGlobalUnmuteListeners();
  }

  /**
   * Unmute and trigger playback on initial site open or user gesture.
   * Strictly respects isUserPaused flag so manual pauses are never overridden.
   */
  initGlobalUnmuteListeners() {
    const unmuteHandler = () => {
      const enterBtn = document.getElementById('enterRadioBtn');
      if (enterBtn) enterBtn.style.display = 'none';

      // IF USER MANUALLY PAUSED, ABSOLUTELY DO NOT AUTOPLAY!
      if (this.isUserPaused) return;

      if (this.ytPlayer) {
        try {
          if (this.ytPlayer.unMute) this.ytPlayer.unMute();
          if (this.ytPlayer.setVolume) this.ytPlayer.setVolume(Math.round(this.volume * 100));
          if (this.ytPlayer.playVideo && this.state !== 'PLAYING') {
            this.ytPlayer.playVideo();
          }
        } catch (e) {}
      }
      if (this.audio) {
        this.audio.muted = false;
        this.audio.volume = this.volume;
        if (this.state !== 'PLAYING') {
          this.audio.play().catch(() => {});
        }
      }
    };

    ['mousemove', 'pointermove', 'click', 'keydown', 'touchstart', 'pointerdown', 'scroll'].forEach(evt => {
      window.addEventListener(evt, unmuteHandler, { capture: true });
      document.addEventListener(evt, unmuteHandler, { capture: true });
    });
  }

  /* ------------------------------------------------------------------------
     1. YOUTUBE IFRAME API INTEGRATION
     ------------------------------------------------------------------------ */

  initYouTubeAPI() {
    const checkAndInit = () => {
      if (window.YT && window.YT.Player) {
        this.createYouTubePlayer();
        return true;
      }
      return false;
    };

    if (checkAndInit()) return;

    const previousOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      this.createYouTubePlayer();
    };

    const pollInterval = setInterval(() => {
      if (checkAndInit()) {
        clearInterval(pollInterval);
      }
    }, 50);
  }

  createYouTubePlayer() {
    if (this.ytPlayer) return;

    try {
      this.ytPlayer = new window.YT.Player('youtubePlayer', {
        height: '1',
        width: '1',
        playerVars: {
          listType: 'playlist',
          list: this.playlistId,
          autoplay: 1,
          mute: 1, // Muted start to 100% bypass Chrome autoplay restriction
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => this.onYtPlayerReady(event),
          onStateChange: (event) => this.onYtPlayerStateChange(event),
          onError: (event) => this.onYtPlayerError(event)
        }
      });
    } catch (e) {
      console.warn('Unable to initialize YouTube Player API, using HTML5 fallback:', e);
    }
  }

  onYtPlayerReady(event) {
    this.isYtReady = true;

    try {
      this.ytPlayer.setShuffle(true);
      const randomIndex = Math.floor(Math.random() * 40);
      
      this.ytPlayer.loadPlaylist({
        list: this.playlistId,
        listType: 'playlist',
        index: randomIndex
      });

      this.ytPlayer.setShuffle(true);

      // Autoplay immediately on site open unless user manually paused
      if (!this.isUserPaused) {
        this.ytPlayer.mute();
        this.ytPlayer.playVideo();
      }
    } catch (e) {}

    this.startYtProgressPoll();
  }

  onYtPlayerStateChange(event) {
    if (!window.YT) return;

    switch (event.data) {
      case window.YT.PlayerState.PLAYING:
        console.log('[ET RADIO] play');
        this.setState('PLAYING');
        this.updateYtTrackInfo();
        this.startWaveform();
        break;

      case window.YT.PlayerState.PAUSED:
        console.log('[ET RADIO] pause');
        this.setState('PAUSED');
        this.drawWaveform();
        break;

      case window.YT.PlayerState.BUFFERING:
        this.setState('LOADING');
        break;

      case window.YT.PlayerState.CUED:
      case 5:
        if (!this.isUserPaused && this.ytPlayer && this.ytPlayer.playVideo) {
          try {
            this.ytPlayer.unMute();
            this.ytPlayer.setVolume(Math.round(this.volume * 100));
            this.ytPlayer.playVideo();
          } catch (e) {}
        }
        break;

      case window.YT.PlayerState.ENDED:
        console.log('[ET RADIO] natural track ended -> playing next random shuffled track');
        if (!this.isUserPaused) {
          this.nextTrack();
        }
        break;
    }
  }

  onYtPlayerError(event) {
    console.warn('[ET RADIO] YouTube Player error:', event.data);
    if (!this.isUserPaused) {
      this.nextTrack();
    }
  }

  updateYtTrackInfo() {
    if (!this.ytPlayer || !this.ytPlayer.getVideoData) return;
    try {
      const data = this.ytPlayer.getVideoData();
      if (data && data.title) {
        const title = data.title;
        const author = data.author || 'Extra Time Radio • YouTube Music';
        const videoId = data.video_id;
        const thumbnail = videoId 
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : '/backgrounds/hero-collage.jpg';

        if (this.onTrackChange) {
          this.onTrackChange({
            title: title,
            artist: author,
            artworkUrl: thumbnail,
            duration: AudioEngine.formatTime(this.ytPlayer.getDuration() || 210)
          }, this.currentMood);
        }
      }
    } catch (e) {}
  }

  startYtProgressPoll() {
    if (this.ytPollInterval) clearInterval(this.ytPollInterval);

    this.ytPollInterval = setInterval(() => {
      if (this.isYtReady && this.ytPlayer && this.ytPlayer.getCurrentTime && this.state === 'PLAYING') {
        const cur = this.ytPlayer.getCurrentTime() || 0;
        const dur = this.ytPlayer.getDuration() || 0;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(cur, dur);
        }
      }
    }, 400);
  }

  /* ------------------------------------------------------------------------
     2. HTML5 & WEB AUDIO FALLBACK LISTENERS
     ------------------------------------------------------------------------ */

  initHTML5Listeners() {
    this.audio.volume = this.volume;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isYtReady || this.state !== 'PLAYING') {
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.audio.currentTime, this.audio.duration || this.getCurrentTrack().durationSeconds);
        }
      }
    });

    this.audio.addEventListener('ended', () => {
      console.log('[ET RADIO] natural track ended');
      if (!this.isUserPaused) {
        this.nextTrack();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio stream error, engaging ambient synth fallback:', e);
      if (!this.isUserPaused && (this.state === 'PLAYING' || this.state === 'LOADING')) {
        this.startSyntheticSynth();
      }
    });
  }

  setState(newState) {
    this.state = newState;
    const isPlaying = (newState === 'PLAYING');
    if (this.onStateChange) {
      this.onStateChange(isPlaying, newState);
    }
  }

  initWebAudio() {
    if (this.audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    } catch (e) {}
  }

  getCurrentTrack() {
    return this.playlist[this.currentTrackIndex] || this.playlist[0];
  }

  loadTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentTrackIndex = index;
    }
    const track = this.getCurrentTrack();
    this.audio.src = track.audioUrl;
    this.audio.load();

    if (this.onTrackChange && !this.isYtReady) {
      this.onTrackChange(track, this.currentMood);
    }
  }

  /* ------------------------------------------------------------------------
     3. UNIFIED PLAYBACK CONTROLS (ALWAYS SHUFFLED RANDOM TRACKS)
     ------------------------------------------------------------------------ */

  async playTrack() {
    // User explicitly pressed play / site autoplaying on load
    this.isUserPaused = false;

    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try { await this.audioCtx.resume(); } catch (e) {}
    }

    this.setState('LOADING');

    // 1. YouTube Player Playback
    if (this.isYtReady && this.ytPlayer && this.ytPlayer.playVideo) {
      try {
        this.ytPlayer.setShuffle(true);
        this.ytPlayer.mute();
        this.ytPlayer.playVideo();

        try {
          this.ytPlayer.unMute();
          this.ytPlayer.setVolume(Math.round(this.volume * 100));
        } catch (e) {}
        return;
      } catch (err) {
        console.warn('YouTube play video failed, trying fallback:', err);
      }
    }

    // 2. HTML5 Audio Playback
    try {
      this.audio.muted = false;
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
      this.setState('PLAYING');
    } catch (err) {
      this.startSyntheticSynth();
    }

    this.startWaveform();
  }

  pauseTrack() {
    // User explicitly clicked Pause
    this.isUserPaused = true;
    console.log('[ET RADIO] user clicked pause -> setting isUserPaused = true');

    if (this.isYtReady && this.ytPlayer && this.ytPlayer.pauseVideo) {
      try { this.ytPlayer.pauseVideo(); } catch (e) {}
    }
    this.audio.pause();
    this.stopSyntheticSynth();
    this.setState('PAUSED');
  }

  togglePlay() {
    if (this.state === 'PLAYING') {
      this.pauseTrack();
    } else {
      this.playTrack();
    }
  }

  nextTrack() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    setTimeout(() => { this.isTransitioning = false; }, 1200);

    const wasPlaying = (this.state === 'PLAYING');

    if (this.isYtReady && this.ytPlayer) {
      try {
        this.ytPlayer.setShuffle(true);
        
        // Pick a random playlist index from 0 to 45 to prevent track repetition
        const playlistLength = 45;
        let randomIndex = Math.floor(Math.random() * playlistLength);
        if (this.ytPlayer.getPlaylistIndex) {
          const currentIndex = this.ytPlayer.getPlaylistIndex();
          if (randomIndex === currentIndex) {
            randomIndex = (randomIndex + 1) % playlistLength;
          }
        }

        this.ytPlayer.playVideoAt(randomIndex);

        if (!this.isUserPaused) {
          setTimeout(() => {
            if (this.ytPlayer && this.ytPlayer.playVideo && !this.isUserPaused) {
              try {
                this.ytPlayer.unMute();
                this.ytPlayer.setVolume(Math.round(this.volume * 100));
                this.ytPlayer.playVideo();
              } catch (e) {}
            }
          }, 300);
        } else {
          setTimeout(() => {
            if (this.ytPlayer && this.ytPlayer.pauseVideo) {
              try { this.ytPlayer.pauseVideo(); } catch (e) {}
            }
          }, 300);
        }
        return;
      } catch (e) {}
    }

    const nextIndex = Math.floor(Math.random() * this.playlist.length);
    this.loadTrack(nextIndex);
    if (wasPlaying && !this.isUserPaused) {
      this.playTrack();
    }
  }

  prevTrack() {
    const wasPlaying = (this.state === 'PLAYING');

    if (this.isYtReady && this.ytPlayer) {
      try {
        this.ytPlayer.setShuffle(true);
        const playlistLength = 45;
        let randomIndex = Math.floor(Math.random() * playlistLength);
        this.ytPlayer.playVideoAt(randomIndex);

        if (!this.isUserPaused) {
          setTimeout(() => {
            if (this.ytPlayer && this.ytPlayer.playVideo && !this.isUserPaused) {
              this.ytPlayer.unMute();
              this.ytPlayer.setVolume(Math.round(this.volume * 100));
              this.ytPlayer.playVideo();
            }
          }, 300);
        } else {
          setTimeout(() => {
            if (this.ytPlayer && this.ytPlayer.pauseVideo) {
              try { this.ytPlayer.pauseVideo(); } catch (e) {}
            }
          }, 300);
        }
        return;
      } catch (e) {}
    }

    if (this.audio.currentTime > 3) {
      this.seekTo(0);
      return;
    }
    const prevIndex = Math.floor(Math.random() * this.playlist.length);
    this.loadTrack(prevIndex);
    if (wasPlaying && !this.isUserPaused) {
      this.playTrack();
    }
  }

  seekTo(seconds) {
    if (this.isYtReady && this.ytPlayer && this.ytPlayer.seekTo) {
      try {
        this.ytPlayer.seekTo(seconds, true);
        return;
      } catch (e) {}
    }
    if (this.audio) {
      this.audio.currentTime = seconds;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    const targetVol = this.isMuted ? 0 : this.volume;

    if (this.isYtReady && this.ytPlayer && this.ytPlayer.setVolume) {
      try {
        if (targetVol > 0 && !this.isUserPaused) this.ytPlayer.unMute();
        this.ytPlayer.setVolume(Math.round(targetVol * 100));
      } catch (e) {}
    }

    this.audio.volume = targetVol;
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(targetVol * 0.05, this.audioCtx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  /* 2-Second Initial Autoplay Attempt (Obeys isUserPaused strictly) */
  scheduleAutoplay() {
    console.log('[ET RADIO] initial autoplay attempt scheduled in 2s');
    setTimeout(() => {
      if (!this.hasInitialAutoplayAttempted && !this.isUserPaused) {
        this.hasInitialAutoplayAttempted = true;
        console.log('[ET RADIO] initial autoplay attempt running');
        this.playTrack();
      } else {
        console.log('[ET RADIO] initial autoplay skipped because user paused or already attempted');
      }
    }, 2000);
  }

  /* Synthetic Audio Fallback */
  startSyntheticSynth() {
    if (!this.audioCtx || this.isUserPaused) return;
    try {
      this.stopSyntheticSynth();

      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.05, this.audioCtx.currentTime);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      const freqs = [110, 164.81, 220];
      this.synthNodes = freqs.map(f => {
        const osc = this.audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
        osc.connect(filter);
        osc.start();
        return osc;
      });

      filter.connect(this.synthGain);
      this.synthGain.connect(this.audioCtx.destination);
      this.setState('PLAYING');
      this.startWaveform();
    } catch (e) {}
  }

  stopSyntheticSynth() {
    if (this.synthNodes && this.synthNodes.length) {
      this.synthNodes.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      });
      this.synthNodes = [];
    }
  }

  /* ------------------------------------------------------------------------
     4. SUBTLE AUDIO-REACTIVE EQUALIZER WAVEFORM RENDERING
     ------------------------------------------------------------------------ */

  startWaveform() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    const render = () => {
      this.drawWaveform();
      if (this.state === 'PLAYING') {
        this.animationFrameId = requestAnimationFrame(render);
      }
    };
    render();
  }

  drawWaveform() {
    if (!this.canvasCtx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.canvasCtx.clearRect(0, 0, w, h);

    const barCount = 24;
    const gap = 2.5;
    const totalGap = gap * (barCount - 1);
    const barW = (w - totalGap) / barCount;
    const time = Date.now() * 0.0035;

    for (let i = 0; i < barCount; i++) {
      let barH = 2;
      if (this.state === 'PLAYING') {
        const wave = Math.sin(time * 2.2 + i * 0.35) * Math.cos(time * 1.4 + i * 0.18);
        barH = Math.max(2.5, Math.abs(wave) * (h * 0.85) + 2);
      } else {
        barH = 2.5; // Frozen static state when paused
      }
      const x = i * (barW + gap);
      const y = (h - barH) / 2;

      this.canvasCtx.fillStyle = (this.state === 'PLAYING')
        ? 'rgba(232, 236, 233, 0.85)' // Warm white/neutral accent
        : 'rgba(162, 170, 165, 0.35)'; // Frozen static state
      
      this.canvasCtx.beginPath();
      this.canvasCtx.roundRect(x, y, barW, barH, 1);
      this.canvasCtx.fill();
    }
  }

  static formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
