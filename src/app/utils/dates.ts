import { PartialDate } from "../types";

export const partialDateToDate = (partial: PartialDate) => {
  const month = (partial.month ?? 1) - 1;
  const day = partial.day ?? 1;
  return new Date(partial.year, month, day);
};

export const formatDisplayDate = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatPartialDate = (date: PartialDate) => {
  const year = date.year.toString();
  if (!date.month) return year;
  const month = date.month.toString().padStart(2, '0');
  if (!date.day) return `${year}-${month}`;
  const day = date.day.toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateAge = (dateOfBirth: PartialDate, today = new Date()) => {
  const birthDate = partialDateToDate(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasHadBirthdayThisYear = (
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
  );

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return Math.max(age, 0);
};
