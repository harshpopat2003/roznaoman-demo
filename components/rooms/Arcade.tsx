import Image from "next/image";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { arcade, plan, voices } from "@/lib/rooms";

/**
 * Room 03 — the arcade.
 *
 * What guests say is hung along the wall the way a fort hangs notices:
 * four paper sheets, pinned, each at a slightly different angle and a
 * slightly different distance down the colonnade. The angles are fixed
 * per sheet rather than random, so the wall looks the same on every
 * visit — a wall that reshuffles itself is a carousel wearing a hat.
 *
 * The depths come from the content file and are fed to the travel
 * engine, so walking the arcade slides the near sheets past the far
 * ones. That is the only motion here; the sheets themselves do nothing,
 * because a review you are trying to read should hold still.
 */

/** Fixed per-sheet so the wall is stable between visits. */
const PIN_ANGLES = [-1.6, 1.1, -0.7, 1.8];
const PIN_OFFSETS = ["4%", "22%", "6%", "26%"];

export default function Arcade({ state, vertical }: RoomProps) {
  return (
    <Room id={plan[3].id} state={state} vertical={vertical} width={132} className="grain bg-night">
      <div data-depth={vertical ? undefined : "-0.06"} className="absolute -inset-x-[10%] inset-y-0">
        <Image
          src="/assets/hall-gold.jpg"
          alt="The lamplit arcade running the length of Rozna"
          fill
          sizes="140vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-night/82" />

      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-xl">
            <Marker n={plan[3].n} name={plan[3].name} note={arcade.plaque} />
            <h2 data-enter="1" className="t-room mt-7 text-paper">
              {arcade.title}
            </h2>
          </div>

          {/* the score, drawn rather than badged */}
          <div data-enter="2" className="flex items-end gap-5">
            <span className="font-display text-[clamp(3.5rem,7vw,6rem)] leading-none text-brass">
              {arcade.rating}
            </span>
            <span className="max-w-[15rem] pb-2 text-xs leading-relaxed text-paper/45">
              {arcade.ratingNote}
            </span>
          </div>
        </div>

        <div className="mt-12 flex min-h-0 flex-1 items-center">
          <div className="grid w-full gap-6 sm:grid-cols-2 lg:flex lg:items-start lg:gap-8">
            {voices.map((v, i) => (
              /* The depth wrapper owns the transform the engine writes
                 each frame; the sheet's pinned angle lives one level in,
                 or the two would overwrite each other. */
              <div
                key={v.name}
                data-depth={vertical ? undefined : String(v.depth)}
                className="w-full shrink-0 lg:w-[18rem]"
                style={{ marginTop: vertical ? undefined : PIN_OFFSETS[i] }}
              >
                <figure
                  data-enter={String(Math.min(5, i + 1))}
                  className="relative border border-ink/10 bg-paper p-6 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
                  style={{ rotate: `${PIN_ANGLES[i]}deg` }}
                >
                  {/* the pin holding it to the wall */}
                  <span
                    aria-hidden
                    className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brass shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                  />
                  <blockquote className="font-display text-lg leading-snug text-ink/90">
                    “{v.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="label text-ink/70">{v.name}</span>
                    <span className="rule w-5 shrink-0" />
                    <span className="label text-ink/35">{v.source}</span>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Room>
  );
}
