import CSSRulesMatcher from "css-rules-matcher";
import { propertyName } from "./constants.ts";
import { Target } from "./transition.ts";

interface StyleSnapshotOptions {
  excludeProps: string[];
  addItems: string[];
}

const bgImageMatcher = new CSSRulesMatcher({
  properties: [propertyName],
});

export function createStyleSnapshot(
  target: Target,
  { excludeProps, addItems }: StyleSnapshotOptions,
) {
  const styles: string[] = [];

  for (let i = 0; i < target.style.length; i++) {
    const value = target.style[i];
    if (!excludeProps.includes(value)) {
      styles.push(`${value}:${target.style.getPropertyValue(value)}`);
    }
  }

  const rules = bgImageMatcher
    .getMatchedCSSRules(target)
    .map((rule) => rule.cssText);
  return JSON.stringify([...styles, ...addItems, ...rules]);
}
