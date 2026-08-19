/* ==========================================================================
   EXTRA TIME RADIO — STILL 4K BACKGROUND CONTROLLER (HERO COLLAGE WALLPAPER)
   ========================================================================== */

export class BackgroundSlideshow {
  constructor(layer1Id, layer2Id) {
    this.layer1 = document.getElementById(layer1Id);
    this.layer2 = document.getElementById(layer2Id);
    this.init();
  }

  init() {
    if (!this.layer1) return;
    // Single still 4K image (Hero 4-Panel Football Collage)
    this.layer1.style.backgroundImage = 'url("/backgrounds/hero-collage.jpg")';
    this.layer1.classList.add('active');
    if (this.layer2) {
      this.layer2.classList.remove('active');
    }
  }
}
