import Image from "next/image";
import Gate from "@/components/Gate";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { asset } from "@/lib/asset";
import { courtyard, plan } from "@/lib/rooms";

/**
 * Room 01 — the courtyard, and the gate that opens onto it.
 *
 * These two share a panel, which is the whole reason the opening works:
 * the courtyard is behind the doors from the first frame, so opening
 * them reveals *this room* rather than a stand-in that gets swapped for
 * the real thing a scroll later. There is no doorway panel between the
 * gate and here either; the carved leaves are that doorway.
 *
 * The backdrop below and the picture inside the gate's opening doorway
 * are deliberately the same image at the same size in the same place —
 * see the note in Gate.tsx. Anything that made this one distinct, a
 * scale or a different crop, would show up as ghosting at the moment the
 * two change places, which is exactly what it did.
 *
 * Nothing here says anything until `--reveal`, the last of the four
 * beats. The room fills the screen first and speaks second; the scrim
 * arrives with the words because it exists for them, and dropping it
 * over a photograph that had just finished arriving would read as the
 * lights going down.
 *
 * The card is actual paper — opaque, cream, hairline-ruled — not a
 * translucent panel. A frosted sheet over a photograph is the house
 * style of every SaaS landing page built since 2020, and it also fails
 * the only job this card has, which is being readable over a bright
 * wall.
 */
export default function Courtyard({ state, vertical }: RoomProps) {
  return (
    <Room
      id={plan[1].id}
      state={state}
      vertical={vertical}
      width={100}
      clip={!vertical}
      className="grain bg-night"
      data-pass
      /* Stacked, this block is two and a bit screens tall and its scene
         is pinned inside it, so the doors have room to open on a phone
         without the gate scrolling off while it is still swinging. The
         sideways walk gets the same budget from the engine's `hold`. */
      style={vertical ? { minHeight: "230svh" } : undefined}
    >
      <div className={vertical ? "sticky top-0 h-svh overflow-hidden" : "contents"}>
        <div data-depth={vertical ? undefined : "-0.03"} className="absolute -inset-x-[5%] inset-y-0">
          <Image
            src={asset("/assets/courtyard-people.jpg")}
            alt="The Rozna courtyard at lunch, seen from the ground floor"
            fill
            priority
            sizes="120vw"
            className="object-cover object-[62%_52%]"
          />
        </div>

        {/* Arrives with the words, because it is there for them. */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-night/95 via-night/60 to-night/15"
          style={{ opacity: "var(--reveal, 1)" }}
        />

        <div
          className="relative mx-auto flex h-svh w-screen max-w-[100vw] items-center px-6 pb-28 pt-36 sm:px-10 md:pb-24 lg:h-full lg:min-h-svh lg:px-16 lg:pt-32"
          style={{ opacity: "var(--reveal, 1)" }}
        >
          <div className="w-full max-w-xl">
            <Marker n={plan[1].n} name={plan[1].name} note={courtyard.plaque} />

            <h2 data-enter="1" className="t-room mt-8 text-paper">
              {courtyard.title}
            </h2>

            {/* the paper the survey is written on */}
            <div
              data-enter="2"
              className="mt-10 border border-ink/15 bg-paper p-6 text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] sm:p-8"
            >
              <p className="font-display text-lg italic leading-snug text-ink/90 sm:text-xl">
                {courtyard.quote}
              </p>
              <p className="label mt-4 text-ink/40">— {courtyard.attribution}</p>

              <div className="mt-7 flex flex-col gap-4">
                {courtyard.notes.map((note) => (
                  <div key={note.k} className="grid grid-cols-[6.5rem_1fr] items-baseline gap-3">
                    <span className="label text-ember">{note.k}</span>
                    <span className="text-sm leading-relaxed text-ink/75">{note.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Gate vertical={vertical} />
      </div>
    </Room>
  );
}
