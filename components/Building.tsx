"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Plan from "@/components/Plan";
import Threshold from "@/components/Threshold";
import type { RoomProps, RoomState } from "@/components/Room";
import Arcade from "@/components/rooms/Arcade";
import Courtyard from "@/components/rooms/Courtyard";
import Exit from "@/components/rooms/Exit";
import Kitchen from "@/components/rooms/Kitchen";
import Sabla from "@/components/rooms/Sabla";
import School from "@/components/rooms/School";
import Table from "@/components/rooms/Table";
import { brand, plan, thresholds } from "@/lib/rooms";
import { applyPass, passProgress, startTravel, useWalkable, type TravelHandle } from "@/lib/travel";

/**
 * One entry per panel, in walking order.
 *
 * There are eight rooms on the plan but only seven panels: the gate and
 * the courtyard share one, because the gate is an overlay on the
 * courtyard rather than a room you walk to. Everything downstream reads
 * the maps below rather than assuming the two lists line up.
 */
const ROOMS: ((p: RoomProps) => React.ReactNode)[] = [
  Courtyard,
  Table,
  Arcade,
  Sabla,
  Kitchen,
  School,
  Exit,
];

/**
 * The panel order, and the maps between it and the room order.
 *
 * Rooms and doorways used to alternate strictly, so a panel index could
 * be halved to get a room index. They no longer do — the gate opens
 * straight into the courtyard with no doorway between them — and that
 * arithmetic would now point the plan at the wrong arch for the rest of
 * the building. These are built from the same data the panels are, so
 * adding or removing a doorway cannot desynchronise them again.
 *
 * A doorway is credited to the room it leads *into*, because the room it
 * leads into is what you can see through its arch.
 */
const PANEL_ROOM: number[] = [];
const ROOM_PANEL: number[] = [];
// The gate has no panel of its own; it lives on the courtyard's.
ROOM_PANEL[0] = 0;
plan.slice(1).forEach((room, offset) => {
  const roomIndex = offset + 1;
  ROOM_PANEL[roomIndex] = PANEL_ROOM.length;
  PANEL_ROOM.push(roomIndex);
  if (thresholds.some((t) => t.after === room.id)) {
    PANEL_ROOM.push(Math.min(plan.length - 1, roomIndex + 1));
  }
});

/**
 * The building.
 *
 * Rooms and doorways are interleaved into one row. On a wide screen with
 * motion allowed, that row is translated sideways by the travel engine
 * and the page's height is only there to buy the distance — vertical
 * input, horizontal movement, which is the whole conceit. Anywhere else
 * the same row stacks and is read normally.
 *
 * Both modes share one state model: whichever room is under the middle
 * of the screen is `here`, and everything a room does on arrival hangs
 * off that in CSS. The two modes only differ in what computes it —
 * the track's offset in one, the document's scroll in the other.
 *
 * The panel index the engine reports counts doorways as well as rooms,
 * so it is halved back to a room index before anything downstream sees
 * it. Getting that wrong makes the plan point at the wrong arch for
 * exactly half the walk, which is the sort of bug that looks like a
 * design decision.
 */
export default function Building() {
  const runway = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const travel = useRef<TravelHandle | null>(null);
  const walkable = useWalkable();
  const [room, setRoom] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  const toRoom = (panel: number) => PANEL_ROOM[panel] ?? plan.length - 1;

  /** Shut, you are at the gate; open, you are in the courtyard. */
  const [gateOpen, setGateOpen] = useState(false);

  /**
   * The room the plan should light. While the doors are shut you are at
   * the gate even though the panel under you is the courtyard's.
   */
  const here = gateOpen ? Math.max(1, room) : 0;

  // --- the sideways walk -------------------------------------------
  useEffect(() => {
    if (!walkable || !track.current || !runway.current) return;

    const { handle, stop } = startTravel({
      track: track.current,
      runway: runway.current,
      // A screen and a half of scroll to open the doors. Shorter and the
      // sequence is over before it registers; longer and it reads as the
      // page having stopped responding.
      hold: 1.5,
      onGate: setGateOpen,
      onRoom: (panel) => setRoom(toRoom(panel)),
    });
    travel.current = handle;

    return () => {
      travel.current = null;
      stop();
    };
  }, [walkable]);

  // --- the stacked plan --------------------------------------------
  // Same state model, different driver: whichever room straddles the
  // middle of the viewport is the one you are standing in.
  useEffect(() => {
    if (walkable) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let next = 1;
      let open = true;

      // Room 0 has no block of its own — the gate is an overlay on the
      // courtyard — so the walk down the page starts at room 1.
      plan.slice(1).forEach((r, offset) => {
        const el = document.getElementById(r.id);
        if (!el) return;
        const box = el.getBoundingClientRect();
        if (box.top <= middle && box.bottom > middle) next = offset + 1;

        // The same continuous pass as the sideways walk, measured down
        // the page instead of across it.
        if (el.hasAttribute("data-pass")) {
          const p = passProgress(-box.top, box.height);
          applyPass(el, p);
          open = p >= 0.5;
        }
      });

      setGateOpen((prev) => (prev === open ? prev : open));
      setRoom((prev) => (prev === next ? prev : next));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [walkable]);

  const goTo = useCallback((index: number) => {
    const t = travel.current;
    if (!t) {
      document.getElementById(plan[Math.max(1, index)].id)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    // The gate and the courtyard are the same panel at two moments in the
    // hold, so they are the two ends of it rather than two offsets.
    if (index === 0) window.scrollTo({ top: t.gateShut(), behavior: "instant" as ScrollBehavior });
    else if (index === 1) window.scrollTo({ top: t.gateOpened(), behavior: "instant" as ScrollBehavior });
    else t.goTo(ROOM_PANEL[index]);
  }, []);

  // Arrow keys walk the building. On a site whose whole navigation is a
  // row of eight arches, a keyboard user otherwise has to tab into the
  // plan and hunt; and left/right is what the page is already doing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const step =
        e.key === "ArrowRight" || e.key === "ArrowDown"
          ? 1
          : e.key === "ArrowLeft" || e.key === "ArrowUp"
            ? -1
            : 0;

      if (step) {
        const next = Math.min(plan.length - 1, Math.max(0, here + step));
        if (next === here) return;
        e.preventDefault();
        goTo(next);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(plan.length - 1);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [here, goTo]);

  /**
   * Panel state, which is indexed by room but has to treat the gate and
   * the courtyard as one place — otherwise standing at the gate leaves
   * the courtyard marked "ahead" and its content never comes up behind
   * the doors.
   */
  const stateOf = (i: number): RoomState => {
    const at = Math.max(1, here);
    return i === at ? "here" : i < at ? "past" : "ahead";
  };

  /**
   * The survey is drawn over whatever room you are standing in, so it has
   * to change ink when the walk arrives in a pale one. `mix-blend-mode`
   * would do this automatically, but it also inverts the ember fill on
   * the plan — and the one thing the plan must get right is which arch is
   * lit.
   */
  const onPaper = plan[here].tone === "light";
  const survey = onPaper ? "text-ink" : "text-paper";

  const panels = ROOMS.flatMap((RoomComponent, offset) => {
    const i = offset + 1;
    const door = thresholds.find((t) => t.after === plan[i].id);
    return [
      <RoomComponent
        key={plan[i].id}
        state={stateOf(i)}
        vertical={!walkable}
        reduced={reduced}
      />,
      door ? (
        <Threshold key={`door-${i}`} line={door.line} through={door.through} vertical={!walkable} />
      ) : null,
    ];
  }).filter(Boolean);

  return (
    <>
      {/* --- the survey, always on top ------------------------------ */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
        {/* Every room behind this is a photograph, and two of them are
            pale. A scrim is what keeps one header legible over all of
            them without the mark having to grow a text-shadow. */}
        <div
          aria-hidden
          className={`absolute inset-x-0 top-0 h-24 transition-opacity duration-500 ${
            onPaper
              ? "bg-gradient-to-b from-paper via-paper/70 to-transparent"
              : "bg-gradient-to-b from-night/85 via-night/45 to-transparent"
          }`}
        />

        <div
          className={`relative flex items-start justify-between gap-4 px-5 py-3.5 transition-colors duration-500 sm:px-8 ${survey}`}
        >
          <a
            href={`#${plan[0].id}`}
            onClick={(e) => {
              e.preventDefault();
              goTo(0);
            }}
            className="pointer-events-auto flex items-center gap-2.5"
          >
            <svg viewBox="0 0 20 26" className="h-5 w-auto sm:h-6" aria-hidden>
              <path
                d="M1,25 L1,12 C1,6 5,2 10,1 C15,2 19,6 19,12 L19,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            <span className="font-display text-base tracking-[0.3em] sm:text-lg">ROZNA</span>
          </a>

          {/* One plan, two densities. Below md it loses the numbers and
              the room name and sits on the same row as the mark, because
              a second full-width row of chrome on a phone is a third of
              the first screen spent on navigation. */}
          <div className="pointer-events-auto md:hidden">
            <Plan active={here} onPick={goTo} compact />
          </div>
          <div className="pointer-events-auto hidden md:block">
            <Plan active={here} onPick={goTo} />
          </div>

          <a
            href={`https://wa.me/${brand.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid pointer-events-auto hidden py-2.5 text-[0.62rem] md:inline-flex"
          >
            Book a table
          </a>
        </div>
      </header>

      {/* --- the phone's booking bar -------------------------------- */}
      {/* Held at the bottom of the screen from the courtyard onward: on a
          phone the header has no room for a button, and a restaurant that
          is usually full should never be more than one tap from a table.
          It stays out of the way in room 00, where the visitor has not
          been given a reason yet. */}
      <a
        href={`https://wa.me/${brand.whatsapp}`}
        target="_blank"
        rel="noreferrer"
        aria-hidden={here === 0}
        tabIndex={here === 0 ? -1 : undefined}
        className="btn btn-solid fixed inset-x-4 bottom-4 z-50 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] md:hidden"
        style={{
          transform: here === 0 ? "translateY(calc(100% + 1.5rem))" : "translateY(0)",
          opacity: here === 0 ? 0 : 1,
          transition: reduced
            ? "opacity 200ms ease"
            : "transform 420ms var(--ease-out), opacity 260ms ease",
          marginBottom: "env(safe-area-inset-bottom)",
        }}
      >
        Book a table on WhatsApp
      </a>

      {walkable ? (
        <div ref={runway} className="relative">
          {/* The stage holds still while the row inside it is moved. */}
          <div className="sticky top-0 h-svh overflow-hidden">
            <div ref={track} className="flex h-full w-max will-travel">
              {panels}
            </div>
          </div>
        </div>
      ) : (
        <div>{panels}</div>
      )}
    </>
  );
}
