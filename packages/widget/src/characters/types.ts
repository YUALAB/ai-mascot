/**
 * A character is a function that returns SVG markup.
 *
 * To animate, the widget looks for these class names inside the SVG.
 * Every hook is optional — a character only needs the ones it can use.
 *
 *   .m-all     whole body (breathing)
 *   .m-head    head (tilts while thinking)
 *   .m-eyes    group of both eyes (follows the pointer)
 *   .m-eye     one eye (blinks)
 *   .m-mouth   closed mouth / .m-open  open mouth (swap while talking)
 *   .m-ear     an ear (twitches now and then)
 *   .m-tail    tail (wags)
 *   .m-wave    the arm that waves hello
 */
export interface CharacterOptions {
  /** Main color as a hex string, e.g. "#a9c6e3". */
  color: string;
  /** Name of an accessory the character supports, or "none". */
  accessory: string;
}

export interface Character {
  id: string;
  label: string;
  viewBox: string;
  accessories: string[];
  defaultColor: string;
  render(o: CharacterOptions): string;
  /** Pivot points for the CSS animations, in viewBox units. */
  origins: { head: string; tail: string; wave: string; ear: string };
}
