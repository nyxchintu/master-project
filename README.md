Message Viewer — short README

Overview
- This small project displays private messages after a countdown finishes. There are three visual sections supported via `?section=` query param:
  - `?section=ist` — India / IST themed
  - `?section=qatar` — Qatar / AST themed
  - `?section=qatar-birth` — Exact birth moment themed (moon + stars)

Files
- `message.html` — viewer page (uses `localStorage` keys to find messages and the last-access time).
- `countdown.html` — (existing) countdown page that links back to the viewer.
- `index.html` — admin / landing page used to set messages (not modified here).
- `style.css` — shared stylesheet moved from `message.html` for easier maintenance.

How messages are provided
- Admin writes raw HTML into localStorage under keys named `message_ist`, `message_qatar`, and `message_qatar-birth`.
- When the countdown finishes, admin code sets a corresponding `lastHit_*` timestamp in localStorage (e.g. `lastHit_qatar`). The viewer reads these to determine availability and shows the message for 48 hours.

Quick dev checks
- Open `message.html?section=ist` to preview the IST card.
- Open `message.html?section=qatar` to preview the Qatar card.
- Open `message.html?section=qatar-birth` to preview the birth moment card.

Music
- Each section has an associated background track located in `assets/`:
  - `nist.mp3` — played for `?section=ist`
  - `bqt.mp3` — played for `?section=qatar`
  - `nqt.mp3` — played for `?section=qatar-birth`
- Controls: a compact Play / Mute control appears in the top-right of the viewer. Browsers may block autoplay; press Play to start audio if needed.

Notes & next steps
- Visuals updated: IST chakra has 24 spokes; Qatar icon uses serrated edge; birth icon has a moon + twinkling stars with gold glow.
- I added responsive tweaks and basic ARIA attributes on the icon wrapper.
- Recommend final QA by opening pages on mobile and desktop, and reviewing messages set through the admin UI.

If you want, I can now:
- Tweak the exact maroon shade or chakra styling.
- Run a small accessibility checklist and produce fixes (contrast, keyboard focus order).
- Prepare a git commit message and commit changes for you.

Removed files
- `message.json` — this file was empty and not used by the viewer; message storage is handled via `localStorage` keys (see "How messages are provided"). If you need this file restored, I can recreate it or move its intended contents into the repo.

Assets
- `assets/bg.mp3` is used by `index.html` as a background/source audio.
- `assets/confetti.js` is referenced from `index.html` for celebratory visuals.
- `assets/nist.mp3`, `assets/bqt.mp3`, and `assets/nqt.mp3` are used by the viewer (`message.html`).
