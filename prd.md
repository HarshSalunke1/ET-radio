# ET Radio V1 Product Requirements Document

**Product:** ET Radio  
**Meaning:** Extra Time Radio  
**Tagline:** Football • Music • Extra Time

---

# 1. Product Overview

ET Radio is a minimal, immersive website centered around football and music.

Football provides the visual atmosphere.

Music is the core product.

The website should feel like opening a private football radio station late at night.

The product is intentionally simple.

It is not a football news website, sports dashboard, streaming platform clone, or social network.

---

# 2. Core Product Experience

The primary experience is:

```text
OPEN ET RADIO
      ↓
FOOTBALL PHOTOGRAPHY APPEARS
      ↓
ET RADIO BRAND REVEALS
      ↓
MUSIC PLAYER APPEARS
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

The user should be able to understand the purpose of the site almost immediately.

---

# 3. Product Goals

## Primary Goal

Create a memorable football music experience that users enjoy leaving open while they listen.

## Secondary Goals

* create a distinctive ET Radio identity;
* make football feel present without overwhelming the music;
* create an atmospheric and cozy environment;
* make listening extremely easy;
* build a clean technical foundation for future expansion.

---

# 4. Target User

Primary user:

A football fan who enjoys music and wants a visually immersive place to listen.

Potential usage:

* before matches;
* during matches;
* late at night;
* while studying;
* while working;
* while travelling;
* while relaxing;
* while browsing football culture.

---

# 5. V1 Scope

## Included

* single landing page;
* full-screen football image slideshow;
* ET Radio branding;
* tagline;
* glassmorphism;
* music player;
* autoplay attempt;
* autoplay fallback;
* play/pause;
* previous track;
* next track;
* progress;
* volume;
* music moods;
* responsive mobile experience;
* graceful audio errors.

## Explicitly NOT Included

* live scores;
* football news;
* player profiles;
* player statistics;
* league tables;
* match analytics;
* stories;
* articles;
* social feeds;
* authentication;
* user accounts;
* CMS;
* comments;
* chat;
* betting;
* subscriptions;
* payments;
* user-generated playlists;
* complex search;
* recommendation engine;
* large multi-page navigation.

The product should remain small.

---

# 6. Landing Page

The product is primarily one immersive page.

Required visual elements:

* football photography background;
* ET Radio brand;
* tagline;
* music player;
* mood selector.

There should be no feature-heavy homepage.

---

# 7. Background Slideshow

The four supplied local assets should be used as the primary background:

```text
/backgrounds/football-01.jpg
/backgrounds/football-02.jpg
/backgrounds/football-03.jpg
/backgrounds/football-04.jpg
```

## Sequence

```text
01
 ↓
02
 ↓
03
 ↓
04
 ↓
repeat
```

## Timing

Display each image for approximately:

**6 seconds**

Crossfade:

**1.5 seconds**

The slideshow must loop indefinitely.

## Requirements

* no stretching;
* no blank frames;
* no flickering;
* preload next image;
* use `object-fit: cover`;
* preserve important subject;
* support desktop and mobile;
* remain behind the ET Radio interface.

The four images are a core part of the visual identity.

---

# 8. Audio Experience

Audio is the primary functionality.

## Required controls

* play;
* pause;
* previous;
* next;
* volume;
* progress;
* current track;
* artist.

Optional:

* waveform;
* elapsed time;
* duration.

---

# 9. Autoplay

Approximately two seconds after the page becomes interactive, attempt to start playback.

The implementation must respect browser autoplay restrictions.

Do not attempt to bypass browser policies.

## If autoplay succeeds

* begin playback;
* activate play state;
* animate waveform if present;
* subtly illuminate player.

## If autoplay fails

Display a single action:

```text
ENTER ET RADIO
```

or:

```text
PLAY RADIO
```

Once the user clicks:

* begin playback;
* remove the prompt;
* transition into normal player state.

---

# 10. Music Moods

V1 should provide curated listening moods.

Initial moods:

```text
PRE-MATCH
MATCHDAY
LATE NIGHT
CLASSICS
VICTORY
HEARTBREAK
```

Each mood represents a curated track queue.

Selecting a mood should:

1. update the active mood;
2. select an appropriate track;
3. update metadata;
4. continue playback where possible;
5. keep the user on the same page.

There should be no separate mood pages.

---

# 11. Track Model

Use a simple data model:

```ts
interface Track {
  id: string;
  title: string;
  artist: string;
  mood: string;
  audioUrl: string;
  artworkUrl?: string;
  duration?: number;
}
```

Use local/mock audio initially.

Keep track data separate from UI components.

---

# 12. Mood Model

Suggested model:

```ts
interface Mood {
  id: string;
  name: string;
  trackIds: string[];
}
```

The implementation should allow future playlist expansion without changing the player architecture.

---

# 13. Audio State

Support:

```text
IDLE
LOADING
PLAYING
PAUSED
ERROR
BLOCKED_AUTOPLAY
```

Transitions:

```text
IDLE
 ↓
LOADING
 ↓
AUTOPLAY_ATTEMPT
 ├── PLAYING
 └── BLOCKED_AUTOPLAY
          ↓
      USER ACTION
          ↓
       PLAYING

PLAYING ↔ PAUSED

PLAYING
 ↓
TRACK CHANGE
 ↓
PLAYING
```

---

# 14. Error Handling

## Audio failure

Show:

```text
UNABLE TO PLAY THIS TRACK
```

Provide:

```text
TRY AGAIN
```

The application should remain functional.

## Broken track

Attempt the next valid track where possible.

## Missing artwork

Do not show broken image icons.

Artwork is optional, so the player should work without it.

---

# 15. User Experience Rules

The website must feel effortless.

The user should not have to:

* create an account;
* select preferences;
* complete onboarding;
* navigate through multiple pages;
* read large amounts of text;
* configure the player before listening.

The experience should become useful within seconds.

---

# 16. Technical Architecture

Recommended stack:

* React;
* TypeScript;
* Tailwind CSS.

Suggested structure:

```text
src/
├── components/
│   ├── BackgroundSlideshow/
│   ├── BrandMark/
│   ├── GlassPlayer/
│   ├── PlaybackControls/
│   └── MoodSelector/
│
├── data/
│   ├── tracks.ts
│   └── moods.ts
│
├── services/
│   └── audioService.ts
│
├── App.tsx
└── main.tsx
```

Keep the architecture lightweight.

Do not add infrastructure that V1 does not require.

---

# 17. Audio Service

Create a small abstraction around audio playback.

Concept:

```text
UI
 ↓
AudioService
 ↓
Audio Source
```

The UI should not directly contain all audio-management logic.

The service should handle:

* play;
* pause;
* next;
* previous;
* current track;
* progress;
* volume;
* playback errors.

This makes future changes easier.

---

# 18. Responsive Requirements

## Desktop

* full-screen background;
* large negative space;
* centered brand;
* floating glass player;
* mood selector below or near player.

## Mobile

* portrait-friendly image treatment;
* compact player;
* large touch targets;
* horizontal mood selector;
* no horizontal overflow.

Mobile should be deliberately designed.

---

# 19. Accessibility

Required:

* keyboard-accessible controls;
* accessible button labels;
* visible focus states;
* semantic HTML;
* sufficient contrast;
* reduced-motion support.

Example accessible labels:

```text
Play
Pause
Previous track
Next track
Volume
Select mood
```

---

# 20. Performance

The page should remain fast and smooth.

Requirements:

* optimize the four background images;
* preload the next slideshow image;
* avoid unnecessary JavaScript animation;
* use efficient transitions;
* minimize unnecessary dependencies;
* avoid layout shifts;
* prevent horizontal overflow.

Audio should not depend on decorative assets.

---

# 21. Browser Compatibility

The application must behave correctly when:

* autoplay is allowed;
* autoplay is blocked;
* audio source fails;
* background image fails;
* user prefers reduced motion;
* the browser is on mobile.

Never bypass browser security or autoplay restrictions.

---

# 22. Acceptance Criteria

## Visual

* [ ] Full-screen football photography works.
* [ ] Four images rotate in the intended sequence.
* [ ] Images crossfade smoothly.
* [ ] No blank frames.
* [ ] No stretched images.
* [ ] ET Radio identity is immediately visible.
* [ ] Glassmorphism follows `DESIGN.md`.
* [ ] Interface does not look like a sports dashboard.
* [ ] Mobile composition works.

## Audio

* [ ] Autoplay is attempted approximately 2 seconds after page readiness.
* [ ] Browser-blocked autoplay has a graceful fallback.
* [ ] Play/pause works.
* [ ] Previous/next works.
* [ ] Progress works.
* [ ] Volume works.
* [ ] Track metadata updates.
* [ ] Mood switching works.

## Reliability

* [ ] Broken audio does not crash the page.
* [ ] Missing image does not crash the page.
* [ ] No console errors in the normal user journey.
* [ ] No horizontal overflow.

---

# 23. MVP Definition of Done

ET Radio V1 is complete when:

1. The user opens a beautiful full-screen football environment.
2. The four supplied images loop continuously.
3. ET Radio branding appears naturally over the environment.
4. The glass music player is the primary interface.
5. The app attempts music playback after approximately two seconds.
6. Autoplay fallback works when the browser blocks sound.
7. Users can control playback.
8. Users can switch between moods.
9. The experience works on mobile and desktop.
10. Audio and image failures degrade gracefully.
11. The implementation remains simple and maintainable.
12. No unnecessary features have been added.

---

# 24. Product Principle

The central product rule is:

> **Football creates the atmosphere. Music creates the experience.**

Every future feature should be evaluated against this principle.

If a feature does not improve the listening experience, it should not automatically be added.

---

# 25. Future Possibilities

Only consider future expansion after V1 is polished.

Possible future directions:

* match-aware playlists;
* football event soundscapes;
* personalized radio;
* favorite moods;
* track history;
* live football integration;
* richer match experiences;
* curated football stories;
* player/club discovery;
* community features.

These are future possibilities, not V1 requirements.

---

# 26. Final Product Definition

ET Radio V1 is:

**One page.**

**Four football photographs.**

**One cinematic looping background.**

**One beautiful glass music player.**

**Six football-inspired moods.**

**Automatic playback attempt.**

**Minimal controls.**

**No feature bloat.**

> **ET Radio should feel like a place, not a dashboard.**
