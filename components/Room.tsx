import type { CSSProperties, ReactNode } from "react";

/** Where a room is relative to the one you are standing in. */
export type RoomState = "here" | "past" | "ahead";

/**
 * `vertical` swaps the sideways walk for the stacked plan (narrow
 * screens and reduced motion both land there). `reduced` is separate
 * because a room may still want to drop a specific movement while
 * keeping the layout it already has.
 */
export type RoomProps = { state: RoomState; vertical: boolean; reduced: boolean };

/**
 * The shell every room sits in.
 *
 * Horizontally the room is a fixed-width panel in the track; vertically
 * it is a full-height block. Rooms are deliberately not all the same
 * width — the table is broad, the doorway rooms are narrow — because a
 * building whose rooms are all identical reads as a carousel.
 *
 * `data-state` is the only thing the travel engine writes here, and
 * every arrival animation in the site hangs off it in CSS.
 */
export default function Room({
  id,
  state,
  vertical,
  width = 100,
  clip = true,
  className = "",
  style,
  children,
  ...rest
}: {
  id: string;
  state: RoomState;
  vertical: boolean;
  /** Panel width in vw. Ignored in the vertical plan. */
  width?: number;
  /**
   * Clip the panel's contents. On by default, because panels are laid
   * side by side and their backdrops overhang. A room that pins
   * something inside itself has to turn this off: `overflow: hidden`
   * makes the panel the nearest scroll container, and a `sticky` child
   * then has nothing to stick to and simply scrolls away.
   */
  clip?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** Passed through so a room can mark itself, e.g. `data-pass`. */
  [key: `data-${string}`]: unknown;
}) {
  return (
    <section
      id={id}
      {...rest}
      data-state={state}
      className={`relative shrink-0 ${clip ? "overflow-hidden" : ""} ${
        vertical ? "min-h-svh w-full" : "h-full"
      } ${className}`}
      style={vertical ? style : { width: `${width}vw`, ...style }}
    >
      {children}
    </section>
  );
}

/**
 * The room's own label, in the survey register: number, hairline rule,
 * name. It is the one element that appears in every room, so it is what
 * tells you the rooms are a set.
 */
export function Marker({ n, name, note }: { n: string; name: string; note?: string }) {
  return (
    <div data-enter className="flex items-center gap-4">
      <span className="label text-ember">{n}</span>
      <span className="rule w-10 shrink-0" />
      <span className="label opacity-70">{name}</span>
      {note && (
        <>
          <span className="rule hidden w-10 shrink-0 sm:block" />
          <span className="label hidden opacity-45 sm:inline">{note}</span>
        </>
      )}
    </div>
  );
}
