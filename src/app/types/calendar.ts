import { PartialDate } from "./common";

export const DEFAULT_EVENT_COLOR = '#ef4444'; // red
export const DEFAULT_PERIOD_COLOR = '#fca5a5'; // pastel red

export interface CalendarEvent {
  id: string;
  label: string;
  date: PartialDate;
  color: string;
}

export interface CalendarPeriod {
  id: string;
  label: string;
  start: PartialDate;
  end: PartialDate;
  color: string;
}

export interface Calendar {
  id: string;
  name: string;
  events: CalendarEvent[];
  periods: CalendarPeriod[];
  isVisible: boolean;
}
