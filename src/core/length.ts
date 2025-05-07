import { EmNode, PercentNode, PxNode } from "gradient-parser";
import { GradientParsingOptions } from "./gradients.ts";

export interface LengthParsed {
  type: "px" | "%";
  value: number;
}
export function parseLength(
  length: PxNode | EmNode | PercentNode,
  { emSize }: GradientParsingOptions,
): LengthParsed {
  const value = Number(length.value);
  if (length.type === "em") {
    return {
      type: "px",
      value: emSize * value,
    };
  } else {
    return {
      type: length.type,
      value,
    };
  }
}
