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
  events: CalendarEvent[];
  periods: CalendarPeriod[];
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
        getOrCreate(weekIndex).events.push(event);
      }
    }

    for (const period of calendar.periods) {
      const startWeek = dateToWeekIndex(period.start, birthDate);
      const endWeek = dateToWeekIndex(period.end, birthDate);

      for (let i = Math.max(0, startWeek); i <= Math.min(totalWeeks - 1, endWeek); i++) {
        getOrCreate(i).periods.push(period);
      }
    }
  }

  return overlays;
};
