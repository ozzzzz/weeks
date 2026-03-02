export const MAX_REAL_EXPECTANCY_YEARS = 100;
export const MAX_EXTRA_EXPECTANCY_YEARS = 50;

export const clampRealExpectancyYears = (years: number): number =>
    Math.max(0, Math.min(years, MAX_REAL_EXPECTANCY_YEARS));

export const clampExtraExpectancyYears = (years: number): number =>
    Math.max(0, Math.min(years, MAX_EXTRA_EXPECTANCY_YEARS));
