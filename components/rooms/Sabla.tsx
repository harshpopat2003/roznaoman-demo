import Image from "next/image";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { plan, sabla } from "@/lib/rooms";

/**
 * Room 04 — Al Sabla.
 *
 * The great hall is the biggest room in the building, so it is the
 * widest panel on the site and the only one where the photograph is
 * allowed to run the full height uninterrupted. The number that matters
 * — six hundred — is set at display size rather than counted up: a
 * counter is a landing-page tic, and this is a fact carved on a wall.
 *
 * Two smaller frames sit in front of the main one at different depths,
 * which is how you get scale into a photograph of an empty hall.
 */
export default function Sabla({ state, vertical }: RoomProps) {
  return (
    <Room id={plan[4].id} state={state} vertical={vertical} width={118} className="grain bg-night">
      <div data-depth={vertical ? undefined : "-0.05"} className="absolute -inset-x-[9%] inset-y-0">
        <Image
          src={sabla.images[0]}
          alt="Al Sabla, the great hall at Rozna, laid for a banquet"
          fill
          sizes="130vw"
          className="object-cover object-[50%_40%]"
        />
      </div>
      {/* The hall is the palest photograph in the building and all of
          this room's type sits on the left of it, so the shade is laid
          the same way round rather than bottom-up. */}
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-night/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/45 to-transparent" />

      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full justify-between px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="max-w-2xl">
          <Marker n={plan[4].n} name={plan[4].name} note={sabla.plaque} />
          <h2 data-enter="1" className="t-name mt-7 text-paper">
            {sabla.title}
          </h2>
          <p data-enter="2" className="t-lead mt-5 max-w-[20ch] font-display italic text-brass">
            {sabla.lead}
          </p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-8 lg:gap-10">
          <div data-enter="3" className="max-w-md">
            <p className="text-sm leading-relaxed text-paper/70">{sabla.body}</p>
            <dl className="mt-7 flex flex-col gap-3.5 border-t border-paper/15 pt-6">
              {sabla.specs.map((s) => (
                <div key={s.k} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3">
                  <dt className="label text-brass">{s.k}</dt>
                  <dd className="text-sm text-paper/75">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The two frames that give the hall its scale. They matter
              more on a phone, not less — there the main photograph is a
              letterbox of white chair covers with nothing to read it
              against. */}
          <div className="flex w-full items-end gap-4 lg:w-auto lg:gap-5">
            {sabla.images.slice(1).map((src, i) => (
              <div
                key={src}
                data-depth={String(0.05 + i * 0.045)}
                className={i === 0 ? "flex-1 lg:w-[15rem] lg:flex-none" : "flex-1 pb-6 lg:w-[12rem] lg:flex-none lg:pb-10"}
              >
                <div data-enter="4" className="relative aspect-[3/4] overflow-hidden border border-paper/15">
                  <Image src={src} alt="" fill sizes="(max-width: 1024px) 45vw, 240px" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Room>
  );
}
