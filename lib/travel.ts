"use client";

import { useEffect, useState } from "react";

/**
 * The travel engine.
 *
 * This site is one continuous movement through a building, not a stack
 * of independently-triggered sections — so it does not need a scroll
 * library. The whole thing is a single number: how far along the plan
 * you are, between 0 at the gate and 1 at the door out. One rAF loop
 * eases that number towards the real scroll position and writes it to a
 * handful of transforms. Nothing else runs per frame.
 *
 * That easing is also the site's smooth scroll. There is no second
 * interpolator to fight, and jumping the scrollbar (which is what the
 * plan does when you click a room) reads as a glide for free, because
 * the lerp still has to cover the distance.
 *
 * Per-frame work is deliberately kept to `element.style.transform` on
 * elements the engine has already collected. It never writes a custom
 * property, because a variable set on a room recalculates styles for
 * everything inside it; discrete state changes go through React and
 * land as an attribute instead.
 */

/**
 * How much of the gap to close each frame. Lower is heavier.
 *
 * This one number is both the wheel's smoothing and the duration of a
 * jump from the plan, so it is tuned against the longer of the two: at
 * 0.085 crossing the whole building took about two seconds, which reads
 * as the page being slow rather than the walk being long.
 */
const EASE = 0.1;
/** Below this, snap — a lerp never actually arrives. */
const EPSILON = 0.4;

export type TravelHandle = {
  /** Scroll position, in px, that centres a given panel. */
  offsetOf: (index: number) => number;
  goTo: (index: number) => void;
  /** Scroll at which the gate is shut, and at which it is fully open. */
  gateShut: () => number;
  gateOpened: () => number;
};

/* ------------------------------------------------------------------ *
 * Walking through a panel
 *
 * Some panels do something as you pass through them rather than when
 * they become current — the gate's two leaves swing apart, and its sign
 * fades as they go. Tying that to the room index is the obvious thing
 * and it is wrong: the index only flips once the *next* panel reaches
 * the middle of the screen, by which point you have already walked past
 * a shut door and the swing happens behind you.
 *
 * So it is driven by a continuous 0→1 of how far into the panel you
 * are. The two helpers below are shared by both modes, because the
 * sideways walk and the stacked plan measure that from different axes
 * but must produce the same result.
 * ------------------------------------------------------------------ */

/**
 * How far you have walked into a panel.
 *
 * `over` finishes the movement before the panel has fully left, so the
 * doors are open in time for you to see through them rather than
 * completing just as the view clears.
 */
export function passProgress(offset: number, span: number, over = 0.55) {
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, offset / (span * over)));
}

/**
 * Writes one panel's pass progress, split into the beats that make up
 * arriving at a building: the sign clears, the doors swing, you step
 * through.
 *
 * The four numbers land as custom properties on the panel itself, and
 * everything inside reads them in plain CSS. That is a deliberate
 * exception to this file's no-variables rule: the rule exists because a
 * variable on a container recalculates styles for every descendant, and
 * the panel this runs on holds about a dozen elements. Paying that to
 * keep the whole opening sequence's timing in one readable place — and
 * its expression in the component that owns it — is the right trade.
 */
export function applyPass(panel: HTMLElement, p: number) {
  /** Progress across one beat of the sequence. */
  const beat = (from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)));

  const set = (name: string, v: number) => panel.style.setProperty(name, v.toFixed(4));

  set("--pass", p);
  // The sign goes first: it has said its piece before anything moves.
  set("--sign", 1 - beat(0.04, 0.26));
  // Then the leaves, over the longest beat — this is the moment.
  set("--leaf", beat(0.12, 0.52));
  // Then the doorway opens out until the view through it is the whole
  // screen. Strictly after the leaves, because these are a sequence and
  // not a chord: overlapping them was what put two differently cropped
  // copies of the courtyard on screen at the same time.
  set("--step", beat(0.56, 0.86));
  // Only once the room fills the screen does it say anything.
  set("--reveal", beat(0.88, 1));
}

type Options = {
  /** The flex row holding every panel. */
  track: HTMLElement;
  /** The tall element whose height buys the sideways travel. */
  runway: HTMLElement;
  /** Called when the panel under the viewport centre changes. */
  onRoom: (index: number) => void;
  /**
   * Scroll-to-travel ratio. At 1 the page is as tall as the building is
   * wide, which reads as heavy; a little under makes the walk feel like
   * walking rather than dragging.
   */
  pace?: number;
  /**
   * Screens of scroll spent on the first panel before the walk starts.
   *
   * The gate is not somewhere you pass on the way to the courtyard; it
   * is the way into it. So the track holds still while the doors open
   * and the courtyard is revealed behind them, and only then does the
   * building begin to move sideways. Set to 0 for no hold.
   */
  hold?: number;
  /** Called when the gate finishes opening, or closes again. */
  onGate?: (open: boolean) => void;
};

/**
 * Starts the loop. Returns a handle for the plan to steer with, and a
 * teardown. Safe to call only in the browser.
 */
export function startTravel({ track, runway, onRoom, pace = 0.82, hold = 0, onGate }: Options) {
  const panels = Array.from(track.children) as HTMLElement[];

  /**
   * Elements that trail or lead the track to give the walk depth.
   *
   * Each is measured against its own middle, not against the start of
   * the building. Parallax is "how far past me have you walked" — drive
   * it off the absolute track offset instead and a layer three rooms in
   * is already thousands of pixels out of its own frame before you ever
   * reach it.
   */
  const layers: { el: HTMLElement; depth: number; centre: number }[] = Array.from(
    track.querySelectorAll<HTMLElement>("[data-depth]"),
  ).map((el) => ({ el, depth: Number(el.dataset.depth), centre: 0 }));

  /** Panels holding something that opens as you walk through it. */
  const gates: { el: HTMLElement; left: number; width: number }[] = [];

  let distance = 0;
  let maxScroll = 1;
  /** Scroll spent opening the gate before the track moves at all. */
  let holdPx = 0;
  /** Scroll left over for the walk itself. */
  let walkScroll = 1;
  let target = 0;
  let current = 0;
  let room = -1;
  let gateOpen: boolean | null = null;
  let frame = 0;

  /** How far along the building a given scroll position is, in px. */
  const travelFor = (scrollY: number) =>
    Math.min(1, Math.max(0, (scrollY - holdPx) / walkScroll)) * distance;

  const measure = () => {
    distance = Math.max(0, track.scrollWidth - window.innerWidth);
    holdPx = hold * window.innerHeight;
    runway.style.height = `${holdPx + distance * pace + window.innerHeight}px`;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    walkScroll = Math.max(1, maxScroll - holdPx);

    // Layer positions have to be read with the parallax cleared, or each
    // measure folds the last frame's offset into the next baseline.
    for (const layer of layers) layer.el.style.transform = "";
    const trackLeft = track.getBoundingClientRect().left;
    for (const layer of layers) {
      const box = layer.el.getBoundingClientRect();
      // Layout position of the layer's middle within the track.
      layer.centre = box.left - trackLeft + box.width / 2;
    }

    gates.length = 0;
    let run = 0;
    for (const panel of panels) {
      const width = panel.offsetWidth;
      if (panel.hasAttribute("data-pass")) gates.push({ el: panel, left: run, width });
      run += width;
    }

    // Re-place everything at the new scale before the next frame paints.
    target = travelFor(window.scrollY);
    current = target;
    write();
  };


  const write = () => {
    track.style.transform = `translate3d(${-current}px, 0, 0)`;

    const eye = current + window.innerWidth / 2;
    for (const layer of layers) {
      // Zero when the layer is dead centre, growing as you walk past it.
      // Positive depth trails the walk, negative leads it. A room's own
      // content sits at no depth and is carried by the track alone.
      layer.el.style.transform = `translate3d(${(eye - layer.centre) * layer.depth}px, 0, 0)`;
    }

    // The held panel opens on scroll alone, before any of the building
    // has moved; every other opening panel is driven by how far into it
    // you have walked.
    if (holdPx > 0) {
      const p = Math.min(1, Math.max(0, window.scrollY / holdPx));
      applyPass(panels[0], p);
      const open = p >= 0.5;
      if (open !== gateOpen) {
        gateOpen = open;
        onGate?.(open);
      }
    }

    for (const gate of gates) {
      if (holdPx > 0 && gate.el === panels[0]) continue;
      applyPass(gate.el, passProgress(current - gate.left, gate.width));
    }

    // Which panel is under the middle of the screen.
    let acc = 0;
    let index = 0;
    for (let i = 0; i < panels.length; i++) {
      const w = panels[i].offsetWidth;
      if (eye >= acc && eye < acc + w) {
        index = i;
        break;
      }
      acc += w;
      index = i;
    }
    if (index !== room) {
      room = index;
      onRoom(index);
    }
  };

  const tick = () => {
    target = travelFor(window.scrollY);
    const delta = target - current;
    current += Math.abs(delta) < EPSILON ? delta : delta * EASE;
    write();
    frame = requestAnimationFrame(tick);
  };

  measure();
  frame = requestAnimationFrame(tick);

  const onResize = () => measure();
  window.addEventListener("resize", onResize);
  // Late images change scrollWidth, which changes every offset downstream.
  window.addEventListener("load", onResize);

  const handle: TravelHandle = {
    /**
     * Rooms are wider than the screen on purpose, so this centres the
     * panel rather than aligning its left edge. Aligning left is the
     * obvious implementation and it quietly amputates the right-hand
     * third of every wide room.
     */
    offsetOf: (index) => {
      if (distance === 0) return 0;
      let left = 0;
      for (let i = 0; i < index && i < panels.length; i++) left += panels[i].offsetWidth;
      const width = panels[index]?.offsetWidth ?? window.innerWidth;
      const centred = left + width / 2 - window.innerWidth / 2;
      // Past the hold, because the hold buys no sideways movement.
      return holdPx + (Math.min(distance, Math.max(0, centred)) / distance) * walkScroll;
    },
    goTo: (index) => {
      // Jumped, not smooth-scrolled: the loop above is already the
      // easing, and a native smooth scroll on top of it double-eases.
      window.scrollTo({ top: handle.offsetOf(index), behavior: "instant" as ScrollBehavior });
    },
    gateShut: () => 0,
    gateOpened: () => holdPx,
  };

  return {
    handle,
    stop: () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      track.style.transform = "";
      runway.style.height = "";
      for (const layer of layers) layer.el.style.transform = "";
      for (const gate of gates) applyPass(gate.el, 0);
      if (panels[0]) applyPass(panels[0], 0);
    },
  };
}

/**
 * True when the sideways walk is the right thing to render.
 *
 * Below `lg` a pinned horizontal track fights the browser's own touch
 * scrolling, and under reduced motion the walk is the part to drop. Both
 * fall back to the same vertical plan, so there is one alternate layout
 * to maintain rather than two.
 *
 * Starts `false` so the server and the first client paint agree; the
 * vertical plan is the safe thing to show for one frame.
 */
export function useWalkable() {
  const [walkable, setWalkable] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setWalkable(wide.matches && !still.matches);

    sync();
    wide.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  return walkable;
}
