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
  const today = new Date();
  const todayDate: PartialDate = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  const profile: LifeProfile = {
    name: 'Demo User',
    dateOfBirth: makeDate(1990, 6, 15),
    realExpectancyYears: 80,
    extraExpectancyYears: 20,
  };

  const beyondLifeYear =
    profile.dateOfBirth.year + profile.realExpectancyYears + profile.extraExpectancyYears + 5;

  const calendars: Calendar[] = [
    {
      id: 'calendar-personal',
      name: 'Personal',
      events: [
        {
          id: 'event-born',
          label: 'Born',
          date: makeDate(1990, 6, 15),
          color: '#16a34a',
        },
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
          id: 'event-today',
          label: 'Today checkpoint',
          date: todayDate,
          color: '#f97316',
        },
        {
          id: 'event-future',
          label: 'Future trip',
          date: makeDate(today.getFullYear() + 4, 7, 1),
          color: '#f59e0b',
        },
        {
          id: 'event-before-birth',
          label: 'Before birth (ignored)',
          date: makeDate(1985, 1, 1),
          color: '#ef4444',
        },
      ],
      periods: [
        {
          id: 'period-childhood',
          label: 'Childhood (year only)',
          start: makeDate(1990),
          end: makeDate(2002),
          color: '#22c55e',
          pattern: 'solid',
        },
        {
          id: 'period-school',
          label: 'School (year + month)',
          start: makeDate(2002, 9),
          end: makeDate(2008, 6),
          color: '#3b82f6',
          pattern: 'striped',
        },
        {
          id: 'period-long-plan',
          label: 'Plan beyond life expectancy',
          start: makeDate(2060),
          end: makeDate(beyondLifeYear, 12, 31),
          color: '#14b8a6',
          pattern: 'solid',
        },
      ],
      isVisible: true,
    },
    {
      id: 'calendar-career',
      name: 'Career',
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
          color: '#6366f1',
        },
      ],
      periods: [
        {
          id: 'period-university',
          label: 'University',
          start: makeDate(2008),
          end: makeDate(2012),
          color: '#0ea5e9',
          pattern: 'solid',
        },
        {
          id: 'period-corporate',
          label: 'Corporate job',
          start: makeDate(2012, 6),
          end: makeDate(2016, 3),
          color: '#1d4ed8',
          pattern: 'solid',
        },
        {
          id: 'period-startup',
          label: 'Startup era (overlaps)',
          start: makeDate(2015, 1),
          end: makeDate(2019, 12),
          color: '#9333ea',
          pattern: 'striped',
        },
      ],
      isVisible: true,
    },
    {
      id: 'calendar-family',
      name: 'Family',
      events: [
        {
          id: 'event-wedding',
          label: 'Wedding',
          date: makeDate(2014, 8, 23),
          color: '#f472b6',
        },
        {
          id: 'event-child',
          label: 'Child born',
          date: makeDate(2018, 4, 9),
          color: '#fb7185',
        },
      ],
      periods: [
        {
          id: 'period-parenting',
          label: 'Parenting journey',
          start: makeDate(2018, 4, 9),
          end: makeDate(2038, 4, 9),
          color: '#f97316',
          pattern: 'solid',
        },
      ],
      isVisible: true,
    },
    {
      id: 'calendar-health',
      name: 'Health',
      events: [
        {
          id: 'event-injury',
          label: 'Minor injury',
          date: makeDate(2020, 2, 15),
          color: '#ef4444',
        },
      ],
      periods: [
        {
          id: 'period-training',
          label: 'Marathon training (short)',
          start: makeDate(2020, 1, 1),
          end: makeDate(2020, 3, 1),
          color: '#f43f5e',
          pattern: 'striped',
        },
      ],
      isVisible: true,
    },
  ];

  return { profile, calendars, activeCalendarId: calendars[0]?.id };
};
