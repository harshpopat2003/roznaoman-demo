import { asset } from "@/lib/asset";
import { gate } from "@/lib/rooms";

/**
 * The gate — an overlay, not a room of its own.
 *
 * Rozna's entrance is two carved teak leaves set into a mud-brick wall,
 * so that is what the site opens on: the gate standing shut, and then
 * only its doors moving.
 *
 * The leaves are cut out of the same photograph as the wall around them.
 * An earlier version composited a close-up of the doors into the
 * opening, and it read as exactly what it was — a second picture, at a
 * different scale and a different time of day, pasted on. Here each leaf
 * is a window onto its own half of the one frame, so at rest the two
 * halves reassemble it exactly and what swings away is the actual pixels
 * of the actual door.
 *
 * It sits *inside* the courtyard's panel rather than beside it, and the
 * track holds still while it plays (see `hold` in lib/travel.ts). That is
 * the point: the courtyard does not slide in from the right, it is
 * already behind the doors and is uncovered as they open. Walking
 * sideways through the building only starts once you are inside it.
 *
 * The sequence is four beats, written on the panel each frame by the
 * travel engine as custom properties, and it is strictly a sequence:
 *
 *   --sign    the standfirst clears before anything moves
 *   --leaf    the leaves swing back on their hinges
 *   --step    the doorway opens out until it *is* the screen
 *   --reveal  and only then does the room say anything
 *
 * ## Why the doorway grows instead of the wall zooming
 *
 * The earlier version scaled the whole wall towards you and cross-faded
 * to the courtyard behind it. That put two differently-cropped copies of
 * the same photograph on screen at once, ghosting against each other.
 *
 * Now nothing scales. The doorway is a *window*: its frame grows from
 * the door's rectangle to the whole viewport, while the courtyard inside
 * it is pinned to viewport coordinates and never moves at all. Opening
 * the window shows more of a picture that was always exactly where it
 * ends up — so there is nothing to ghost, and when the frame reaches the
 * edges it is already pixel-for-pixel the courtyard's own backdrop. The
 * handover is invisible because there is no handover.
 *
 * That pinning is also why the wall must not scale: the courtyard's
 * offset is measured against the plate's static position, and a moving
 * plate would drag it out of register.
 *
 * ## Two photographs
 *
 * Which frame this is depends on the screen, and the numbers behind it
 * live in `.gate` in globals.css — see the note there. The markup only
 * has to switch the file, which `<picture>` does without downloading
 * both. That is also why these are plain `<img>`: at 100vw with a
 * `<source>` per breakpoint there is nothing left for next/image to
 * decide, and it cannot express art direction anyway.
 */

/**
 * How far the courtyard overhangs the screen, matching `Courtyard`'s own
 * backdrop exactly — it bleeds 5vw a side there to leave the parallax
 * some slack, so it has to bleed the same here or the two would not be
 * the same picture at the moment they change places.
 */
const BLEED = 5;

/** Wide shot on a phone, the doors close up on a desktop. */
function GateFrame({ alt = "", priority = false }: { alt?: string; priority?: boolean }) {
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={asset("/assets/gate-front.jpg")} />
      <img
        src={asset("/assets/gate-fort.jpg")}
        alt={alt}
        // eslint-disable-next-line @next/next/no-img-element
        fetchPriority={priority ? "high" : undefined}
        className="absolute inset-0 size-full object-cover"
      />
    </picture>
  );
}

export default function Gate({ vertical }: { vertical: boolean }) {
  return (
    <div
      aria-label="The gate at Rozna"
      className="gate pointer-events-none absolute inset-0 z-20 overflow-hidden"
      style={{
        /* Held at full strength until the window has finished opening,
           then cleared over the reveal. By then the window is showing
           the courtyard's own backdrop at the same size in the same
           place, so there is nothing to see change. */
        opacity: "calc(1 - var(--reveal, 0) * 1.6)",
      }}
    >
      {/* Night behind the gate, in case a screen is shaped so oddly that
          the plate cannot cover it. */}
      <div className="absolute inset-0 bg-night" />

      <div
        className="absolute"
        style={{
          left: "var(--plate-l)",
          top: "var(--plate-t)",
          width: "var(--plate-w)",
          height: "var(--plate-h)",
        }}
      >
        {/* --- the wall --------------------------------------------- */}
        <GateFrame alt="The gate at Rozna: carved teak doors set into the fort wall" priority />
        {/* Dusk over the wall, so the type has something to sit on and
            the lit doorway is the brightest thing on screen. */}
        <div className="absolute inset-0 bg-night/40" />

        {/* --- the doorway, which becomes the room ------------------- */}
        <div
          className="absolute overflow-hidden bg-night will-change-[width,height]"
          style={{
            left: "var(--win-l)",
            top: "var(--win-t)",
            width: "var(--win-w)",
            height: "var(--win-h)",
            perspective: "1100px",
          }}
        >
          {/* Pinned to the viewport, not to the window. This is the whole
              trick: the frame moves, the picture never does. */}
          <div
            className="absolute"
            style={{
              left: `calc(-1 * (var(--plate-l) + var(--win-l)) - ${BLEED}vw)`,
              top: "calc(-1 * (var(--plate-t) + var(--win-t)))",
              width: `${100 + BLEED * 2}vw`,
              height: "100svh",
            }}
          >
            <img
              src={asset("/assets/courtyard-people.jpg")}
              alt=""
              className="absolute inset-0 size-full object-cover object-[62%_52%]"
            />
          </div>

          {/* Dark inside a shut door, lit once there is a gap. Both are
              gone by the time the window starts opening, so neither ever
              dims the room it is about to become. */}
          <div
            className="absolute inset-0 bg-night"
            style={{ opacity: "calc((0.88 - var(--leaf, 0) * 0.78) * (1 - var(--step, 0)))" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 80% at 50% 100%, rgba(232,132,63,0.5), transparent 74%)",
              opacity: "calc(var(--leaf, 0) * (1 - var(--step, 0)))",
            }}
          />
        </div>

        {/* --- the leaves, hinged on their jambs --------------------- */}
        {(["l", "r"] as const).map((side) => (
          <div
            key={side}
            className={`gate-leaf gate-leaf-${side} backface-hidden absolute inset-y-0 overflow-hidden`}
            style={{
              top: "calc(var(--door-t-pc) * 100%)",
              height: "calc((var(--door-b-pc) - var(--door-t-pc)) * 100%)",
              transform: `rotateY(calc(var(--leaf, 0) * ${side === "l" ? "-86deg" : "86deg"}))`,
              // Gone once the window opens out past them.
              opacity: "calc(1 - var(--step, 0) * 2.4)",
            }}
          >
            <div className="gate-leaf-img absolute">
              <GateFrame />
            </div>
            {/* the wall's own dusk, carried onto the leaf so it does not
                brighten as it swings out of the picture */}
            <div className="absolute inset-0 bg-night/40" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  side === "l"
                    ? "linear-gradient(90deg, rgba(11,9,8,0.55), rgba(11,9,8,0) 80%)"
                    : "linear-gradient(270deg, rgba(11,9,8,0.55), rgba(11,9,8,0) 80%)",
                opacity: "var(--leaf, 0)",
              }}
            />
          </div>
        ))}
      </div>

      {/* --- the sign, over the plain wall -------------------------- */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col items-center px-6 pt-[14vh] text-center sm:pt-[16vh]"
        style={{ opacity: "var(--sign, 1)" }}
      >
        <span className="font-arabic text-lg text-brass sm:text-xl">{gate.arabicWelcome}</span>
        <h1 className="t-name mt-3 text-paper drop-shadow-[0_10px_36px_rgba(11,9,8,0.95)]">
          {gate.title}
        </h1>
        <p className="t-lead mt-5 max-w-[20ch] font-display italic text-paper/85 drop-shadow-[0_6px_20px_rgba(11,9,8,0.9)]">
          {gate.standfirst}
        </p>
      </div>

      <span
        className="label absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-paper/55"
        style={{ opacity: "var(--sign, 1)" }}
      >
        Scroll to open the door {vertical ? "↓" : "→"}
      </span>
    </div>
  );
}
