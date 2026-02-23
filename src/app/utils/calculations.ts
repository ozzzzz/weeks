import { EXTRA_LIFE_EXPECTANCY_YEARS, REAL_LIFE_EXPECTANCY_YEARS } from "../types";

export const MAX_TOTAL_EXPECTANCY_YEARS = REAL_LIFE_EXPECTANCY_YEARS + EXTRA_LIFE_EXPECTANCY_YEARS;

export const clampExpectancyYears = (realYears: number, extraYears: number) => {
    const safeReal = Math.max(0, Math.min(realYears, MAX_TOTAL_EXPECTANCY_YEARS));
    const safeExtra = Math.max(0, Math.min(extraYears, MAX_TOTAL_EXPECTANCY_YEARS - safeReal));
    return { real: safeReal, extra: safeExtra };
};
