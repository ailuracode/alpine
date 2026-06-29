const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Returns focusable elements inside a container. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
  );
}

export type FocusTrap = {
  activate(): void;
  deactivate(): void;
};

/** Creates a focus trap for a dialog container. */
export function createFocusTrap(container: HTMLElement): FocusTrap {
  let active = false;
  let previousFocus: HTMLElement | null = null;

  function handleKeydown(event: KeyboardEvent): void {
    if (!active || event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (current === first || !container.contains(current)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      if (active) {
        return;
      }

      active = true;
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      container.addEventListener("keydown", handleKeydown);

      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        container.setAttribute("tabindex", "-1");
        container.focus();
      }
    },

    deactivate() {
      if (!active) {
        return;
      }

      active = false;
      container.removeEventListener("keydown", handleKeydown);

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }

      previousFocus = null;
    },
  };
}

/** Restores focus to a previously focused element. */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    element.focus();
  }
}
