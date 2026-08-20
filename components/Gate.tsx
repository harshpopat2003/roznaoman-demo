import Image from "next/image";
import { gate } from "@/lib/rooms";

/**
 * The gate — an overlay, not a room of its own.
 *
 * Rozna's entrance is a mud-brick wall with two carved teak leaves set
 * low in it, so that is what the site opens on: the whole wall standing,
 * and then only its doors moving.
 *
 * The leaves are cut out of the same photograph as the wall. An earlier
 * version composited a close-up of the doors into the opening, and it
 * read as exactly what it was — a second picture, at a different scale
 * and a different time of day, pasted on. Here each leaf is a window
 * onto its own half of the one frame, positioned so that at rest the
 * seams are invisible: what swings away is the actual pixels of the
 * actual door.
 *
 * It sits *inside* the courtyard's panel rather than beside it, and the
 * track holds still while it plays (see `hold` in lib/travel.ts). That is
 * the point: the courtyard does not slide in from the right, it is
 * already behind the doors and is uncovered as they open. Walking
 * sideways through the building only starts once you are inside it.
 *
 * The sequence is four beats, all four written on the panel each frame
 * by the travel engine as custom properties:
 *
 *   --sign    the standfirst clears before anything moves
 *   --leaf    the leaves swing back on their hinges
 *   --reveal  the courtyard behind them comes up
 *   --step    you walk through, and the wall passes overhead
 */

/**
 * The doorway, measured off the photograph as percentages of it.
 *
 * `split` is where the two leaves actually meet, which is not the middle
 * of the opening — the left leaf is the wider of the two. Halving the
 * opening instead puts the seam a percent and a half out, and a seam
 * that lands in the middle of a plank is the one thing that would give
 * the whole effect away.
 */
const DOOR = { left: 34, right: 60.5, top: 66.5, bottom: 88.7, split: 48.8 };
const DOOR_MID_X = (DOOR.left + DOOR.right) / 2;
const DOOR_MID_Y = (DOOR.top + DOOR.bottom) / 2;

/**
 * A leaf is a window onto the wall photograph. The image inside it is
 * laid out at the full size of the plate and pushed back up and left by
 * the leaf's own offset, so it lines up with the wall behind it to the
 * pixel, at any screen size.
 */
function leafFrame(from: number, to: number) {
  const w = to - from;
  const h = DOOR.bottom - DOOR.top;
  return {
    box: { left: `${from}%`, width: `${w}%`, top: `${DOOR.top}%`, height: `${h}%` },
    inner: {
      width: `${(100 / w) * 100}%`,
      left: `${(-from / w) * 100}%`,
      height: `${(100 / h) * 100}%`,
      top: `${(-DOOR.top / h) * 100}%`,
    },
  };
}

const LEAVES = [
  { side: "l" as const, ...leafFrame(DOOR.left, DOOR.split), origin: "left center", deg: "-86deg" },
  { side: "r" as const, ...leafFrame(DOOR.split, DOOR.right), origin: "right center", deg: "86deg" },
];

/**
 * The wall is drawn big enough to cover any screen while keeping the
 * photograph's own proportions — which it must, because every number
 * above is a percentage of an uncropped frame. `object-cover` on a box
 * of a different shape would crop the image inside its own box and put
 * all of those measurements out.
 */
const PLATE_H = "var(--plate-h)";
const PLATE_CLASSES = "[--plate-h:max(100svh,100vw*1.3333)]";

export default function Gate({ vertical }: { vertical: boolean }) {
  return (
    <div
      aria-label="The gate at Rozna"
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
      // The last beat lifts the overlay away, uncovering the courtyard
      // that has been underneath it the whole time.
      style={{ opacity: "calc(1 - var(--step, 0))" }}
    >
      {/* Night behind the wall, which also keeps the courtyard hidden
          until the doors are open: before that the only way in is the
          doorway itself. */}
      <div
        className="absolute inset-0 bg-night"
        style={{ opacity: "calc(1 - var(--step, 0) * 0.85)" }}
      />

      <div
        className={`absolute left-1/2 will-change-transform ${PLATE_CLASSES}`}
        style={{
          height: PLATE_H,
          aspectRatio: "387 / 516",
          /**
           * Ideally the doorway sits at 64% of the screen. On a phone the
           * plate is only as tall as the viewport, so honouring that
           * offset would leave a strip of nothing under the paving —
           * hence the clamp between bottom-aligned and top-aligned. It
           * takes the ideal position whenever there is slack to take it.
           */
          top: `clamp(calc(100% - ${PLATE_H}), calc(64% - ${PLATE_H} * ${DOOR_MID_Y / 100}), 0px)`,
          // Scaled from the middle of the doorway, so the last beat reads
          // as going through it rather than as the picture zooming.
          transform: "translateX(-50%) scale(calc(1 + var(--step, 0) * 2.4))",
          transformOrigin: `${DOOR_MID_X}% ${DOOR_MID_Y}%`,
        }}
      >
        {/* --- the wall --------------------------------------------- */}
        <div className="absolute inset-0" style={{ opacity: "calc(1 - var(--step, 0) * 1.7)" }}>
          <Image
            src="/assets/gate-fort.jpg"
            alt="The gate at Rozna: carved teak doors set into the fort wall"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dusk over the wall, so the type has something to sit on and
              the lit doorway is the brightest thing on screen. */}
          <div className="absolute inset-0 bg-night/40" />
        </div>

        {/* --- the doorway ------------------------------------------ */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: `${DOOR.left}%`,
            top: `${DOOR.top}%`,
            width: `${DOOR.right - DOOR.left}%`,
            height: `${DOOR.bottom - DOOR.top}%`,
            perspective: "1100px",
          }}
        >
          {/* what is through it */}
          <div className="absolute inset-0 bg-night">
            <Image
              src="/assets/courtyard-people.jpg"
              alt=""
              fill
              sizes="30vw"
              className="scale-[1.5] object-cover object-[58%_56%]"
            />
            <div
              className="absolute inset-0 bg-night"
              style={{ opacity: "calc(0.88 - var(--leaf, 0) * 0.74)" }}
            />
          </div>

          {/* lamplight from inside, once there is a gap to come through */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 80% at 50% 100%, rgba(232,132,63,0.5), transparent 74%)",
              opacity: "var(--leaf, 0)",
            }}
          />
        </div>

        {/* --- the leaves, hinged on their jambs --------------------- */}
        {LEAVES.map((leaf) => (
          <div
            key={leaf.side}
            className="backface-hidden absolute overflow-hidden"
            style={{
              ...leaf.box,
              transformOrigin: leaf.origin,
              transform: `rotateY(calc(var(--leaf, 0) * ${leaf.deg}))`,
            }}
          >
            <div className="absolute" style={leaf.inner}>
              <Image src="/assets/gate-fort.jpg" alt="" fill sizes="100vw" className="object-cover" />
            </div>
            {/* the wall's own dusk, carried onto the leaf so it does not
                brighten as it swings out of the picture */}
            <div className="absolute inset-0 bg-night/40" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  leaf.side === "l"
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
