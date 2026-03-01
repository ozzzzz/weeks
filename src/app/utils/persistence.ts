import { Calendar, LifeProfile, WeekColors } from '../types';
import { defaultWeekColors } from '../store';

const STORAGE_KEY = 'weeks:state:v1';

export interface PersistedState {
  profile: LifeProfile;
  weekColors: WeekColors;
  calendars: Calendar[];
  activeCalendarId: string | null;
  viewMode: 'weeks' | 'months';
}

export const savePersistedState = (state: PersistedState) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save persisted state', error);
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPartialDate = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  return typeof value.year === 'number';
};

const isLifeProfile = (value: unknown): value is LifeProfile => {
  if (!isObject(value)) return false;
  return (
    isPartialDate(value.dateOfBirth) &&
    typeof value.realExpectancyYears === 'number' &&
    typeof value.extraExpectancyYears === 'number'
  );
};

const isCalendar = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.events) &&
    Array.isArray(value.periods)
  );
};

const isWeekColors = (value: unknown): value is WeekColors => {
  if (!isObject(value)) return false;
  return (
    typeof value.lived === 'string' &&
    typeof value.remaining === 'string' &&
    typeof value.extra === 'string'
  );
};

// Accepts both current and legacy formats (weekColors optional, isMenuCollapsed ignored)
const isValidRaw = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) return false;
  return (
    isLifeProfile(value.profile) &&
    Array.isArray(value.calendars) &&
    (value.calendars as unknown[]).every(isCalendar) &&
    (value.activeCalendarId === null || typeof value.activeCalendarId === 'string') &&
    (value.viewMode === undefined || value.viewMode === 'weeks' || value.viewMode === 'months')
  );
};

const normalizePersistedState = (raw: Record<string, unknown>): PersistedState => ({
  profile: raw.profile as LifeProfile,
  weekColors: isWeekColors(raw.weekColors) ? raw.weekColors : defaultWeekColors,
  calendars: (raw.calendars as Record<string, unknown>[]).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    events: c.events as Calendar['events'],
    periods: c.periods as Calendar['periods'],
    isVisible: typeof c.isVisible === 'boolean' ? c.isVisible : true,
  })),
  activeCalendarId: (raw.activeCalendarId as string | null) ?? null,
  viewMode: (raw.viewMode as 'weeks' | 'months') ?? 'weeks',
});

export const parsePersistedState = (json: string): PersistedState | null => {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!isValidRaw(parsed)) return null;
    return normalizePersistedState(parsed);
  } catch {
    return null;
  }
};

export const loadPersistedState = (): PersistedState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parsePersistedState(raw);
  } catch (error) {
    console.warn('Failed to load persisted state', error);
    return null;
  }
};

export const downloadPersistedState = (state: PersistedState) => {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `weeks-settings-${stamp}.json`;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
