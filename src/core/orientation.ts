import {
  AngularNode,
  DirectionalNode,
  EmNode,
  ExtentKeywordNode,
  GradientNode,
  LinearGradientNode,
  PercentNode,
  PositionKeywordNode,
  PxNode,
  RepeatingLinearGradientNode,
  ShapeNode,
} from "gradient-parser";
import { LengthParsed, parseLength } from "./length.ts";
import { GradientParsingOptions } from "./gradients.ts";

type DirectionalNodeParsed = keyof typeof directionsInRad;

interface LinearOrientationParsed {
  type: "linear";
  value:
    | {
        type: "rad";
        value: number;
      }
    | { type: "directional"; value: DirectionalNodeParsed };
}
interface RadialOrientationParsed {
  type: "radial";
  shape?: ShapeNode["value"];
  size?: ExtentKeywordNode["value"];
  at: {
    x: LengthParsed;
    y: LengthParsed;
  };
}

export type OrientationParsed =
  | LinearOrientationParsed
  | RadialOrientationParsed;

export const initialLinearOrientation: OrientationParsed = {
  type: "linear",
  value: {
    type: "rad",
    value: Math.PI,
  },
};

const initialRadialOrientation: RadialOrientationParsed = {
  type: "radial",
  at: {
    x: {
      type: "%",
      value: 50,
    },
    y: {
      type: "%",
      value: 50,
    },
  },
};

const units = [
  // { type: "grad", value: Math.PI / 200 },
  // { type: "turn", value: 2 * Math.PI },
  { type: "rad", value: 1 },
  { type: "deg", value: Math.PI / 180 },
] as const;

const directionsInRad = {
  right: Math.PI * 0.5,
  top: 0,
  left: -Math.PI * 0.5,
  bottom: Math.PI,
} as const;

const keywordsInPercents: Record<PositionKeywordNode["value"], number> = {
  left: 0,
  top: 0,
  bottom: 100,
  right: 100,
  center: 50,
};

function isLinearGradient(
  grad: GradientNode,
): grad is LinearGradientNode | RepeatingLinearGradientNode {
  return (
    grad.type === "linear-gradient" || grad.type === "repeating-linear-gradient"
  );
}

function parseDirectionalNode(node: DirectionalNode): LinearOrientationParsed {
  const radValue = directionsInRad[node.value as DirectionalNodeParsed] as
    | number
    | undefined;
  if (typeof radValue === "number") {
    return {
      type: "linear",
      value: { type: "rad", value: radValue },
    };
  }
  return {
    type: "linear",
    value: {
      type: "directional",
      value: node.value as DirectionalNodeParsed,
    },
  };
}
function parseAngularNode(
  node: AngularNode,
  gradientStr: string,
): LinearOrientationParsed {
  const value = Number(node.value);
  const unit = units.find((value) => {
    return gradientStr.includes(`${value.type},`);
  })!;

  return {
    type: "linear",
    value: {
      type: "rad",
      value: unit.value * value,
    },
  };
}

function parseAtValue(
  atValue: PxNode | EmNode | PercentNode | PositionKeywordNode,
  options: GradientParsingOptions,
): LengthParsed {
  if (atValue.type === "position-keyword") {
    return {
      type: "%",
      value: keywordsInPercents[atValue.value],
    };
  } else {
    return parseLength(atValue, options);
  }
}

export function parseOrientation(
  parsedGradient: GradientNode,
  gradientStr: string,
  options: GradientParsingOptions,
): OrientationParsed {
  if (isLinearGradient(parsedGradient)) {
    if (parsedGradient.orientation) {
      if (parsedGradient.orientation.type === "angular") {
        return parseAngularNode(parsedGradient.orientation, gradientStr);
      } else {
        return parseDirectionalNode(parsedGradient.orientation);
      }
    } else {
      return { ...initialLinearOrientation };
    }
  } else {
    const nodeParsed = { ...initialRadialOrientation };
    if (parsedGradient.orientation) {
      const nodes = parsedGradient.orientation.flatMap((node) => {
        if (node.type === "shape" && node.style?.type === "extent-keyword") {
          return [node, node.style];
        }
        return [node];
      });
      for (const node of nodes) {
        if (node.type === "shape") {
          nodeParsed.shape = node.value;
          if (node.style && !node.at) {
            node.at = {
              type: "position",
              value: {
                x: node.style,
                y: node.style,
              },
            };
          }
        }
        if (node.type === "extent-keyword") {
          nodeParsed.size = node.value;
        }
        if (
          node.at &&
          node.at.value.x.type !== "extent-keyword" &&
          node.at.value.y.type !== "extent-keyword"
        ) {
          nodeParsed.at = {
            x: parseAtValue(node.at.value.x, options),
            y: parseAtValue(node.at.value.y, options),
          };
        }
      }
    }
    return nodeParsed;
  }
}

export function stringifyOrientation(orientation: OrientationParsed) {
  if (orientation.type === "linear") {
    return `${orientation.value.type === "directional" ? "to " : ""}${orientation.value.value}${orientation.value.type === "rad" ? "rad" : ""}`;
  }
  return [
    orientation.shape,
    orientation.size,
    "at",
    `${orientation.at.x.value}${orientation.at.x.type}`,
    `${orientation.at.y.value}${orientation.at.y.type}`,
  ].join(" ");
}
