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
