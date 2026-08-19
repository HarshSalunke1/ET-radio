# ET Radio Design System

**Version:** 1.1  
**Product:** ET Radio  
**Positioning:** Immersive football music experience  
**Design Source of Truth:** This document

---

# 1. DESIGN PHILOSOPHY

ET Radio is a small, atmospheric corner of the internet built around football and music.

It should feel like discovering a football radio station late at night.

The experience is:

**football atmosphere + music + glass + darkness + photography**

The website is intentionally minimal.

It should not feel like:

- a football news website
- a sports dashboard
- a SaaS product
- a betting platform
- a gaming interface
- Spotify
- ESPN
- FIFA

The design goal is:

> **Make the user want to stay.**

---

# 2. CORE EXPERIENCE

The primary experience is:

```text
OPEN ET RADIO
      ↓
FOOTBALL PHOTOGRAPHY APPEARS
      ↓
ET RADIO BRAND REVEALS
      ↓
GLASS MUSIC PLAYER APPEARS
      ↓
~2 SECONDS
      ↓
ATTEMPT AUDIO PLAYBACK
      ↓
MUSIC STARTS
      ↓
USER LISTENS
      ↓
USER CHANGES MOOD / TRACK
```

No onboarding.

No dashboard.

No unnecessary navigation.

No feature wall.

---

# 3. BRAND

## Name

# ET RADIO

ET means:

**Extra Time**

## Brand line

```text
FOOTBALL · MUSIC · EXTRA TIME
```

## Brand personality

* cozy
* cinematic
* intimate
* sophisticated
* understated
* nostalgic
* football-aware
* music-first
* slightly mysterious

ET Radio should feel like a place, not a product demo.

---

# 4. VISUAL CONCEPT

The primary visual concept is:

**Football photography at night + glass interface + music atmosphere.**

The four supplied football images are the primary environmental layer.

They should not appear as cards.

They should not appear in a gallery.

They should not be shown with captions.

They should become the full-screen visual environment.

---

# 5. BACKGROUND SLIDESHOW

Use the four local images:

```text
/backgrounds/football-01.jpg
/backgrounds/football-02.jpg
/backgrounds/football-03.jpg
/backgrounds/football-04.jpg
```

## Sequence

```text
football-01
     ↓
football-02
     ↓
football-03
     ↓
football-04
     ↓
football-01
     ↓
repeat forever
```

## Timing

Each image:

**6 seconds**

Transition:

**1.5 seconds**

Transition type:

**cinematic crossfade**

Never use hard cuts.

Never use slide-in animations.

---

# 6. IMAGE PRESENTATION

The images have different aspect ratios.

Never distort them.

Use:

```css
object-fit: cover;
```

Each image may use its own `object-position`.

The important football subject must remain visible.

Portrait images should work especially well on mobile.

Landscape images should be positioned carefully on desktop.

Do not create black bars.

Do not stretch images.

Do not crop the images into separate assets just for layout.

---

# 7. BACKGROUND CINEMATIC TREATMENT

The photographs should remain clearly visible.

Apply a dark cinematic treatment:

### Layer 1

Image

### Layer 2

Dark overlay

### Layer 3

Subtle vignette

### Layer 4

Very subtle film grain

Suggested overlay:

```css
background: rgba(0, 0, 0, 0.35);
```

Adjust depending on image brightness.

Do not make the photos disappear.

The football photography should remain one of the strongest visual elements.

---

# 8. BACKGROUND MOTION

Use extremely subtle movement.

Example:

```text
scale 1.00
   ↓
scale 1.03
```

during each image's display period.

The movement should feel almost imperceptible.

Optional:

* extremely slow haze movement
* very subtle light movement
* subtle depth movement

Never use:

* rapid zoom
* camera shake
* spinning backgrounds
* aggressive parallax

---

# 9. IMAGE TRANSITION IMPLEMENTATION

Use two image layers.

Concept:

```text
CURRENT IMAGE
opacity: 1
       ↓
opacity: 0

NEXT IMAGE
opacity: 0
       ↓
opacity: 1
```

Preload the next image.

Never allow:

* blank frame
* flickering
* broken image
* visible loading spinner

After the crossfade, update the current image.

---

# 10. COLOR SYSTEM

Use a restrained palette.

| Token           | Value                    |
| --------------- | ------------------------ |
| Background      | `#050706`                |
| Primary text    | `#E8ECE9`                |
| Secondary text  | `#A2AAA5`                |
| Muted text      | `#737B76`                |
| Accent green    | `#7FAE8B`                |
| Glass           | `rgba(255,255,255,0.05)` |
| Glass hover     | `rgba(255,255,255,0.08)` |
| Glass border    | `rgba(255,255,255,0.12)` |
| Glass highlight | `rgba(255,255,255,0.18)` |
| Dark overlay    | `rgba(0,0,0,0.35–0.50)`  |

## Color rules

Green is an accent only.

Use it for:

* active playback
* active mood
* tiny indicators
* subtle glow

Do not make the whole interface green.

Avoid:

* neon-heavy design
* rainbow gradients
* purple/blue SaaS gradients
* bright white cards

---

# 11. TYPOGRAPHY

Typography should feel premium and editorial.

Recommended:

* Inter
* Manrope
* another high-quality modern sans-serif

## Hierarchy

### ET

Very large.

This is the strongest typographic element.

### RADIO

Smaller than ET.

Strong but restrained.

### Supporting line

```text
FOOTBALL · MUSIC · EXTRA TIME
```

Small uppercase typography.

Use generous letter spacing.

Avoid:

* gaming fonts
* cartoon football fonts
* futuristic fonts
* giant marketing slogans

---

# 12. PAGE COMPOSITION

The page should feel open and almost empty.

Concept:

```text
┌───────────────────────────────────────────────┐
│ ET RADIO                                      │
│                                               │
│                                               │
│                    ET                         │
│                  RADIO                        │
│                                               │
│        FOOTBALL · MUSIC · EXTRA TIME          │
│                                               │
│             ┌─────────────────┐               │
│             │   NOW PLAYING   │               │
│             │                 │               │
│             │   Track Title   │               │
│             │   Artist        │               │
│             │                 │               │
│             │  ◀   ▶   ▶     │               │
│             │  ───────────    │               │
│             └─────────────────┘               │
│                                               │
│        PRE-MATCH  MATCHDAY  LATE NIGHT        │
│        CLASSICS   VICTORY   HEARTBREAK        │
│                                               │
└───────────────────────────────────────────────┘
```

This is conceptual.

Do not turn the entire page into literal boxes.

Negative space is intentional.

---

# 13. BRAND POSITION

Place `ET RADIO` in the upper-left or upper-center area.

It should be quiet and refined.

Do not create a large traditional header.

Do not add:

* FM frequency
* broadcast status
* stadium FX button
* version number
* unnecessary badges

---

# 14. HERO

There is no conventional marketing hero.

Do not use:

```text
FEEL THE STADIUM VIBE
```

Do not use large promotional paragraphs.

The hero is simply:

```text
ET
RADIO

FOOTBALL · MUSIC · EXTRA TIME
```

The photography provides the emotion.

The music player provides the interaction.

---

# 15. GLASSMORPHISM

Glass is a major material in the interface.

Use it for the music player and limited secondary controls.

Suggested style:

```css
background: rgba(255,255,255,0.05);
backdrop-filter: blur(24px) saturate(115%);
-webkit-backdrop-filter: blur(24px) saturate(115%);
border: 1px solid rgba(255,255,255,0.12);
box-shadow:
  0 20px 60px rgba(0,0,0,0.25),
  inset 0 1px 0 rgba(255,255,255,0.06);
```

Glass should feel translucent.

The photo must remain visible through it.

Do not create dozens of glass cards.

---

# 16. MUSIC PLAYER

The player is the primary interactive element.

It should look like a floating glass object.

## Required information

```text
NOW PLAYING

Track Title
Artist
```

## Required controls

* previous
* play / pause
* next
* progress
* volume

Optional:

* tiny waveform
* current time
* duration

Do not build a Spotify-style dashboard.

Do not use giant album artwork as the main player element.

The background photography is more important than artwork.

---

# 17. AUTOPLAY EXPERIENCE

Approximately 2 seconds after the page becomes interactive:

Attempt playback.

Respect browser autoplay restrictions.

Never bypass them.

## Successful autoplay

If playback succeeds:

* music begins
* play state becomes active
* waveform animates
* player subtly illuminates

## Blocked autoplay

If playback is blocked:

show:

```text
ENTER ET RADIO
```

or:

```text
PLAY RADIO
```

After one user interaction:

* music begins
* prompt disappears
* player becomes active

The fallback should feel like part of the experience.

---

# 18. MOOD SELECTOR

Available moods:

```text
PRE-MATCH
MATCHDAY
LATE NIGHT
CLASSICS
VICTORY
HEARTBREAK
```

Do not place every mood inside a large rounded pill.

Prefer simple text or minimal glass controls.

Active mood can use the green accent.

On mobile:

Use horizontal scrolling.

---

# 19. NAVIGATION

V1 does not require conventional navigation.

Recommended:

Top-left:

```text
ET RADIO
```

Optional small controls:

```text
volume
```

No:

* Home
* Matches
* Players
* Stories
* News
* Dashboard

The landing page is the experience.

---

# 20. ANIMATION

Animation should be subtle.

## Initial load

```text
BACKGROUND
   ↓
ET
   ↓
RADIO
   ↓
TAGLINE
   ↓
PLAYER
   ↓
~2 SECONDS
   ↓
AUTOPLAY ATTEMPT
```

## Music active state

* subtle waveform motion
* gentle player glow
* progress movement

## Track change

* metadata crossfade
* progress reset
* subtle transition

Never use:

* bounce
* aggressive scaling
* spinning UI
* excessive motion
* flashy transitions

---

# 21. RESPONSIVE DESIGN

## Desktop

* full-screen photography
* centered brand
* floating glass player
* large negative space

## Mobile

* portrait-friendly photography
* compact brand
* player remains dominant
* mood selector scrolls horizontally
* controls are thumb-friendly

Never simply stack desktop components.

---

# 22. ACCESSIBILITY

Support:

* keyboard navigation
* accessible playback labels
* focus-visible states
* readable contrast
* reduced-motion preference
* semantic HTML

Do not rely on icons alone for critical actions.

---

# 23. PERFORMANCE

Optimize background assets.

Requirements:

* preload next slideshow image
* avoid blank transitions
* lazy-load non-critical assets
* keep animations GPU-friendly
* prevent unnecessary rerenders
* no horizontal overflow

The background slideshow must remain smooth without making the page heavy.

---

# 24. DESIGN DO / DON'T

## DO

* use negative space
* let photos dominate
* use subtle glass
* keep typography elegant
* make music the center
* keep football atmosphere emotional
* use restrained animation

## DON'T

* create a sports dashboard
* add giant hero slogans
* add excessive pills
* add unnecessary labels
* add unnecessary features
* overuse green
* use giant card grids
* imitate Spotify
* imitate ESPN
* imitate FIFA

---

# 25. Final Design Test

Ask:

> Does ET Radio feel like a place?

If yes, continue.

If it feels like a dashboard, simplify.

If it feels like a SaaS landing page, simplify.

If the UI overwhelms the photography, simplify.

If the photography overwhelms the music controls, adjust the overlay.

The final feeling should be:

**quiet football night + beautiful music + glass + photography.**
