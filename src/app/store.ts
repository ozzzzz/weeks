import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CalendarEvent,
    CalendarPeriod,
    LayoutState,
    LifeProfile,
    REAL_LIFE_EXPECTANCY_YEARS,
    EXTRA_LIFE_EXPECTANCY_YEARS,
    Calendar,
    WeekColors,
} from './types';
import { clampRealExpectancyYears, clampExtraExpectancyYears } from './utils/calculations';

export const defaultWeekColors: WeekColors = {
    lived: '#0f2d52',
    remaining: '#7dd3fc',
    extra: '#e0f2fe',
};

interface LifeState {
    profile: LifeProfile;
    weekColors: WeekColors;
}

interface CalendarState {
    calendars: Calendar[];
    activeCalendarId: string | null;
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
    weekColors: defaultWeekColors,
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

const defaultLayoutState: LayoutState = {
    isMenuCollapsed: true,
    viewMode: 'weeks',
    focusWeekIndex: null,
    resetView: false,
    hoveredEventId: null,
    hoveredPeriodId: null,
};

const lifeSlice = createSlice({
    name: 'life',
    initialState: defaultLifeState,
    reducers: {
        setLifeProfile(state, action: PayloadAction<LifeProfile>) {
            state.profile = {
                ...action.payload,
                realExpectancyYears: clampRealExpectancyYears(action.payload.realExpectancyYears),
                extraExpectancyYears: clampExtraExpectancyYears(action.payload.extraExpectancyYears),
            };
        },
        setDateOfBirth(state, action: PayloadAction<LifeProfile['dateOfBirth']>) {
            state.profile.dateOfBirth = action.payload;
        },
        setName(state, action: PayloadAction<string>) {
            state.profile.name = action.payload;
        },
        setRealExpectancyYears(state, action: PayloadAction<number>) {
            state.profile.realExpectancyYears = clampRealExpectancyYears(action.payload);
        },
        setExtraExpectancyYears(state, action: PayloadAction<number>) {
            state.profile.extraExpectancyYears = clampExtraExpectancyYears(action.payload);
        },
        setWeekColors(state, action: PayloadAction<WeekColors>) {
            state.weekColors = action.payload;
        },
        setWeekColor(state, action: PayloadAction<{ key: keyof WeekColors; value: string }>) {
            state.weekColors[action.payload.key] = action.payload.value;
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
        setFocusWeek(state, action: PayloadAction<number | null>) {
            state.focusWeekIndex = action.payload;
        },
        setResetView(state, action: PayloadAction<boolean>) {
            state.resetView = action.payload;
        },
        setHoveredEvent(state, action: PayloadAction<string | null>) {
            state.hoveredEventId = action.payload;
            if (action.payload) state.hoveredPeriodId = null;
        },
        setHoveredPeriod(state, action: PayloadAction<string | null>) {
            state.hoveredPeriodId = action.payload;
            if (action.payload) state.hoveredEventId = null;
        },
        setViewMode(state, action: PayloadAction<'weeks' | 'months'>) {
            state.viewMode = action.payload;
        },
    },
});

export const store = configureStore({
    reducer: {
        life: lifeSlice.reducer,
        calendar: calendarSlice.reducer,
        layout: layoutSlice.reducer,
    },
    devTools: true,
});

export const lifeActions = lifeSlice.actions;
export const calendarActions = calendarSlice.actions;
export const layoutActions = layoutSlice.actions;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
