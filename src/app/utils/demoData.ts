import { Calendar, LifeProfile } from '../types';
import { PartialDate } from '../types/common';

export interface DemoState {
  profile: LifeProfile;
  calendars: Calendar[];
  activeCalendarId?: string;
  weekColors?: { lived: string; remaining: string; extra: string };
  viewMode?: string;
}

const makeDate = (year: number, month?: number, day?: number): PartialDate => ({
  year,
  ...(month ? { month } : {}),
  ...(day ? { day } : {}),
});

export const buildDemoState = (): DemoState => {
  const profile: LifeProfile = {
    name: 'Elon Reeve Musk',
    dateOfBirth: makeDate(1971, 6, 28),
    realExpectancyYears: 80,
    extraExpectancyYears: 20,
  };

  const calendars: Calendar[] = [
    {
      id: '8b5b6a8e-6e9c-4bd6-8b4d-2b7b2c1a7a22',
      name: 'Elon Musk — biography-based life calendar',
      events: [
        {
          id: '2f8b2e9d-6a5f-4bdf-8b16-7b7b7d0d2a11',
          label: 'Born in Pretoria, South Africa',
          date: makeDate(1971, 6, 28),
          color: '#22c55e',
        },
        {
          id: 'b1d1c6f7-4aa6-4e0f-8f8b-2e9b6f4a7c10',
          label: 'Moved to Canada (start of North America chapter)',
          date: makeDate(1990),
          color: '#f59e0b',
        },
        {
          id: '1a6e2a8c-7b47-4f5b-9f1b-0d7a3d1e5f21',
          label: 'Started at Queen\'s University',
          date: makeDate(1990),
          color: '#8b5cf6',
        },
        {
          id: '7b1f2b6c-8b0c-4b29-9a8c-7a6f5d4c3b21',
          label: 'Transferred to University of Pennsylvania',
          date: makeDate(1992),
          color: '#8b5cf6',
        },
        {
          id: 'd3f6b9a1-3b2c-4d1e-9c8a-1b2c3d4e5f60',
          label: 'Graduated University of Pennsylvania (physics + economics)',
          date: makeDate(1995),
          color: '#8b5cf6',
        },
        {
          id: 'a4c2d0e9-8f1b-4c5a-9d2e-1f3a5b7c9d11',
          label: 'Founded Zip2',
          date: makeDate(1995),
          color: '#3b82f6',
        },
        {
          id: '4f0a2c9e-1b3d-4f2c-8d4a-5c6e7f8a9b10',
          label: 'Sold Zip2 (to Compaq)',
          date: makeDate(1999),
          color: '#ef4444',
        },
        {
          id: '6c3f1d2a-9b8c-4d5e-8f7a-1b2c3d4e5f12',
          label: 'Founded X.com',
          date: makeDate(1999, 3),
          color: '#3b82f6',
        },
        {
          id: '9e2b7a1c-5d4e-4b3a-8c9d-0e1f2a3b4c5d',
          label: 'X.com merged with Confinity (PayPal story begins)',
          date: makeDate(2000, 3),
          color: '#3b82f6',
        },
        {
          id: 'f2a7b8c9-0d1e-4f5a-9b8c-7d6e5f4a3b21',
          label: 'eBay acquired PayPal',
          date: makeDate(2002, 10, 3),
          color: '#ef4444',
        },
        {
          id: '0c7a1b2d-3e4f-4a5b-9c8d-7e6f5a4b3c21',
          label: 'Founded SpaceX',
          date: makeDate(2002),
          color: '#0ea5e9',
        },
        {
          id: '3d4e5f60-1a2b-4c5d-8e9f-0a1b2c3d4e5f',
          label: 'Became Tesla CEO (as commonly cited milestone)',
          date: makeDate(2008),
          color: '#0ea5e9',
        },
        {
          id: '8a9b0c1d-2e3f-4a5b-8c9d-0e1f2a3b4c5e',
          label: 'Co-founded OpenAI',
          date: makeDate(2015, 12),
          color: '#14b8a6',
        },
        {
          id: '5e4d3c2b-1a0f-4e5d-9c8b-7a6f5d4c3b2a',
          label: 'Founded Neuralink',
          date: makeDate(2016),
          color: '#14b8a6',
        },
        {
          id: '1f2e3d4c-5b6a-4c7d-8e9f-0a1b2c3d4e60',
          label: 'Founded The Boring Company',
          date: makeDate(2016),
          color: '#f97316',
        },
        {
          id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e61',
          label: 'Completed acquisition of Twitter',
          date: makeDate(2022, 10),
          color: '#a855f7',
        },
      ],
      periods: [
        {
          id: '7a6f5d4c-3b2a-4e1f-9c8b-0a1b2c3d4e50',
          label: 'Early life in South Africa',
          start: makeDate(1971, 6),
          end: makeDate(1989),
          color: '#64748b',
        },
        {
          id: '0a1b2c3d-4e5f-4a6b-8c9d-1e2f3a4b5c60',
          label: 'Canada + early university transition',
          start: makeDate(1990),
          end: makeDate(1992),
          color: '#8b5cf6',
        },
        {
          id: '2b3c4d5e-6f70-4a8b-9c0d-1e2f3a4b5c61',
          label: 'University of Pennsylvania',
          start: makeDate(1992),
          end: makeDate(1995),
          color: '#8b5cf6',
        },
        {
          id: '3c4d5e6f-7081-4b9c-0d1e-2f3a4b5c6d72',
          label: 'Zip2 era',
          start: makeDate(1995),
          end: makeDate(1999),
          color: '#3b82f6',
        },
        {
          id: '4d5e6f70-8192-4c0d-1e2f-3a4b5c6d7e83',
          label: 'X.com → PayPal era',
          start: makeDate(1999, 3),
          end: makeDate(2002, 10),
          color: '#2563eb',
        },
        {
          id: '5e6f7081-92a3-4d1e-2f3a-4b5c6d7e8f94',
          label: 'SpaceX',
          start: makeDate(2002),
          end: makeDate(2026, 3),
          color: '#0ea5e9',
        },
        {
          id: '6f708192-a3b4-4e2f-3a4b-5c6d7e8f9a05',
          label: 'Tesla leadership (public-facing era)',
          start: makeDate(2008),
          end: makeDate(2026, 3),
          color: '#06b6d4',
        },
        {
          id: '708192a3-b4c5-4f3a-4b5c-6d7e8f9a0b16',
          label: 'Twitter/X ownership',
          start: makeDate(2022, 10),
          end: makeDate(2026, 3),
          color: '#a855f7',
        },
      ],
      isVisible: true,
    },
  ];

  return {
    profile,
    calendars,
    activeCalendarId: '8b5b6a8e-6e9c-4bd6-8b4d-2b7b2c1a7a22',
    weekColors: {
      lived: '#0f2d52',
      remaining: '#7dd3fc',
      extra: '#e0f2fe',
    },
    viewMode: 'months',
  };
};
