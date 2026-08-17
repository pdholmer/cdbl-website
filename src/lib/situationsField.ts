/**
 * Canonical coordinate system for the CDBL Situations Trainer.
 * All x/y values stored in `situation_steps` (positions, runners, ball)
 * are expressed in this space: SVG viewBox "0 0 400 500".
 */
export const FIELD_VIEWBOX = "0 0 400 500";
export const FIELD_WIDTH = 400;
export const FIELD_HEIGHT = 500;

export const HOME_PLATE = { x: 200, y: 478 } as const;

/** Default (set position) coordinates for each defender token. */
export const DEFAULT_POSITIONS = {
  P: { x: 200, y: 310 },
  C: { x: 200, y: 470 },
  "1B": { x: 330, y: 300 },
  "2B": { x: 255, y: 245 },
  SS: { x: 145, y: 245 },
  "3B": { x: 70, y: 300 },
  LF: { x: 95, y: 140 },
  CF: { x: 200, y: 80 },
  RF: { x: 305, y: 140 },
} as const;

export type PositionKey = keyof typeof DEFAULT_POSITIONS;

export const BASE_STATE_LABELS: Record<string, string> = {
  none: "Bases Empty",
  "1st": "Runner on 1st",
  "2nd": "Runner on 2nd",
  "3rd": "Runner on 3rd",
  "1st_2nd": "Runners on 1st & 2nd",
  "1st_3rd": "Runners on 1st & 3rd",
  "2nd_3rd": "Runners on 2nd & 3rd",
  loaded: "Bases Loaded",
};

export const BASE_STATE_ORDER = [
  "none",
  "1st",
  "2nd",
  "3rd",
  "1st_2nd",
  "1st_3rd",
  "2nd_3rd",
  "loaded",
];
