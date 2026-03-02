import { LifeProfile, LifePoint, WeekStatus } from "../types";
import { partialDateToDate } from "./dates";

const MONTHS_PER_YEAR = 12;

const getMonthStatus = (index: number, livedMonths: number, realMonths: number): WeekStatus => {
  if (index <= livedMonths) return 'lived';
  if (index < realMonths) return 'remaining';
  return 'extra';
};

export const buildMonthPoints = (profile: LifeProfile): LifePoint[] => {
  const totalYears = profile.realExpectancyYears + profile.extraExpectancyYears;
  const totalMonths = totalYears * MONTHS_PER_YEAR;
  if (totalMonths <= 0) return [];

  const birthDate = partialDateToDate(profile.dateOfBirth);
  const today = new Date();
  const livedMonths =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  const clampedLivedMonths = Math.max(0, Math.min(livedMonths, totalMonths - 1));
  const realMonths = profile.realExpectancyYears * MONTHS_PER_YEAR;

  const months: LifePoint[] = [];

  for (let index = 0; index < totalMonths; index += 1) {
    months.push({
      index,
      date: new Date(birthDate.getFullYear(), birthDate.getMonth() + index, 1),
      status: getMonthStatus(index, clampedLivedMonths, realMonths),
    });
  }

  return months;
};
