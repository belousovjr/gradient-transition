import { ColorStopParsed, GradientParsed } from "./gradients.ts";
import { ColorParsed } from "./colors.ts";
import { OrientationParsed } from "./orientation.ts";
import { initialColorParsed } from "./colors.ts";
import { initialLinearOrientation } from "./orientation.ts";
import { LengthParsed } from "./length.ts";

const initialStopParsed: ColorStopParsed = {
  value: { ...initialColorParsed },
};

function interpolate(v1: number, v2: number, progress: number, degrees = 4) {
  return Number((v1 + progress * (v2 - v1)).toFixed(degrees));
}

function interpolateLength(
  length1: LengthParsed | undefined,
  length2: LengthParsed | undefined,
  progress: number,
): LengthParsed | undefined {
  if (length1 && length2) {
    const startPoint = [length1, length2].find((v) => v.value === 0);

    if (length1.type === length2.type || startPoint) {
      if (startPoint) {
        startPoint.type = (startPoint === length1 ? length2 : length1).type;
      }

      return {
        type: length2.type,
        value: interpolate(length1.value, length2.value, progress),
      };
    } else {
      return length2;
    }
  }
  return undefined;
}

function interpolateOrientation(
  pos1: OrientationParsed,
  pos2: OrientationParsed,
  progress: number,
): OrientationParsed {
  if (pos1.type === "linear" && pos2.type === "linear") {
    if (pos1.value.type === "rad" && pos2.value.type === "rad") {
      return {
        type: "linear",
        value: {
          type: "rad",
          value: interpolate(pos1.value.value, pos2.value.value, progress),
        },
      };
    } else {
      return pos2;
    }
  } else if (pos1.type === "radial" && pos2.type === "radial") {
    return {
      type: "radial",
      shape: pos2.shape,
      size: pos2.size,
      at: {
        x: interpolateLength(pos1.at.x, pos2.at.x, progress)!,
        y: interpolateLength(pos1.at.y, pos2.at.y, progress)!,
      },
    };
  } else {
    return pos2;
  }
}
function interpolateColor(
  color1: ColorParsed,
  color2: ColorParsed,
  progress: number,
) {
  return color1.map((value, j) =>
    interpolate(value, color2[j], progress, j !== 3 ? 0 : undefined),
  ) as ColorParsed;
}

function normalizeToGradientTemplate(
  grad1: GradientParsed,
  gradTemplate: GradientParsed,
): Exclude<GradientParsed, null> {
  if (grad1) {
    return grad1;
  } else if (gradTemplate) {
    return {
      type: gradTemplate.type,
      colorStops: gradTemplate.colorStops.map((stop) => ({
        ...stop,
        value: [...initialColorParsed],
      })),
      orientation: gradTemplate.orientation,
    };
  }
  return {
    type: "linear-gradient",
    colorStops: [{ ...initialStopParsed }],
    orientation: initialLinearOrientation,
  };
}

function getColorStopByIndex(
  stops: ColorStopParsed[],
  index: number,
  lastIndex: number,
) {
  return stops.at(index) || stops.at(lastIndex)!;
}

export function interpolateGradient(
  grad1Raw: GradientParsed,
  grad2Raw: GradientParsed,
  progress: number,
  fromStart: boolean,
): GradientParsed {
  const grad1 = normalizeToGradientTemplate(grad1Raw, grad2Raw);
  const grad2 = normalizeToGradientTemplate(grad2Raw, grad1Raw);

  const colorStopsLength = Math.max(
    grad1.colorStops.length,
    grad2.colorStops.length,
  );

  const colorStops: ColorStopParsed[] = [];

  const lastIndex = !fromStart ? -1 : 0;

  for (let i = 0; i < colorStopsLength; i++) {
    const stopIndex = !fromStart ? i : -(i + 1);

    const colorStop1 = getColorStopByIndex(
      grad1.colorStops,
      stopIndex,
      lastIndex,
    );
    const colorStop2 = getColorStopByIndex(
      grad2.colorStops,
      stopIndex,
      lastIndex,
    );

    const newStop = {
      value: interpolateColor(colorStop1.value, colorStop2.value, progress),
      length: interpolateLength(colorStop1.length, colorStop2.length, progress),
    };

    if (!fromStart) {
      colorStops.push(newStop);
    } else {
      colorStops.unshift(newStop);
    }
  }

  const type = !grad2.colorStops.length ? grad1.type : grad2.type;

  return {
    type,
    colorStops,
    orientation: interpolateOrientation(
      grad1.orientation,
      grad2.orientation,
      progress,
    ),
  };
}
