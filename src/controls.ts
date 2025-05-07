import {
  propertyName,
  renderClassName,
  wrapperClassName,
} from "./core/constants.ts";
import {
  AttachOptions,
  initialTransitionState,
  Target,
  TransitionState,
} from "./core/transition.ts";
import { parseTimeProperties } from "./core/time.ts";
import { createStyleSnapshot } from "./core/css-match.ts";
import TransitionProvider from "./core/TransitionProvider.ts";
import { parseGradient, stringifyGradient } from "./core/gradients.ts";
import { interpolateGradient } from "./core/progress.ts";

const wraps = new Map<Target, TransitionState>();

let isRunning = false;
let animFrame: null | number;

export function attach(selector: string, options: AttachOptions = {}) {
  const elements = document.querySelectorAll<Target>(selector);
  for (const el of elements) {
    if (!el.classList.contains(wrapperClassName)) {
      console.warn(
        `Wrapper element is missing the required class ".${wrapperClassName}".`,
      );
    }

    const target = el.querySelector<Target>(`.${renderClassName}`);

    if (target) {
      wraps.set(el, {
        ...initialTransitionState,
        options,
        target,
      });
    } else {
      throw new Error(
        `There is no ".${renderClassName}" child element inside "${selector}" wrapper.`,
      );
    }
  }

  if (!isRunning) {
    isRunning = true;
    requestAnimationFrame(loop);
  }
}

export function detach(selector: string) {
  const elements = document.querySelectorAll<Target>(selector);

  for (const el of elements) {
    wraps.delete(el);
  }

  if (wraps.size === 0 && animFrame) {
    cancelAnimationFrame(animFrame);
    isRunning = false;
  }
}

export function reset() {
  wraps.clear();
}

function frame(wrap: Target, state: TransitionState) {
  const currentTime = Date.now();
  const computedStyle = getComputedStyle(state.target);
  const bgImageValue = computedStyle.backgroundImage;
  const emSize = Number(computedStyle.fontSize.replace("px", ""));
  const timeOptions = parseTimeProperties(computedStyle);

  const key = createStyleSnapshot(state.target, {
    excludeProps: ["display"],
    addItems: [
      String(emSize),
      JSON.stringify(timeOptions.timingFn),
      String(timeOptions.duration),
      String(timeOptions.delay),
    ],
  });

  if (!state.provider) {
    state.provider = new TransitionProvider({
      initialKey: key,
      initialState: bgImageValue,
      parseFn: (gradientStr) => {
        return parseGradient(gradientStr, { emSize });
      },
      stringifyFn: stringifyGradient,
      interpolateFn: (...args) => {
        return interpolateGradient(...args, state.options);
      },
      timeOptions,
    });
  } else {
    state.provider.setState(currentTime, {
      key,
      state: bgImageValue,
      timeOptions,
    });
  }

  if (state.provider.isActive(currentTime)) {
    const newValue = state.provider.getCurrentState(currentTime, true);
    wrap.style.setProperty(propertyName, newValue);
    state.target.style.setProperty("display", "none");
  } else {
    wrap.style.removeProperty(propertyName);
    state.target.style.removeProperty("display");
  }
}

function loop() {
  for (const [wrap, state] of wraps) {
    frame(wrap, state);
  }

  animFrame = requestAnimationFrame(loop);
}
