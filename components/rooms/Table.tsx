"use client";

import Image from "next/image";
import { useState } from "react";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { asset } from "@/lib/asset";
import { dishes, plan, table } from "@/lib/rooms";

/**
 * Room 02 — the table.
 *
 * Omani food is not plated for one. It arrives in the pot it cooked in,
 * set down in the middle, and the table reaches in together. A grid of
 * cards cannot say that; a table can. So this room is a real surface in
 * three dimensions with the pots standing on it.
 *
 * How it is built:
 *
 *  - The table top is a plane rotated back on X. Everything placed on it
 *    inherits that rotation, which is what makes the far end of the
 *    table genuinely further away rather than just smaller.
 *  - Each pot is then counter-rotated by the same angle, so it stands
 *    upright on the surface instead of lying flat on it — the standard
 *    way to put an object on a floor in CSS, and the reason the pots
 *    read as objects rather than as texture.
 *  - The shadow under each pot is NOT counter-rotated. It stays in the
 *    plane of the table, which is what actually sells the contact.
 *
 * Picking a pot up is a transition on `transform`, so clicking along the
 * table retargets from wherever the last one had got to instead of
 * restarting. Hover is gated to fine pointers; on a touch screen the
 * first tap would otherwise both hover and select.
 */

/**
 * How far the table is tipped away from the camera.
 *
 * Every degree past about forty-five squeezes the surface harder, and
 * the two rows of pots start to overlap until the whole thing reads as a
 * single row floating in the dark. This is the angle where you can still
 * see the table between them.
 */
const TILT = 42;

/**
 * Where each pot is put down, in percent of the table top. Two rows,
 * offset from each other so the far row shows in the gaps of the near
 * one rather than behind it — which is how a table actually gets laid.
 */
const SEATS = [
  { x: 2, y: 0 },
  { x: 27, y: 6 },
  { x: 51, y: 0 },
  { x: 76, y: 5 },
  { x: 14, y: 62 },
  { x: 39, y: 70 },
  { x: 63, y: 61 },
  { x: 88, y: 68 },
];

export default function Table({ state, vertical, reduced }: RoomProps) {
  const [picked, setPicked] = useState(0);
  /**
   * Hover is tracked in state rather than in CSS because the lift has to
   * compose with the counter-rotation that stands the pot up, and that
   * transform is already computed here. It is set only from a mouse:
   * a touch device fires a hover on tap, which would leave a pot raised
   * with nothing to lower it.
   */
  const [hovered, setHovered] = useState(-1);
  const dish = dishes[picked];

  return (
    <Room
      id={plan[2].id}
      state={state}
      vertical={vertical}
      width={124}
      className="grain bg-ink"
    >
      {/* the room the table is in */}
      <div className="absolute inset-0">
        <Image
          src={asset("/assets/interior-arches.jpg")}
          alt=""
          fill
          sizes="140vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-night via-ink to-night" />
      </div>

      {/* the lamp over the table */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[62%] w-[80%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(232,132,63,0.3), rgba(232,132,63,0.05) 45%, transparent 74%)",
        }}
      />

      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-lg">
            <Marker n={plan[2].n} name={plan[2].name} note={table.plaque} />
            <h2 data-enter="1" className="t-room mt-7 text-paper">
              {table.title}
            </h2>
          </div>
          <p data-enter="2" className="max-w-xs text-sm leading-relaxed text-paper/55">
            {table.body}
          </p>
        </div>

        {/* --- the surface, pointer-and-space only ------------------- */}
        <div
          data-enter="3"
          className="relative mt-8 hidden min-h-0 flex-1 items-center justify-center lg:flex"
          style={{ perspective: "1500px", perspectiveOrigin: "50% 26%" }}
        >
          <div
            className="preserve-3d relative h-[96%] w-[86%]"
            style={{ transform: `rotateX(${TILT}deg)` }}
          >
            {/* the table top itself */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[3px]"
              style={{
                background:
                  "linear-gradient(180deg, #7a5738 0%, #5c381f 42%, #35200f 78%, #1d1008 100%)",
                boxShadow: "0 0 140px 50px rgba(0,0,0,0.6)",
              }}
            />
            {/* the woven runner down the middle of it */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-1/2 w-[26%] -translate-x-1/2 opacity-70"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(200,85,42,0.5) 0 6px, rgba(168,132,60,0.35) 6px 10px, rgba(11,9,8,0.5) 10px 18px)",
              }}
            />

            {dishes.map((d, i) => {
              const seat = SEATS[i];
              const here = i === picked;
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => setPicked(i)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(i)}
                  onPointerLeave={() => setHovered((h) => (h === i ? -1 : h))}
                  aria-label={`Show ${d.name}`}
                  aria-current={here}
                  className="group preserve-3d absolute"
                  style={{ left: `${seat.x}%`, top: `${seat.y}%`, width: "15%" }}
                >
                  {/* stays in the plane of the table — this is the contact */}
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -z-10 block h-[86%] w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-night blur-md"
                    style={{
                      // The shadow tightens as the pot comes up, which is
                      // the only cue that it left the table at all.
                      opacity: here ? 0.9 : hovered === i ? 0.78 : 0.6,
                      transition: "opacity 220ms ease",
                    }}
                  />

                  {/* stands up off the table */}
                  <span
                    className="block origin-bottom"
                    style={{
                      // Picked lifts furthest; hover only hints at it, so
                      // running the cursor along the table does not read
                      // as eight things being selected.
                      transform: `rotateX(${-TILT}deg) translateY(${
                        here ? -16 : hovered === i ? -7 : 0
                      }px) scale(${here ? 1.1 : hovered === i ? 1.04 : 1})`,
                      transition: reduced
                        ? "none"
                        : "transform 320ms var(--ease-out), filter 220ms ease",
                      filter: here ? "brightness(1)" : hovered === i ? "brightness(0.88)" : "brightness(0.7)",
                    }}
                  >
                    <span className="relative block aspect-square w-full overflow-hidden rounded-full">
                      <Image src={d.img} alt={d.name} fill sizes="220px" className="object-cover" />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* the card for whatever has been picked up */}
        <div className="mt-8 hidden items-end justify-between gap-10 lg:flex">
          <div className="max-w-md">
            <div className="flex items-baseline gap-4">
              <h3 className="font-display text-3xl text-paper">{dish.name}</h3>
              <span className="font-arabic text-lg text-brass">{dish.arabic}</span>
            </div>
            <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-paper/60">{dish.body}</p>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <span className="label text-brass">{dish.tag}</span>
            <span className="rule w-16" />
            <span className="label tabular-nums text-paper/40">
              {String(picked + 1).padStart(2, "0")} / {String(dishes.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <p className="label mt-6 hidden text-paper/30 lg:block">{table.note}</p>

        {/* --- touch: the same table, read as a list ---------------- */}
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:hidden">
          {dishes.map((d) => (
            <figure key={d.name}>
              <div className="relative aspect-square w-full overflow-hidden rounded-full">
                <Image src={d.img} alt={d.name} fill sizes="44vw" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <span className="block font-display text-xl text-paper">{d.name}</span>
                <span className="mt-0.5 block font-arabic text-sm text-brass">{d.arabic}</span>
                <span className="label mt-2 block text-paper/35">{d.tag}</span>
              </figcaption>
            </figure>
          ))}
          <p className="label col-span-2 mt-2 text-paper/30">{table.note}</p>
        </div>
      </div>
    </Room>
  );
}
