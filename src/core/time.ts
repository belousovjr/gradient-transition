import { BezierValue, BezierValueParsed, parseBezierValue } from "./bezier.ts";

type TimeValue = `${number}ms` | `${number}s`;

export interface TimeOptions {
  timingFn: BezierValueParsed;
  duration: number;
  delay: number;
}

const timingFnRegExp = /(?:\([^)]*\)|[^,])+/g;

function getPropertyByIndex<T extends string>(
  propertyString: string,
  index: number,
  regExp?: RegExp,
) {
  const array = !regExp
    ? propertyString.split(", ")
    : propertyString.match(regExp)?.map((s) => s.trim());
  return array?.[index] as T | undefined;
}

function parseTimeValue(value: TimeValue) {
  const isMs = value.includes("ms");
  return Number(value.slice(0, isMs ? -2 : -1)) * (isMs ? 1 : 1000);
}

export function parseTimeProperties(style: CSSStyleDeclaration): TimeOptions {
  const property = style.transitionProperty.split(", ");
  const propertyIndex = property.findLastIndex((item) =>
    ["all", "background-image"].includes(item),
  );

  const duration =
    getPropertyByIndex<TimeValue>(style.transitionDuration, propertyIndex) ||
    "0s";

  const delay =
    getPropertyByIndex<TimeValue>(style.transitionDelay, propertyIndex) || "0s";

  const timingFn =
    getPropertyByIndex<BezierValue>(
      style.transitionTimingFunction,
      propertyIndex,
      timingFnRegExp,
    ) || "ease";

  return {
    duration: parseTimeValue(duration),
    delay: parseTimeValue(delay),
    timingFn: parseBezierValue(timingFn),
  };
}
