import { PartialDate } from "./common";

export const DEFAULT_EVENT_COLOR = '#ef4444'; // red
export const DEFAULT_PERIOD_COLOR = '#3b82f6'; // blue

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
  isVisible?: boolean;
}
