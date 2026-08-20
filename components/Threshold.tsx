import Image from "next/image";

/**
 * A doorway.
 *
 * One sits between every pair of rooms, and walking the site means
 * walking through them. It is a slab of wall with the Rozna arch cut out
 * of it, and what you see through the cut-out is the room you are about
 * to be in — so the site's transitions are architecture rather than
 * crossfades.
 *
 * The first version of this was a small arch floating in the middle of a
 * flat brown panel, which read as a headstone rather than a door. Three
 * things fix that, and all three are things a real doorway has:
 *
 *  - **A floor.** A band across the bottom in a lighter earth, with a
 *    hard line where it meets the wall. Without a ground plane the arch
 *    has nothing to stand on and reads as a cut-out sticker.
 *  - **Light through it.** The next room spills a warm pool onto the
 *    floor in front of the opening. This is what tells you the arch is a
 *    hole and not a picture.
 *  - **Size.** The opening is most of the wall now. A door you can see
 *    the whole of at once is a door you are looking at; a door that
 *    fills your view is one you are walking through.
 *
 * On a phone it is wider and shallower for the same reason — a portrait
 * arch centred in a portrait band leaves dead wall on all four sides.
 *
 * The image behind the arch carries a `data-depth`, so it drifts against
 * the wall as you pass. That mismatch is the last thing stopping the
 * opening looking like a sticker.
 */
export default function Threshold({
  line,
  through,
  vertical = false,
}: {
  line: string;
  through: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-earth ${
        vertical ? "h-[42vh] w-full" : "h-full w-[34vw]"
      }`}
    >
      {/* plaster wash over the flat earth colour */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(75% 85% at 50% 8%, rgba(232,132,63,0.2), transparent 60%), radial-gradient(60% 70% at 15% 100%, rgba(11,9,8,0.5), transparent 72%)",
        }}
      />

      {/* the floor the doorway stands on */}
      <div
        aria-hidden
        className={`absolute inset-x-0 bottom-0 border-t border-night/25 ${
          vertical ? "h-[16%]" : "h-[14%]"
        }`}
        style={{ background: "linear-gradient(180deg, #7a5738 0%, #4a2a17 100%)" }}
      />

      <div
        className={`relative ${vertical ? "mb-[6%] h-[72%] w-[72vw]" : "mb-[7%] h-[76%] w-[64%]"}`}
      >
        <div className="arch relative size-full overflow-hidden bg-night">
          <div data-depth={vertical ? undefined : "0.06"} className="absolute -inset-x-[26%] inset-y-0">
            <Image
              src={through}
              alt=""
              fill
              sizes="(max-width: 1024px) 70vw, 25vw"
              className="object-cover"
            />
          </div>
          {/* the far side is dimmer than the room you are standing in,
              but it has to stay a room rather than a silhouette */}
          <div className="absolute inset-0 bg-night/25" />
        </div>

        {/* the lintel shadow the arch throws back into the wall */}
        <div
          aria-hidden
          className="arch pointer-events-none absolute -inset-x-[4%] -top-[2.5%] bottom-0 -z-10 bg-night/45 blur-md"
        />

        {/* light from the next room, spilling onto the floor */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[14%] left-1/2 h-[24%] w-[150%] -translate-x-1/2 blur-lg"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 0%, rgba(232,132,63,0.5), rgba(232,132,63,0.14) 55%, transparent 78%)",
          }}
        />
      </div>

      <span
        className={`label absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-paper/45 ${
          vertical ? "bottom-5" : "bottom-8"
        }`}
      >
        {line}
      </span>
    </div>
  );
}
