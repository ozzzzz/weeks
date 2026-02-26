import { Calendar, CalendarEvent, CalendarPeriod } from '../types/calendar';
import { PartialDate } from '../types/common';
import { partialDateToDate } from './dates';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export const dateToWeekIndex = (date: PartialDate, birthDate: PartialDate): number => {
  const birth = partialDateToDate(birthDate);
  const target = partialDateToDate(date);
  return Math.floor((target.getTime() - birth.getTime()) / MS_PER_WEEK);
};

export interface WeekOverlay {
  events: Array<CalendarEvent & { calendarName: string }>;
  periods: Array<CalendarPeriod & { calendarName: string }>;
}

export const buildWeekOverlays = (
  totalWeeks: number,
  calendars: Calendar[],
  birthDate: PartialDate
): Map<number, WeekOverlay> => {
  const overlays = new Map<number, WeekOverlay>();

  const getOrCreate = (weekIndex: number): WeekOverlay => {
    let overlay = overlays.get(weekIndex);
    if (!overlay) {
      overlay = { events: [], periods: [] };
      overlays.set(weekIndex, overlay);
    }
    return overlay;
  };

  for (const calendar of calendars) {
    for (const event of calendar.events) {
      const weekIndex = dateToWeekIndex(event.date, birthDate);
      if (weekIndex >= 0 && weekIndex < totalWeeks) {
        getOrCreate(weekIndex).events.push({ ...event, calendarName: calendar.name });
      }
    }

    for (const period of calendar.periods) {
      const startWeek = dateToWeekIndex(period.start, birthDate);
      const endWeek = dateToWeekIndex(period.end, birthDate);

      for (let i = Math.max(0, startWeek); i <= Math.min(totalWeeks - 1, endWeek); i++) {
        getOrCreate(i).periods.push({ ...period, calendarName: calendar.name });
      }
    }
  }

  return overlays;
};

export const dateToMonthIndex = (date: PartialDate, birthDate: PartialDate): number => {
  const birth = partialDateToDate(birthDate);
  const target = partialDateToDate(date);
  return (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
};

export interface MonthOverlay {
  events: Array<CalendarEvent & { calendarName: string }>;
  periods: Array<CalendarPeriod & { calendarName: string }>;
}

export const buildMonthOverlays = (
  totalMonths: number,
  calendars: Calendar[],
  birthDate: PartialDate
): Map<number, MonthOverlay> => {
  const overlays = new Map<number, MonthOverlay>();

  const getOrCreate = (monthIndex: number): MonthOverlay => {
    let overlay = overlays.get(monthIndex);
    if (!overlay) {
      overlay = { events: [], periods: [] };
      overlays.set(monthIndex, overlay);
    }
    return overlay;
  };

  for (const calendar of calendars) {
    for (const event of calendar.events) {
      const monthIndex = dateToMonthIndex(event.date, birthDate);
      if (monthIndex >= 0 && monthIndex < totalMonths) {
        getOrCreate(monthIndex).events.push({ ...event, calendarName: calendar.name });
      }
    }

    for (const period of calendar.periods) {
      const startMonth = dateToMonthIndex(period.start, birthDate);
      const endMonth = dateToMonthIndex(period.end, birthDate);

      for (let i = Math.max(0, startMonth); i <= Math.min(totalMonths - 1, endMonth); i++) {
        getOrCreate(i).periods.push({ ...period, calendarName: calendar.name });
      }
    }
  }

  return overlays;
};
