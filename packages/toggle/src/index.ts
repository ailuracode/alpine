import type AlpineType from "alpinejs";

export interface ToggleBinaryStates<TA, TB> {
  truly: TA;
  falsely: TB;
}

export interface ToggleTernaryStates<TA, TB, TN> extends ToggleBinaryStates<TA, TB> {
  ternary: TN;
}

export type ToggleValue<TA, TB, TN = undefined> = TN extends undefined ? TA | TB : TA | TB | TN;

export interface ToggleOptions<TA, TB, TN = undefined> {
  states: ToggleBinaryStates<TA, TB> & { ternary?: TN };
  initial?: TA | TB | TN;
}

export interface ToggleInstance<TA, TB, TN, V> {
  value: V;
  readonly states: ToggleBinaryStates<TA, TB> & { ternary: TN };
  readonly truly: TA;
  readonly falsely: TB;
  readonly ternary: TN;
  is(value: V): boolean;
  set(value: V): boolean;
  toggle(): V;
  cycle(): V;
  reset(): V;
}

export type ToggleMagic = {
  <const TA, const TB>(options: {
    states: ToggleBinaryStates<TA, TB>;
    initial?: TA | TB;
  }): ToggleInstance<TA, TB, undefined, TA | TB>;
  <const TA, const TB, const TN>(options: {
    states: ToggleTernaryStates<TA, TB, TN>;
    initial?: TA | TB | TN;
  }): ToggleInstance<TA, TB, TN, TA | TB | TN>;
};

function isToggleState(states: readonly unknown[], value: unknown): boolean {
  return states.includes(value);
}

function indexOfState(states: readonly unknown[], value: unknown): number {
  return states.indexOf(value);
}

function buildToggle<TA, TB, TN>(options: ToggleOptions<TA, TB, TN> & { initial?: unknown }) {
  const truly = options.states.truly;
  const falsely = options.states.falsely;
  const hasTernaryState = "ternary" in options.states;
  const ternary = (hasTernaryState ? options.states.ternary : undefined) as TN;
  const stateValues = { truly, falsely, ternary };
  const allStates = hasTernaryState ? [truly, falsely, ternary] : [truly, falsely];
  const initial = (
    "initial" in options ? options.initial : hasTernaryState ? ternary : truly
  ) as unknown;

  const toggle = {
    value: initial,
    states: stateValues,
    truly,
    falsely,
    ternary,

    is(value: unknown) {
      return this.value === value;
    },

    set(value: unknown) {
      if (!isToggleState(allStates, value) || this.value === value) {
        return false;
      }

      this.value = value;
      return true;
    },

    toggle() {
      if (hasTernaryState) {
        if (this.value === ternary) {
          this.value = truly;
        } else if (this.value === truly) {
          this.value = falsely;
        } else {
          this.value = truly;
        }
      } else {
        this.value = this.value === truly ? falsely : truly;
      }

      return this.value;
    },

    cycle() {
      const currentIndex = indexOfState(allStates, this.value);
      const nextIndex = (currentIndex + 1) % allStates.length;
      this.value = allStates[nextIndex];
      return this.value;
    },

    reset() {
      this.value = initial;
      return this.value;
    },
  };

  return toggle;
}

/** Creates an independent toggle instance with optional ternary state. */
export function createToggle<const TA, const TB>(options: {
  states: ToggleBinaryStates<TA, TB>;
  initial?: TA | TB;
}): ToggleInstance<TA, TB, undefined, TA | TB>;
export function createToggle<const TA, const TB, const TN>(options: {
  states: ToggleTernaryStates<TA, TB, TN>;
  initial?: TA | TB | TN;
}): ToggleInstance<TA, TB, TN, TA | TB | TN>;
export function createToggle<const TA, const TB, const TN = undefined, const V = TA | TB>(
  options: ToggleOptions<TA, TB, TN> & { initial?: V }
): ToggleInstance<TA, TB, TN, V> {
  return buildToggle(options) as unknown as ToggleInstance<TA, TB, TN, V>;
}

/** Builds callable `$toggle` magic that returns independent toggle instances. */
export function createToggleMagic(Alpine?: Pick<AlpineType.Alpine, "reactive">): ToggleMagic {
  return ((options: Parameters<ToggleMagic>[0]) => {
    const instance = createToggle(
      options as ToggleOptions<unknown, unknown, unknown> & { initial?: unknown }
    );
    return Alpine ? Alpine.reactive(instance) : instance;
  }) as ToggleMagic;
}

/** Alpine.js toggle plugin. Registers callable magic `$toggle`. */
export default function togglePlugin(Alpine: AlpineType.Alpine): void {
  Alpine.magic("toggle", () => createToggleMagic(Alpine));
}
