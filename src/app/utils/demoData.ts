import { Calendar, LifeProfile } from '../types';
import { PartialDate } from '../types/common';

export interface DemoState {
  profile: LifeProfile;
  calendars: Calendar[];
  activeCalendarId?: string;
}

const makeDate = (year: number, month?: number, day?: number): PartialDate => ({
  year,
  ...(month ? { month } : {}),
  ...(day ? { day } : {}),
});

export const buildDemoState = (): DemoState => {
  const profile: LifeProfile = {
    name: 'Demo User',
    dateOfBirth: makeDate(1990, 6, 15),
    realExpectancyYears: 80,
    extraExpectancyYears: 20,
  };

  const calendars: Calendar[] = [
    {
      id: 'calendar-personal',
      name: 'Personal ✨',
      events: [
        {
          id: 'event-move',
          label: 'Moved to new city',
          date: makeDate(1998, 9),
          color: '#0ea5e9',
        },
        {
          id: 'event-year-only',
          label: 'Learned to code (year only)',
          date: makeDate(2004),
          color: '#a855f7',
        },
        {
          id: 'event-future',
          label: 'Future trip',
          date: makeDate(2030, 7, 1),
          color: '#f59e0b',
        },
      ],
      periods: [
        {
          id: 'period-childhood',
          label: 'Childhood (year only)',
          start: makeDate(1990),
          end: makeDate(2002),
          color: '#22c55e',
        },
        {
          id: 'period-school',
          label: 'School (year + month)',
          start: makeDate(2002, 9),
          end: makeDate(2008, 6),
          color: '#3b82f6',
        },
        {
          id: 'period-long-plan',
          label: 'Plan beyond',
          start: makeDate(2040),
          end: makeDate(2055, 12, 31),
          color: '#f9a8d4',
        },
      ],
      isVisible: true,
    },
    {
      id: 'calendar-career',
      name: 'Career 💼',
      events: [
        {
          id: 'event-first-job',
          label: 'First job',
          date: makeDate(2012, 6, 1),
          color: '#10b981',
        },
        {
          id: 'event-promotion',
          label: 'Promotion',
          date: makeDate(2016, 3),
          color: '#f59e0b',
        },
      ],
      periods: [
        {
          id: 'period-university',
          label: 'University',
          start: makeDate(2008),
          end: makeDate(2012),
          color: '#0ea5e9',
        },
        {
          id: 'period-corporate',
          label: 'Corporate job',
          start: makeDate(2012, 6),
          end: makeDate(2016, 3),
          color: '#1d4ed8',
        },
        {
          id: 'period-startup',
          label: 'Startup era (overlaps)',
          start: makeDate(2015, 1),
          end: makeDate(2019, 12),
          color: '#86efac',
        },
      ],
      isVisible: true,
    },
  ];

  return { profile, calendars, activeCalendarId: 'calendar-career' };
};
