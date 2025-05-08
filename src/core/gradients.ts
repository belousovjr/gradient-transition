import { parse, GradientNode } from "gradient-parser";
import { ColorParsed, parseStopColorValue, stringifyColor } from "./colors.ts";
import {
  OrientationParsed,
  parseOrientation,
  stringifyOrientation,
} from "./orientation.ts";
import { LengthParsed, parseLength } from "./length.ts";

export interface ColorStopParsed {
  value: ColorParsed;
  length?: LengthParsed;
}

export type GradientParsedEmpty = { type: "none" };

export type GradientParsed =
  | {
      type: GradientNode["type"];
      orientation: OrientationParsed;
      colorStops: ColorStopParsed[];
    }
  | GradientParsedEmpty;

export interface GradientParsingOptions {
  emSize: number;
}

export function parseGradient(
  gradientStr: string,
  options: GradientParsingOptions,
): GradientParsed {
  if (gradientStr === "none") {
    return { type: "none" };
  }

  let parsedGradient!: GradientNode;

  try {
    const parsedGradients = parse(gradientStr) as GradientNode[];
    parsedGradient = parsedGradients[0];
  } catch (e) {
    console.error(e);
  }

  const colorStops: ColorStopParsed[] = parsedGradient.colorStops.map(
    (colorStop, i, array) => {
      const value = parseStopColorValue(colorStop);
      let length = colorStop.length && parseLength(colorStop.length, options);

      if (!length) {
        if (i === array.length - 1) {
          length = { type: "%", value: 100 };
        } else if (i === 0) {
          length = { type: "%", value: 0 };
        }
      }

      return {
        value,
        length,
      };
    },
  );

  const orientation = parseOrientation(parsedGradient, gradientStr, options);

  return {
    type: parsedGradient.type,
    orientation,
    colorStops,
  };
}

export function stringifyGradient(grad: GradientParsed) {
  if (grad.type !== "none") {
    const orientation = stringifyOrientation(grad.orientation);
    const stops = grad.colorStops.map((item) => {
      const color = stringifyColor(item.value);
      const length = item.length
        ? `${item.length.value}${item.length.type}`
        : "";
      return `${color} ${length}`.trim();
    });

    return `${grad.type}(${orientation ? `${orientation},` : ""}${[...stops].join(", ")})`;
  } else {
    throw new Error("Invalid gradient type.");
  }
}
