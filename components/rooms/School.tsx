import Image from "next/image";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { plan, school } from "@/lib/rooms";

/**
 * Room 06 — the school.
 *
 * The last room before the way out, and the one that explains why the
 * others exist. Three frames hung at three depths on a pale wall — this
 * is the only room lit like a classroom rather than a fort, so the walk
 * arrives somewhere that feels different before it ends.
 */
export default function School({ state, vertical }: RoomProps) {
  return (
    <Room id={plan[6].id} state={state} vertical={vertical} width={112} className="bg-paper text-ink">
      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full justify-center px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div>
            <Marker n={plan[6].n} name={plan[6].name} note={school.plaque} />
            <h2 data-enter="1" className="t-room mt-7 max-w-[16ch]">
              {school.title}
            </h2>
            <p data-enter="2" className="mt-6 max-w-md text-sm leading-relaxed text-ink/65">
              {school.body}
            </p>

            <dl data-enter="3" className="mt-9 flex flex-col gap-3.5 border-t border-ink/15 pt-6">
              {school.courses.map((c) => (
                <div key={c.k} className="grid grid-cols-[5rem_1fr] items-baseline gap-3">
                  <dt className="label text-ember">{c.k}</dt>
                  <dd className="text-sm text-ink/75">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Three frames at three distances down the classroom wall.
              On a phone the row would put them at about 110px each, so
              the first one takes the full width and the other two pair
              underneath it. */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-end lg:gap-6">
            {school.images.map((src, i) => (
              <div
                key={src}
                data-depth={vertical ? undefined : String([0.04, -0.018, 0.028][i])}
                className={`lg:flex-1 ${i === 0 ? "col-span-2 lg:col-span-1" : ""} ${
                  i === 1 ? "lg:pb-12" : i === 2 ? "lg:pb-4" : ""
                }`}
              >
                <div
                  data-enter={String(Math.min(5, i + 2))}
                  className="relative aspect-[3/4] w-full overflow-hidden border border-ink/15 bg-ink/5"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 45vw, 22vw"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Room>
  );
}
