import Image from "next/image";
import Room, { Marker, type RoomProps } from "@/components/Room";
import { asset } from "@/lib/asset";
import { brand, exitRoom, plan } from "@/lib/rooms";

/**
 * Room 07 — the way out.
 *
 * The same doors you came through, shut again, seen from the inside.
 * Everything a visitor actually needs is on the plaque beside them,
 * because this is where a person who has walked the whole building
 * decides whether to book — and Rozna is genuinely usually full, so the
 * WhatsApp line is a live link, not a line of text.
 *
 * It is also the footer. A separate footer strip after this would be a
 * second ending; the building only has one way out.
 */
export default function Exit({ state, vertical }: RoomProps) {
  return (
    <Room id={plan[7].id} state={state} vertical={vertical} width={104} className="grain bg-night">
      <div data-depth={vertical ? undefined : "-0.03"} className="absolute -inset-x-[6%] inset-y-0">
        <Image
          src={asset("/assets/exterior-night.jpg")}
          alt="Rozna from the outside, lit at night"
          fill
          sizes="120vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-night/82" />

      <div className="relative mx-auto flex w-screen max-w-[100vw] min-h-svh flex-col h-full justify-between px-6 pb-28 pt-36 sm:px-10 md:pb-16 lg:px-16 lg:pt-28">
        <div className="max-w-xl">
          <Marker n={plan[7].n} name={plan[7].name} note={exitRoom.plaque} />
          <h2 data-enter="1" className="t-room mt-7 text-paper">
            {exitRoom.title}
          </h2>
          <p data-enter="2" className="mt-5 max-w-md text-sm leading-relaxed text-paper/65">
            {exitRoom.body}
          </p>

          <div data-enter="3" className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${brand.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-solid"
            >
              Book on WhatsApp
            </a>
            <a href={`mailto:${brand.email}`} className="btn btn-line text-paper">
              Email the team
            </a>
          </div>
        </div>

        {/* the plaque beside the door */}
        <div data-enter="4" className="mt-14 max-w-3xl border-t border-paper/15 pt-8">
          <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
            {exitRoom.details.map((d) => (
              <div key={d.k}>
                <dt className="label text-brass">{d.k}</dt>
                <dd className="mt-1.5 text-sm text-paper/80">
                  {d.k === "WhatsApp" ? (
                    <a
                      href={`https://wa.me/${brand.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors duration-200 hover:text-ember"
                    >
                      {d.v}
                    </a>
                  ) : d.k === "Instagram" ? (
                    <a
                      href={`https://instagram.com/${brand.instagram}`}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors duration-200 hover:text-ember"
                    >
                      {d.v}
                    </a>
                  ) : (
                    d.v
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-paper/10 pt-6">
            <span className="label text-paper/35">
              {brand.name} · {brand.arabic}
            </span>
            <span className="label text-paper/35">
              Demo concept by <b className="font-medium text-paper/60">The Auren Studio</b>
            </span>
          </div>
        </div>
      </div>
    </Room>
  );
}
