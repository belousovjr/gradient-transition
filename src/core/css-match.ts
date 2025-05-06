import CSSRulesMatcher from "css-rules-matcher";
import { propertyName } from "./constants.ts";
import { Target } from "./transition.ts";

const bgImageMatcher = new CSSRulesMatcher({
  properties: [propertyName],
});

export function createStyleSnapshot(target: Target, ...options: string[]) {
  const styles: string[] = [];
  for (const property in target.style) {
    if (
      !["display", propertyName].includes(property) &&
      target.style[property]
    ) {
      styles.push(target.style[property]);
    }
  }
  const rules = bgImageMatcher
    .getMatchedCSSRules(target)
    .map((rule) => rule.cssText);
  return JSON.stringify([...styles, ...options, ...rules]);
}
