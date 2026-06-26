import type { CalendarInstance, CalendarMagic } from "@ailuracode/alpine-calendar";
import type { Alpine } from "alpinejs";

type CalendarDemoData = {
  cal: CalendarInstance | null;
  init(): void;
};

type CalendarDemoComponent = CalendarDemoData & {
  $calendar: CalendarMagic;
};

export function registerCalendarDemo(Alpine: Alpine): void {
  Alpine.data(
    "calendarDemo",
    (): CalendarDemoData => ({
      cal: null,
      init(this: CalendarDemoComponent) {
        this.cal = this.$calendar({
          weekStartsOn: 1,
          mode: "single",
          disabled: { dayOfWeek: [0, 6] },
        });
      },
    })
  );
}
