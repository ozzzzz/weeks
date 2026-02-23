import { Calendar, LifeProfile } from '../types';

const STORAGE_KEY = 'weeks:state:v1';

export interface PersistedState {
  profile: LifeProfile;
  calendars: Calendar[];
  activeCalendarId: string | null;
  isMenuCollapsed: boolean;
}

export const loadPersistedState = (): PersistedState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.warn('Failed to load persisted state', error);
    return null;
  }
};

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

const isCalendar = (value: unknown): value is Calendar => {
  if (!isObject(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Array.isArray(value.events) &&
    Array.isArray(value.periods)
  );
};

export const isPersistedState = (value: unknown): value is PersistedState => {
  if (!isObject(value)) return false;

  return (
    isLifeProfile(value.profile) &&
    Array.isArray(value.calendars) &&
    value.calendars.every(isCalendar) &&
    (value.activeCalendarId === null || typeof value.activeCalendarId === 'string') &&
    typeof value.isMenuCollapsed === 'boolean'
  );
};

export const parsePersistedState = (json: string): PersistedState | null => {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!isPersistedState(parsed)) return null;
    return parsed;
  } catch {
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
