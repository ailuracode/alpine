import type AlpineType from "alpinejs";
import type { Day, Locale } from "date-fns";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday as isTodayDate,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";

export type CalendarMode = "single" | "range" | "multiple";

export type CalendarDateRange = {
  from?: Date;
  to?: Date;
};

export type CalendarSelection = Date | Date[] | CalendarDateRange | null;

export interface CalendarOptions {
  locale?: Locale;
  weekStartsOn?: Day;
  minDate?: Date;
  maxDate?: Date;
  mode?: CalendarMode;
  month?: Date;
  selected?: CalendarSelection;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
}

export interface CalendarInstance {
  month: Date;
  mode: CalendarMode;
  selected: CalendarSelection;
  locale: Locale;
  weekStartsOn: Day;
  readonly weeks: CalendarDay[][];
  readonly weekdayLabels: string[];
  prevMonth(): void;
  nextMonth(): void;
  goToMonth(date: Date): void;
  goToToday(): void;
  select(date: Date | null): void;
  clear(): void;
  isSelected(date: Date): boolean;
  isDisabled(date: Date): boolean;
  isToday(date: Date): boolean;
  isSameMonth(date: Date, month?: Date): boolean;
  isInRange(date: Date): boolean;
  isRangeStart(date: Date): boolean;
  isRangeEnd(date: Date): boolean;
  format(date: Date, pattern: string): string;
  formatMonth(month?: Date): string;
  formatYear(month?: Date): string;
}

export type CalendarMagic = (options?: CalendarOptions) => CalendarInstance;

type ResolvedCalendarOptions = {
  locale: Locale;
  weekStartsOn: Day;
  minDate?: Date;
  maxDate?: Date;
  mode: CalendarMode;
  month: Date;
  selected: CalendarSelection;
};

function normalizeDate(date: Date): Date {
  return startOfDay(date);
}

function normalizeRange(range: CalendarDateRange): CalendarDateRange {
  return {
    from: range.from ? normalizeDate(range.from) : undefined,
    to: range.to ? normalizeDate(range.to) : undefined,
  };
}

function normalizeSelection(selection: CalendarSelection, mode: CalendarMode): CalendarSelection {
  if (selection === null) {
    return null;
  }

  if (mode === "single") {
    return selection instanceof Date ? normalizeDate(selection) : null;
  }

  if (mode === "multiple") {
    if (!Array.isArray(selection)) {
      return [];
    }

    return selection.map(normalizeDate);
  }

  if (typeof selection === "object" && !Array.isArray(selection) && !(selection instanceof Date)) {
    return normalizeRange(selection);
  }

  return null;
}

function resolveOptions(options: CalendarOptions = {}): ResolvedCalendarOptions {
  return {
    locale: options.locale ?? enUS,
    weekStartsOn: options.weekStartsOn ?? 0,
    minDate: options.minDate ? normalizeDate(options.minDate) : undefined,
    maxDate: options.maxDate ? normalizeDate(options.maxDate) : undefined,
    mode: options.mode ?? "single",
    month: startOfMonth(options.month ?? new Date()),
    selected: normalizeSelection(options.selected ?? null, options.mode ?? "single"),
  };
}

function getMonthDays(month: Date, weekStartsOn: Day): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn });

  return eachDayOfInterval({ start, end });
}

function chunkWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

function getWeekdayLabels(weekStartsOn: Day, locale: Locale): string[] {
  const start = startOfWeek(new Date(), { weekStartsOn });

  return Array.from({ length: 7 }, (_, index) =>
    format(addDays(start, index), "EEEEEE", { locale })
  );
}

function selectSingleDate(calendar: CalendarInstance, day: Date): void {
  calendar.selected = day;
}

function selectMultipleDate(calendar: CalendarInstance, day: Date): void {
  const current = Array.isArray(calendar.selected) ? [...calendar.selected] : [];
  const existingIndex = current.findIndex((value) => isSameDay(value, day));

  if (existingIndex >= 0) {
    current.splice(existingIndex, 1);
  } else {
    current.push(day);
  }

  calendar.selected = current;
}

function selectRangeDate(calendar: CalendarInstance, day: Date): void {
  const range = (calendar.selected as CalendarDateRange | null) ?? {};

  if (!range.from || (range.from && range.to)) {
    calendar.selected = { from: day, to: undefined };
    return;
  }

  if (isBefore(day, range.from)) {
    calendar.selected = { from: day, to: range.from };
    return;
  }

  calendar.selected = { from: range.from, to: day };
}

function isSingleSelected(selected: CalendarSelection, day: Date): boolean {
  return selected instanceof Date ? isSameDay(selected, day) : false;
}

function isMultipleSelected(selected: CalendarSelection, day: Date): boolean {
  return Array.isArray(selected) ? selected.some((value) => isSameDay(value, day)) : false;
}

function isRangeEndpointSelected(selected: CalendarSelection, day: Date): boolean {
  const range = selected as CalendarDateRange | null;

  if (!range) {
    return false;
  }

  return (
    (range.from ? isSameDay(range.from, day) : false) ||
    (range.to ? isSameDay(range.to, day) : false)
  );
}

function isDateDisabled(day: Date, minDate: Date | undefined, maxDate: Date | undefined): boolean {
  if (minDate && isBefore(day, minDate)) {
    return true;
  }

  if (maxDate && isAfter(day, maxDate)) {
    return true;
  }

  return false;
}

/** Creates an independent calendar logic instance backed by date-fns. */
export function createCalendar(options: CalendarOptions = {}): CalendarInstance {
  const config = resolveOptions(options);

  const calendar: CalendarInstance = {
    month: config.month,
    mode: config.mode,
    selected: config.selected,
    locale: config.locale,
    weekStartsOn: config.weekStartsOn,

    get weeks() {
      const days = getMonthDays(this.month, this.weekStartsOn);

      return chunkWeeks(days).map((week) =>
        week.map((date) => ({
          date,
          isCurrentMonth: isSameMonth(date, this.month),
          isToday: isTodayDate(date),
          isSelected: this.isSelected(date),
          isDisabled: this.isDisabled(date),
          isRangeStart: this.isRangeStart(date),
          isRangeEnd: this.isRangeEnd(date),
          isInRange: this.isInRange(date),
        }))
      );
    },

    get weekdayLabels() {
      return getWeekdayLabels(this.weekStartsOn, this.locale);
    },

    prevMonth() {
      this.month = subMonths(this.month, 1);
    },

    nextMonth() {
      this.month = addMonths(this.month, 1);
    },

    goToMonth(date: Date) {
      this.month = startOfMonth(date);
    },

    goToToday() {
      this.goToMonth(new Date());
    },

    select(date: Date | null) {
      if (date === null) {
        this.clear();
        return;
      }

      const day = normalizeDate(date);

      if (this.isDisabled(day)) {
        return;
      }

      if (this.mode === "single") {
        selectSingleDate(this, day);
        return;
      }

      if (this.mode === "multiple") {
        selectMultipleDate(this, day);
        return;
      }

      selectRangeDate(this, day);
    },

    clear() {
      this.selected = this.mode === "multiple" ? [] : null;
    },

    isSelected(date: Date) {
      const day = normalizeDate(date);

      if (this.mode === "single") {
        return isSingleSelected(this.selected, day);
      }

      if (this.mode === "multiple") {
        return isMultipleSelected(this.selected, day);
      }

      return isRangeEndpointSelected(this.selected, day);
    },

    isDisabled(date: Date) {
      return isDateDisabled(normalizeDate(date), config.minDate, config.maxDate);
    },

    isToday(date: Date) {
      return isTodayDate(date);
    },

    isSameMonth(date: Date, month?: Date) {
      return isSameMonth(date, month ?? calendar.month);
    },

    isInRange(date: Date) {
      if (this.mode !== "range") {
        return false;
      }

      const range = this.selected as CalendarDateRange | null;

      if (!(range?.from && range.to)) {
        return false;
      }

      const day = normalizeDate(date);

      return (
        isWithinInterval(day, { start: range.from, end: range.to }) &&
        !isSameDay(day, range.from) &&
        !isSameDay(day, range.to)
      );
    },

    isRangeStart(date: Date) {
      const range = this.selected as CalendarDateRange | null;
      return range?.from ? isSameDay(date, range.from) : false;
    },

    isRangeEnd(date: Date) {
      const range = this.selected as CalendarDateRange | null;
      return range?.to ? isSameDay(date, range.to) : false;
    },

    format(date: Date, pattern: string) {
      return format(date, pattern, { locale: this.locale });
    },

    formatMonth(month?: Date) {
      const value = month ?? calendar.month;
      return format(value, "LLLL yyyy", { locale: calendar.locale });
    },

    formatYear(month?: Date) {
      const value = month ?? calendar.month;
      return format(value, "yyyy", { locale: calendar.locale });
    },
  };

  return calendar;
}

/** Builds callable `$calendar` magic that returns independent calendar instances. */
export function createCalendarMagic(): CalendarMagic {
  return (options?: CalendarOptions) => createCalendar(options);
}

/** Alpine.js calendar plugin. Registers callable magic `$calendar`. */
export default function calendarPlugin(Alpine: AlpineType.Alpine): void {
  Alpine.magic("calendar", () => createCalendarMagic());
}

declare global {
  namespace Alpine {
    interface Magics<T> {
      $calendar: CalendarMagic;
    }
  }
}
