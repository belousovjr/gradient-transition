import TransitionProvider from "./TransitionProvider.ts";
import { GradientParsed } from "./gradients.ts";

export type Target = HTMLElement;

export interface AttachOptions {
  direction?: "start" | "end";
}
export interface TransitionState {
  target: Target;
  options: AttachOptions;
  provider: TransitionProvider<GradientParsed, string> | null;
}
export const initialTransitionState: Omit<
  TransitionState,
  "target" | "options"
> = {
  provider: null,
};
