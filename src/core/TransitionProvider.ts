import BezierEasing from "bezier-easing";
import { bezierPresets } from "./bezier.ts";
import { TimeOptions } from "./time.ts";

interface TProviderTimeOptions extends TimeOptions {
  timingFnKey: string;
}
type TProviderStateKey = string;
interface TProviderState<T> {
  key: TProviderStateKey;
  value: T;
}
interface TProviderParams<T, S> {
  initialKey: TProviderStateKey;
  initialState: S;
  parseFn: (v1: S) => T;
  stringifyFn: (v1: T) => string;
  interpolateFn: (v1: T, v2: T, progress: number) => T;
  timeOptions?: TimeOptions;
}

interface TProviderSetStateParams<S> {
  key: TProviderStateKey;
  state: S;
  timeOptions: TimeOptions;
}

export default class TransitionProvider<T, S> {
  static #easing: Map<string, BezierEasing.EasingFunction> = new Map();
  #startTime = 0;
  #cached = false;
  private readonly interpolateFn: (v1: T, v2: T, progress: number) => T;
  private readonly parseFn: (v1: S) => T;
  private readonly stringifyFn: (v1: T) => string;
  #timeOptions: TProviderTimeOptions = {
    timingFn: bezierPresets.ease,
    timingFnKey: JSON.stringify(bezierPresets.ease),
    duration: 0,
    delay: 0,
  };

  #durationSub = 0;
  #states: {
    prev: TProviderState<T> | null;
    next: TProviderState<T>;
  };

  constructor(params: TProviderParams<T, S>) {
    this.#updateOptions(params.timeOptions);
    this.interpolateFn = params.interpolateFn;
    this.parseFn = params.parseFn;
    this.stringifyFn = params.stringifyFn;
    const initialValue = this.parseFn(params.initialState);

    const initialStateParsed = { key: params.initialKey, value: initialValue };
    this.#states = {
      prev: null,
      next: initialStateParsed,
    };
  }
  #updateOptions(timeOptions?: TimeOptions) {
    if (timeOptions) {
      const timingFnKey = JSON.stringify(this.#timeOptions.timingFn);
      this.#timeOptions = {
        ...timeOptions,
        timingFnKey,
      };

      if (!TransitionProvider.#easing.has(timingFnKey)) {
        TransitionProvider.#easing.set(
          timingFnKey,
          BezierEasing(...this.#timeOptions.timingFn),
        );
      }
    }
  }
  setState(time: number, params: TProviderSetStateParams<S>) {
    if (params.key !== this.#states.next.key) {
      const progress = this.#calcProgress(time);

      const prevValue =
        progress !== 1 ? this.getCurrentState(time) : this.#states.next.value;

      const nextValue = this.parseFn(params.state);
      const timeDiff = time - this.#startTime;

      if (
        progress !== 1 &&
        timeDiff >= 0 &&
        (!this.#states.prev || params.key === this.#states.prev?.key)
      ) {
        this.#durationSub =
          this.#timeOptions.duration - timeDiff - this.#durationSub;
      } else {
        this.#durationSub = 0;
      }

      const isNotFinished =
        progress !== 1 && params.key !== this.#states.prev?.key;

      this.#states = {
        prev: {
          value: { ...prevValue },
          key: isNotFinished
            ? `${this.#states.next.key}_${progress}`
            : this.#states.next.key,
        },
        next: { value: { ...nextValue }, key: params.key },
      };
      this.#updateOptions(params.timeOptions);

      this.#startTime = time + this.#timeOptions.delay;
      this.#cached = false;
    }
  }
  #calcProgress(time: number) {
    if (this.#cached) {
      return 1;
    }
    const progress =
      (time - this.#startTime) /
      (this.#timeOptions.duration - this.#durationSub);

    if (progress >= 1) {
      this.#cached = true;
      return 1;
    } else if (progress < 0) {
      return 0;
    }
    return progress;
  }
  getCurrentState(time: number, stringify?: false | undefined): T;
  getCurrentState(time: number, stringify: true): string;
  getCurrentState(time: number, stringify?: boolean): T | string {
    const progress = this.#calcProgress(time);

    const value = this.#states.prev
      ? this.interpolateFn(
          this.#states.prev.value,
          this.#states.next.value,
          TransitionProvider.#easing.get(this.#timeOptions.timingFnKey)!(
            progress,
          ),
        )
      : this.#states.next.value;
    return !stringify ? value : this.stringifyFn(value);
  }
  isActive(time: number) {
    return this.#calcProgress(time) !== 1;
  }
}
