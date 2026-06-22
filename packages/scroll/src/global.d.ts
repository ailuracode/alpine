/// <reference types="@types/alpinejs" />

export type ScrollDirection = "up" | "down" | "none";

export interface ScrollSnapshot {
  x: number;
  y: number;
  direction: ScrollDirection;
  atTop: boolean;
  atBottom: boolean;
  progress: number;
}

export interface ScrollStore extends ScrollSnapshot {
  locked: boolean;
  refresh(): boolean;
  lock(): boolean;
  unlock(): boolean;
  toggleLock(): boolean;
  readonly isLocked: boolean;
  readonly isAtTop: boolean;
  readonly isAtBottom: boolean;
  readonly isScrollingDown: boolean;
  readonly isScrollingUp: boolean;
  readonly showToTop: boolean;
  toTop(behavior?: ScrollBehavior): void;
  toBottom(behavior?: ScrollBehavior): void;
}

declare global {
  namespace Alpine {
    interface Stores {
      scroll: ScrollStore;
    }
  }
}
