"use client";

import { plan } from "@/lib/rooms";

/**
 * The plan, which is also the navigation.
 *
 * There is no menu bar on this site. The header carries the building's
 * floor plan instead — one arch per room, drawn in the survey register,
 * with the one you are standing in filled. Clicking an arch walks you
 * there.
 *
 * It doubles as the progress indicator, so the page never needs the
 * usual hairline at the top of the window: where you are and how far
 * through you are is one fact, told once.
 *
 * The fill is a plain colour transition and nothing else. This element
 * changes state on almost every scroll gesture, which is the frequency
 * tier where motion stops being feedback and becomes noise.
 *
 * `compact` is the phone build: arches only, no numbers and no name.
 * Eight numbers at 10px is not a floor plan, it is a row of grit.
 */
export default function Plan({
  active,
  onPick,
  compact = false,
}: {
  active: number;
  onPick?: (index: number) => void;
  compact?: boolean;
}) {
  return (
    <nav aria-label="Rooms" className={`flex items-end ${compact ? "gap-2" : "gap-1.5 sm:gap-2.5"}`}>
      {plan.map((room, i) => {
        const here = i === active;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onPick?.(i)}
            aria-current={here ? "true" : undefined}
            className={`group relative flex flex-col items-center ${
              compact ? "px-0.5 py-1" : "gap-1.5 px-0.5 pt-1"
            }`}
            title={`${room.n} — ${room.name}`}
          >
            <svg viewBox="0 0 20 26" className={compact ? "h-4 w-auto" : "h-5 w-auto sm:h-6"} aria-hidden>
              <path
                d="M1,25 L1,12 C1,6 5,2 10,1 C15,2 19,6 19,12 L19,25 Z"
                fill={here ? "var(--color-ember)" : "transparent"}
                stroke="currentColor"
                strokeOpacity={here ? 0 : 0.4}
                strokeWidth="1.4"
                style={{ transition: "fill 200ms ease, stroke-opacity 200ms ease" }}
              />
            </svg>

            {!compact && (
              <>
                <span
                  className="label text-[0.5rem] tabular-nums transition-opacity duration-200"
                  style={{ opacity: here ? 1 : 0.4 }}
                >
                  {room.n}
                </span>

                {/* The name is spelled out only for the room you are in —
                    eight labels at once is a legend, not a plan. */}
                <span
                  aria-hidden
                  className="label pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.55rem] text-ember transition-opacity duration-200 group-hover:opacity-100"
                  style={{ opacity: here ? 1 : 0 }}
                >
                  {room.name}
                </span>
              </>
            )}
          </button>
        );
      })}
    </nav>
  );
}
