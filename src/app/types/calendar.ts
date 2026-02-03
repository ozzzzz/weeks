import { PartialDate } from "./common";

export interface CalendarEvent {
  id: string;
  label: string;
  description?: string;
  date: PartialDate;
  color?: string;
}

export interface CalendarPeriod {
  id: string;
  label: string;
  description?: string;
  start: PartialDate;
  end: PartialDate;
  color?: string;
  pattern?: 'solid' | 'striped';
}

export interface Calendar {
  id: string;
  name: string;
  events: CalendarEvent[];
  periods: CalendarPeriod[];
  isVisible?: boolean;
}
