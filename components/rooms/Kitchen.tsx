import Image from "next/image";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { asset } from "@/lib/asset";
import { kitchen, methods, plan } from "@/lib/rooms";

/**
 * Room 05 — the kitchen.
 *
 * Three fires, presented as three alcoves cut into a dark wall. The
 * alcoves use the same arch as the doorways between rooms, which is the
 * point: the shape that gets you from room to room is the shape the
 * building repeats, right down to a recess in a kitchen wall.
 *
 * Each alcove has a light inside it that comes up on hover — the only
 * hover effect in the building. Tailwind v4 already scopes `hover:` to
 * `@media (hover: hover)`, so a tap on a phone cannot leave an alcove
 * stuck alight.
 */
export default function Kitchen({ state, vertical }: RoomProps) {
  return (
    <Room id={plan[5].id} state={state} vertical={vertical} width={112} className="grain bg-ink">
      <div className="absolute inset-0">
        <Image src={asset("/assets/dish-mandi.jpg")} alt="" fill sizes="120vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-night via-ink/95 to-night" />
      </div>

      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full justify-center px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="max-w-2xl">
          <Marker n={plan[5].n} name={plan[5].name} note={kitchen.plaque} />
          <h2 data-enter="1" className="t-room mt-7 text-paper">
            {kitchen.title}
          </h2>
          <p data-enter="2" className="mt-5 max-w-lg text-sm leading-relaxed text-paper/60">
            {kitchen.body}
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3 lg:gap-12">
          {methods.map((m, i) => (
            <article key={m.n} data-enter={String(Math.min(5, i + 3))} className="group">
              <div className="arch relative aspect-[4/5] w-full overflow-hidden bg-night">
                <Image
                  src={m.img}
                  alt={m.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 30vw"
                  className="object-cover brightness-[0.62] transition-[filter] duration-300 ease-out group-hover:brightness-[0.92]"
                />
                {/* the fire in the alcove */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(60% 45% at 50% 100%, rgba(232,132,63,0.55), transparent 70%)",
                  }}
                />
                <span className="label absolute left-4 top-4 text-brass">{m.n}</span>
              </div>

              <h3 className="mt-5 font-display text-2xl text-paper">{m.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-paper/55">{m.body}</p>
            </article>
          ))}
        </div>
      </div>

    </Room>
  );
}
