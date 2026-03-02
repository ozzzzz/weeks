import { LifeProfile, LifePoint, WeekStatus } from "../types";
import { partialDateToDate } from "./dates";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const WEEKS_PER_YEAR = 52;

const getWeekStatus = (index: number, livedWeeks: number, realWeeks: number): WeekStatus => {
  if (index <= livedWeeks) return 'lived';
  if (index < realWeeks) return 'remaining';
  return 'extra';
};

export const buildWeekPoints = (profile: LifeProfile): LifePoint[] => {
  const totalYears = profile.realExpectancyYears + profile.extraExpectancyYears;
  const totalWeeks = totalYears * WEEKS_PER_YEAR;
  if (totalWeeks <= 0) return [];

  const birthDate = partialDateToDate(profile.dateOfBirth);
  const today = new Date();
  const livedWeeks = Math.floor((today.getTime() - birthDate.getTime()) / MS_PER_WEEK);
  const clampedLivedWeeks = Math.max(0, Math.min(livedWeeks, totalWeeks - 1));
  const realWeeks = profile.realExpectancyYears * WEEKS_PER_YEAR;

  const weeks: LifePoint[] = [];

  for (let index = 0; index < totalWeeks; index += 1) {
    weeks.push({
      index,
      date: new Date(birthDate.getTime() + index * MS_PER_WEEK),
      status: getWeekStatus(index, clampedLivedWeeks, realWeeks),
    });
  }

  return weeks;
};
