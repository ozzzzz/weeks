import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CalendarEvent,
    CalendarPeriod,
    ColorTheme,
    LayoutState,
    LifeProfile,
    REAL_LIFE_EXPECTANCY_YEARS,
    EXTRA_LIFE_EXPECTANCY_YEARS,
    Calendar,
} from './types';
import { clampExpectancyYears } from './utils/calculations';

interface LifeState {
    profile: LifeProfile;
}

interface CalendarState {
    calendars: Calendar[];
    activeCalendarId: string | null;
}

interface ThemeState {
    themes: ColorTheme[];
    activeThemeId: string;
}

const today = new Date();
const defaultBirthDate = {
    year: today.getFullYear() - 30,
    month: today.getMonth() + 1,
    day: today.getDate(),
};

const defaultLifeState: LifeState = {
    profile: {
        dateOfBirth: defaultBirthDate,
        realExpectancyYears: REAL_LIFE_EXPECTANCY_YEARS,
        extraExpectancyYears: EXTRA_LIFE_EXPECTANCY_YEARS,
    },
};

const defaultCalendarsState: CalendarState = {
    calendars: [
        {
            id: 'cdf1a3f0-31f0-4a3f-94d0-c18f2c938853',
            name: 'Personal',
            events: [],
            periods: [],
            isVisible: true,
        },
        {
            id: 'f15cf47e-d612-42a9-8417-c7770526775f',
            name: 'Career',
            events: [],
            periods: [],
            isVisible: true,
        }
    ],
    activeCalendarId: 'cdf1a3f0-31f0-4a3f-94d0-c18f2c938853',
};

const defaultTheme: ColorTheme = {
    id: 'default',
    name: 'Sky',
    weeks: {
        lived: '#1e293b',
        current: '#22c55e',
        remaining: '#e2e8f0',
        extra: '#fcd34d',
    },
    accent: '#2563eb',
    background: '#f8fafc',
    text: '#0f172a',
};

const defaultThemeState: ThemeState = {
    themes: [defaultTheme],
    activeThemeId: defaultTheme.id,
};

const defaultLayoutState: LayoutState = {
    isMenuCollapsed: true,
};

const lifeSlice = createSlice({
    name: 'life',
    initialState: defaultLifeState,
    reducers: {
        setLifeProfile(state, action: PayloadAction<LifeProfile>) {
            const clamped = clampExpectancyYears(
                action.payload.realExpectancyYears,
                action.payload.extraExpectancyYears,
            );
            state.profile = {
                ...action.payload,
                realExpectancyYears: clamped.real,
                extraExpectancyYears: clamped.extra,
            };
        },
        setDateOfBirth(state, action: PayloadAction<LifeProfile['dateOfBirth']>) {
            state.profile.dateOfBirth = action.payload;
        },
        setName(state, action: PayloadAction<string>) {
            state.profile.name = action.payload;
        },
        setRealExpectancyYears(state, action: PayloadAction<number>) {
            const clamped = clampExpectancyYears(action.payload, state.profile.extraExpectancyYears);
            state.profile.realExpectancyYears = clamped.real;
            state.profile.extraExpectancyYears = clamped.extra;
        },
        setExtraExpectancyYears(state, action: PayloadAction<number>) {
            const clamped = clampExpectancyYears(state.profile.realExpectancyYears, action.payload);
            state.profile.realExpectancyYears = clamped.real;
            state.profile.extraExpectancyYears = clamped.extra;
        },
    },
});

type EventPayload = { calendarId: string; event: CalendarEvent };
type PeriodPayload = { calendarId: string; period: CalendarPeriod };

const calendarSlice = createSlice({
    name: 'calendar',
    initialState: defaultCalendarsState,
    reducers: {
        setActiveCalendar(state, action: PayloadAction<string | null>) {
            const exists = state.calendars.some((calendar) => calendar.id === action.payload);
            state.activeCalendarId = exists ? action.payload : state.activeCalendarId;
        },
        setCalendars(state, action: PayloadAction<Calendar[]>) {
            state.calendars = action.payload;
            state.activeCalendarId =
                action.payload.find((calendar) => calendar.id === state.activeCalendarId)?.id ??
                action.payload[0]?.id ??
                null;
        },
        upsertCalendar(state, action: PayloadAction<Calendar>) {
            const index = state.calendars.findIndex((calendar) => calendar.id === action.payload.id);
            if (index >= 0) {
                state.calendars[index] = action.payload;
                return;
            }
            state.calendars.push(action.payload);
            if (!state.activeCalendarId) {
                state.activeCalendarId = action.payload.id;
            }
        },
        removeCalendar(state, action: PayloadAction<string>) {
            state.calendars = state.calendars.filter((calendar) => calendar.id !== action.payload);
            if (state.activeCalendarId === action.payload) {
                state.activeCalendarId = state.calendars[0]?.id ?? null;
            }
        },
        upsertEvent(state, action: PayloadAction<EventPayload>) {
            const calendar = state.calendars.find((c) => c.id === action.payload.calendarId);
            if (!calendar) return;

            const index = calendar.events.findIndex((event) => event.id === action.payload.event.id);
            if (index >= 0) {
                calendar.events[index] = action.payload.event;
                return;
            }

            calendar.events.push(action.payload.event);
        },
        removeEvent(state, action: PayloadAction<{ calendarId: string; eventId: string }>) {
            const calendar = state.calendars.find((c) => c.id === action.payload.calendarId);
            if (!calendar) return;

            calendar.events = calendar.events.filter((event) => event.id !== action.payload.eventId);
        },
        upsertPeriod(state, action: PayloadAction<PeriodPayload>) {
            const calendar = state.calendars.find((c) => c.id === action.payload.calendarId);
            if (!calendar) return;

            const index = calendar.periods.findIndex((period) => period.id === action.payload.period.id);
            if (index >= 0) {
                calendar.periods[index] = action.payload.period;
                return;
            }

            calendar.periods.push(action.payload.period);
        },
        removePeriod(state, action: PayloadAction<{ calendarId: string; periodId: string }>) {
            const calendar = state.calendars.find((c) => c.id === action.payload.calendarId);
            if (!calendar) return;

            calendar.periods = calendar.periods.filter((period) => period.id !== action.payload.periodId);
        },
        clearCalendar(state, action: PayloadAction<string>) {
            const calendar = state.calendars.find((c) => c.id === action.payload);
            if (!calendar) return;

            calendar.events = [];
            calendar.periods = [];
        },
    },
});

const themeSlice = createSlice({
    name: 'theme',
    initialState: defaultThemeState,
    reducers: {
        setActiveTheme(state, action: PayloadAction<string>) {
            const exists = state.themes.some((theme) => theme.id === action.payload);
            state.activeThemeId = exists ? action.payload : state.activeThemeId;
        },
        upsertTheme(state, action: PayloadAction<ColorTheme>) {
            const index = state.themes.findIndex((theme) => theme.id === action.payload.id);
            if (index >= 0) {
                state.themes[index] = action.payload;
                return;
            }

            state.themes.push(action.payload);
        },
    },
});

const layoutSlice = createSlice({
    name: 'layout',
    initialState: defaultLayoutState,
    reducers: {
        toggleMenu(state) {
            state.isMenuCollapsed = !state.isMenuCollapsed;
        },
        setMenuCollapsed(state, action: PayloadAction<boolean>) {
            state.isMenuCollapsed = action.payload;
        },
    },
});

export const store = configureStore({
    reducer: {
        life: lifeSlice.reducer,
        calendar: calendarSlice.reducer,
        theme: themeSlice.reducer,
        layout: layoutSlice.reducer,
    },
    devTools: true,
});

export const lifeActions = lifeSlice.actions;
export const calendarActions = calendarSlice.actions;
export const themeActions = themeSlice.actions;
export const layoutActions = layoutSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
