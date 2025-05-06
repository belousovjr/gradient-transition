type BezierPreset = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

type CustomBezierString = `cubic-bezier(${string})`;

export type BezierValue = BezierPreset | CustomBezierString;

export type BezierValueParsed = [number, number, number, number];

function isCustomBezier(bezier: BezierValue): bezier is CustomBezierString {
  return bezier.includes("cubic-bezier");
}

export const bezierPresets: Record<BezierPreset, BezierValueParsed> = {
  linear: [0.0, 0.0, 1.0, 1.0],
  ease: [0.25, 0.1, 0.25, 1.0],
  "ease-in": [0.42, 0.0, 1.0, 1.0],
  "ease-out": [0.0, 0.0, 0.58, 1.0],
  "ease-in-out": [0.42, 0.0, 0.58, 1.0],
};

export function parseBezierValue(bezier: BezierValue): BezierValueParsed {
  if (isCustomBezier(bezier)) {
    return bezier.match(/-?\d*\.?\d+/g)!.map(Number) as BezierValueParsed;
  } else {
    return bezierPresets[bezier];
  }
}
