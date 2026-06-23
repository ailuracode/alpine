/// <reference types="@types/alpinejs" />

export declare const VISIBILITY_STATES: readonly ["visible", "hidden", "prerender"];

export type VisibilityState = (typeof VISIBILITY_STATES)[number];

export type VisibilitySnapshot = {
  readonly isVisible: boolean;
  readonly isHidden: boolean;
  readonly state: VisibilityState;
};

export interface VisibilityMagic extends VisibilitySnapshot {
  is(state: VisibilityState): boolean;
}

export function readVisibilityState(
  doc?: Pick<Document, "hidden"> & { visibilityState: VisibilityState }
): VisibilitySnapshot;

export function createVisibilityState(snapshot?: VisibilitySnapshot): VisibilityMagic;

declare global {
  namespace Alpine {
    interface Magics<T> {
      $visibility: VisibilityMagic;
    }
  }
}
