import { PartialDate } from "./common";

export const REAL_LIFE_EXPECTANCY_YEARS = 73 as const;
export const EXTRA_LIFE_EXPECTANCY_YEARS = 27 as const;

export interface LifeProfile {
  name?: string;
  dateOfBirth: PartialDate;
  realExpectancyYears: number;
  extraExpectancyYears: number;
}

export type WeekStatus = 'lived' | 'remaining' | 'extra';

export interface LifePoint {
  index: number;
  date: Date;
  status: WeekStatus;
}
