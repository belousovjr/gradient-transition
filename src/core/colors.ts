import rgba from "color-rgba";
import { ColorStop } from "gradient-parser";

export type ColorParsed = [number, number, number, number];

export const initialColorParsed: ColorParsed = [0, 0, 0, 0];

function parseColor(color: string): ColorParsed {
  const result = rgba(color);
  return result.length ? result : [...initialColorParsed];
}

//TODO fix errors messages

export function stringifyColor(color: ColorParsed) {
  return `rgba(${color.join(",")})`;
}

export function parseStopColorValue(value: ColorStop): ColorParsed {
  switch (value.type) {
    case "hex": {
      return parseColor(`#${value.value}`);
    }
    case "literal": {
      return parseColor(value.value);
    }
    default: {
      const [r, g, b, a = 1] = value.value;
      return [r, g, b, a].map((v) => Number(v)) as ColorParsed;
    }
  }
}
