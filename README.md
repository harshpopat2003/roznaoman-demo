# Rozna — demo concept

A concept site for [Rozna](https://www.roznaoman.com/), the Omani restaurant in Muscat built inside a
fort. Not affiliated with Rozna; built by The Auren Studio as a pitch piece.

**The idea: Rozna is a building, so the site is one too.** There is no hero, no benefits grid, no
comparison table, no testimonial rail and no footer. There are eight rooms, walked in the order a
guest walks them — gate, courtyard, table, arcade, Al Sabla, kitchen, school, the way out. Each room
holds only what is actually in that room, and the booking sits by the door, because that is where a
person decides.

It opens on the gate: the fort wall filling the screen, and its two carved teak leaves shut. Scrolling
swings them open — and what is behind them is room 01 itself, already there, its photograph and its
words. Nothing slides in from the side. Only once you are through the door does the building start
moving sideways.

From there, vertical scroll moves you **sideways** through the plan. The doorways between the
remaining rooms are real too: a slab of wall with the Rozna arch cut out of it, and through the
cut-out you can see the room you are about to be in. The site's one repeated shape is the building's
one repeated shape.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Stack

| | |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, tokens declared in `@theme` in `app/globals.css` |
| Motion | None. No GSAP, no Lenis, no Motion — see below |
| Type | Instrument Serif (display), DM Sans (body), DM Mono (the survey), Noto Kufi Arabic |

**There is no animation library.** The whole site is a single number — how far along the plan you are
— and one `requestAnimationFrame` loop that eases it towards the real scroll position and writes it to
about a dozen transforms. The first screen and a half of scroll buys no sideways movement at all; it
opens the gate instead, and the engine spends it on four beats (`--sign`, `--leaf`, `--reveal`,
`--step`) that the overlay reads as plain CSS. That easing *is* the smooth scroll, so there is no second interpolator to
fight, and clicking a room in the plan reads as a glide for free because the lerp still has to cover
the distance. Everything else is a CSS transition off a `data-state` attribute.

That is not minimalism for its own sake: a scroll library is the right tool for a page of independent
scroll-triggered sections, and the wrong one for a page that is a single continuous movement.

## How it is put together

```
app/
  globals.css   design tokens, the arch clip-path, the type ramp, room-arrival states
  layout.tsx    fonts, metadata, the one <clipPath> every doorway masks against
  page.tsx      renders <Building />
lib/
  rooms.ts      every word on the site, and the plan it is arranged on
  travel.ts     the rAF travel engine and the walkable/vertical decision
components/
  Building.tsx  lays out rooms and doorways, drives the walk, renders the survey
  Gate.tsx      the opening sequence, an overlay on the courtyard's panel
  Plan.tsx      the floor plan, which is also the navigation and the progress indicator
  Threshold.tsx a doorway
  Room.tsx      the shell every room sits in, plus the room marker
  rooms/        one file per room
```

There are eight rooms on the plan but only seven panels: the gate and the courtyard share one. The
maps in `Building.tsx` are built from the same data the panels are, so a doorway can be added or
removed without the plan quietly pointing at the wrong arch.

**All copy lives in `lib/rooms.ts`.** Nothing needs a component opened to change a dish, a review or
the opening hours.

### Two registers, kept apart

The building is photographed. Everything *said* about it is drawn on paper laid over the top —
hairline rules, mono labels, opaque cream sheets pinned to walls. The site works because those two
registers never blend; there is no frosted glass anywhere.

### The three-dimensional bits

Depth is used where the content is genuinely spatial, not as decoration:

- **The gate** — the two leaves are cut out of the *same photograph* as the wall, each a window onto
  its own half of the one frame, so at rest the seams are invisible and what swings away is the actual
  pixels of the actual door. The seam sits at the leaves' real meeting point, which is not the middle
  of the opening. Compositing a close-up of the doors into the arch was the first attempt and it read
  as exactly what it was: a second picture, pasted on.
- **The table** (room 02) — a real surface tipped back on the X axis with the pots standing upright on
  it. Each pot is counter-rotated by the table's own angle so it stands rather than lies; its shadow
  is *not* counter-rotated, which is what sells the contact. Omani food is not plated for one, and a
  grid of cards cannot say that.
- **Parallax** — layers marked `data-depth` slide against the walk. Each is measured from its own
  centre, not from the start of the building, so "how far past me have you walked" stays a small
  number.

### Degradation

Below `lg`, or under `prefers-reduced-motion`, the same rooms stack and are read vertically — one
fallback layout, not two. Doorways become horizontal bands you pass down through. Both modes share one
state model; only the thing computing it differs. Nothing is hidden from anyone.

## Assets

`public/assets/` — the restaurant's own photography, collected from roznaoman.com and resized for the
web. `source-photos/` holds the untouched originals supplied directly.

**Image rights need confirming with Rozna before this ships.** Everything here is their own material,
but it was collected from their live site rather than handed over.

## Copy

Verified against roznaoman.com and the restaurant's public listings:

- the four signature dishes and their descriptions, word for word
- 8:00 AM – 11:30 PM, daily
- the WhatsApp number and the Instagram handle
- the three-part structure — restaurant, Al Sabla, Rozna Institute of Culinary Arts
- the guest reviews, trimmed only for length, under the reviewers' own names

Everything else is demo copy written for this pitch and needs sign-off. The 4.6 average and the 2,900+
guest count in particular are placeholders.
