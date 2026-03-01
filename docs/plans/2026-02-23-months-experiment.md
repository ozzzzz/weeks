# Months Experiment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a months visualization mode that can be toggled on the home page alongside the existing weeks view.

**Architecture:** Local `useState<'weeks' | 'months'>` in `page.tsx` controls which Three.js scene renders. A new `MonthsVisualization.tsx` (copied from `WeeksVisualization.tsx`) uses new month-based data utilities. Navigation receives `viewMode` to display appropriate counts and a toggle control.

**Tech Stack:** React 19, TypeScript, Three.js, Mantine UI, Redux Toolkit (no Redux changes needed), Vite

---

### Task 1: Add `MonthPoint` type to `src/app/types/life.ts`

**Files:**
- Modify: `src/app/types/life.ts`

**Step 1: Add the type**

Append after the `WeekPoint` interface (line 19):

```typescript
export interface MonthPoint {
  index: number;
  date: Date;
  status: WeekStatus;
}
```

**Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors

**Step 3: Commit**

```bash
git add src/app/types/life.ts
git commit -m "feat: add MonthPoint type"
```

---

### Task 2: Create `src/app/utils/months.ts`

**Files:**
- Create: `src/app/utils/months.ts`

**Step 1: Create the file**

```typescript
import { LifeProfile, MonthPoint, WeekStatus } from "../types";
import { MAX_TOTAL_EXPECTANCY_YEARS } from "./calculations";
import { partialDateToDate } from "./dates";

const MONTHS_PER_YEAR = 12;

const getMonthStatus = (index: number, livedMonths: number, realMonths: number): WeekStatus => {
  if (index <= livedMonths) return 'lived';
  if (index < realMonths) return 'remaining';
  return 'extra';
};

export const buildMonthPoints = (profile: LifeProfile): MonthPoint[] => {
  const totalYears = Math.min(
    profile.realExpectancyYears + profile.extraExpectancyYears,
    MAX_TOTAL_EXPECTANCY_YEARS,
  );

  const totalMonths = totalYears * MONTHS_PER_YEAR;
  if (totalMonths <= 0) return [];

  const birthDate = partialDateToDate(profile.dateOfBirth);
  const today = new Date();
  const livedMonths =
    (today.getFullYear() - birthDate.getFullYear()) * 12 +
    (today.getMonth() - birthDate.getMonth());
  const clampedLivedMonths = Math.max(0, Math.min(livedMonths, totalMonths - 1));
  const realMonths = profile.realExpectancyYears * MONTHS_PER_YEAR;

  const months: MonthPoint[] = [];

  for (let index = 0; index < totalMonths; index += 1) {
    months.push({
      index,
      date: new Date(birthDate.getFullYear(), birthDate.getMonth() + index, 1),
      status: getMonthStatus(index, clampedLivedMonths, realMonths),
    });
  }

  return months;
};
```

**Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors

**Step 3: Commit**

```bash
git add src/app/utils/months.ts
git commit -m "feat: add buildMonthPoints utility"
```

---

### Task 3: Add month calendar utilities to `src/app/utils/calendar.ts`

**Files:**
- Modify: `src/app/utils/calendar.ts`

**Step 1: Add `dateToMonthIndex` and `MonthOverlay` and `buildMonthOverlays`**

Append to the end of `src/app/utils/calendar.ts`:

```typescript
export const dateToMonthIndex = (date: PartialDate, birthDate: PartialDate): number => {
  const birth = partialDateToDate(birthDate);
  const target = partialDateToDate(date);
  return (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
};

export interface MonthOverlay {
  events: Array<CalendarEvent & { calendarName: string }>;
  periods: Array<CalendarPeriod & { calendarName: string }>;
}

export const buildMonthOverlays = (
  totalMonths: number,
  calendars: Calendar[],
  birthDate: PartialDate
): Map<number, MonthOverlay> => {
  const overlays = new Map<number, MonthOverlay>();

  const getOrCreate = (monthIndex: number): MonthOverlay => {
    let overlay = overlays.get(monthIndex);
    if (!overlay) {
      overlay = { events: [], periods: [] };
      overlays.set(monthIndex, overlay);
    }
    return overlay;
  };

  for (const calendar of calendars) {
    for (const event of calendar.events) {
      const monthIndex = dateToMonthIndex(event.date, birthDate);
      if (monthIndex >= 0 && monthIndex < totalMonths) {
        getOrCreate(monthIndex).events.push({ ...event, calendarName: calendar.name });
      }
    }

    for (const period of calendar.periods) {
      const startMonth = dateToMonthIndex(period.start, birthDate);
      const endMonth = dateToMonthIndex(period.end, birthDate);

      for (let i = Math.max(0, startMonth); i <= Math.min(totalMonths - 1, endMonth); i++) {
        getOrCreate(i).periods.push({ ...period, calendarName: calendar.name });
      }
    }
  }

  return overlays;
};
```

**Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors

**Step 3: Commit**

```bash
git add src/app/utils/calendar.ts
git commit -m "feat: add month calendar overlay utilities"
```

---

### Task 4: Create `MonthsVisualization.tsx`

**Files:**
- Create: `src/app/components/MonthsVisualization.tsx`

**Step 1: Copy**

```bash
cp src/app/components/WeeksVisualization.tsx src/app/components/MonthsVisualization.tsx
```

**Step 2: Apply targeted replacements**

Open `src/app/components/MonthsVisualization.tsx` and make these changes:

**2a. Replace imports (lines 8–9):**
```
// OLD:
import { buildWeekPoints } from "../utils/weeks";
import { buildWeekOverlays, dateToWeekIndex } from "../utils/calendar";

// NEW:
import { buildMonthPoints } from "../utils/months";
import { buildMonthOverlays, dateToMonthIndex } from "../utils/calendar";
```

**2b. Rename component and export (two occurrences near bottom):**
```
// OLD:
const WeeksVisualization = () => {
// NEW:
const MonthsVisualization = () => {

// OLD:
export default WeeksVisualization;
// NEW:
export default MonthsVisualization;
```

**2c. Replace data-building calls using replace_all on each identifier:**

| Find (exact) | Replace with |
|---|---|
| `buildWeekPoints(lifeProfile)` | `buildMonthPoints(lifeProfile)` |
| `const weeks = useMemo` | `const months = useMemo` |
| `[lifeProfile]` (the weeks memo dep — only the one right after `buildMonthPoints`) | *(no change needed, already correct)* |
| `buildWeekOverlays(weeks.length,` | `buildMonthOverlays(months.length,` |
| `const weekOverlays = useMemo` | `const monthOverlays = useMemo` |
| `[weeks.length,` | `[months.length,` |
| `const totalWeeks = weeks.length` | `const totalMonths = months.length` |
| `totalWeeks - 1,` | `totalMonths - 1,` |
| `> totalWeeks - 1` | `> totalMonths - 1` |
| `dateToWeekIndex(` | `dateToMonthIndex(` |
| `const weekIndices: number[]` | `const monthIndices: number[]` |
| `weekIndices.push(i)` | `monthIndices.push(i)` |
| `return { period, weekIndices }` | `return { period, monthIndices }` |
| `weekIndices: number[]` (in TypeScript predicate) | `monthIndices: number[]` |
| `hoveredEventWeekIndices` | `hoveredEventMonthIndices` |
| `weekIndex >= 0 && weekIndex < weeks.length` | `monthIndex >= 0 && monthIndex < months.length` |
| `weekOverlays.forEach` | `monthOverlays.forEach` |
| `], [weekOverlays` | `], [monthOverlays` |
| `index >= weeks.length` | `index >= months.length` |
| `const week = weeks[index]` | `const month = months[index]` |
| `const overlay = weekOverlays.get(index)` | `const overlay = monthOverlays.get(index)` |
| `Week ${formatDisplayDate(week.date)}` | `Month ${formatDisplayDate(month.date)}` |

> **Note:** `WeekStatus` stays as-is (shared type, no rename needed).

**Step 3: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: no errors. Fix any remaining `week`→`month` renames that typecheck flags.

**Step 4: Commit**

```bash
git add src/app/components/MonthsVisualization.tsx
git commit -m "feat: add MonthsVisualization Three.js scene"
```

---

### Task 5: Update `Navigation.tsx` to accept `viewMode` and show toggle

**Files:**
- Modify: `src/app/components/Navigation.tsx`

**Step 1: Update the component signature and imports**

Replace the current file content with:

```tsx
'use client';

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Anchor, Container, Group, Text } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { buildMonthPoints } from '../utils/months';
import { WeekStatus } from '../types';
import { MetaText } from './ui/text';

const statusOrder: WeekStatus[] = ['lived', 'remaining', 'extra'];

interface NavigationProps {
  viewMode: 'weeks' | 'months';
  onViewModeChange: (mode: 'weeks' | 'months') => void;
}

const Navigation = ({ viewMode, onViewModeChange }: NavigationProps) => {
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((t) => t.id === themeState.activeThemeId) ?? themeState.themes[0];

  const points = useMemo(
    () => viewMode === 'weeks' ? buildWeekPoints(lifeProfile) : buildMonthPoints(lifeProfile),
    [lifeProfile, viewMode],
  );

  const statusCounts = useMemo(
    () =>
      points.reduce<Record<WeekStatus, number>>(
        (acc, point) => {
          acc[point.status] += 1;
          return acc;
        },
        { lived: 0, remaining: 0, extra: 0 },
      ),
    [points],
  );

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group gap="md" align="center">
          <Text size="sm" fw={600} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            {viewMode === 'weeks' ? 'Weeks' : 'Months'}
          </Text>
          <Group gap={4}>
            <button
              onClick={() => onViewModeChange('weeks')}
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid currentColor',
                cursor: 'pointer',
                background: viewMode === 'weeks' ? '#1c1c1c' : 'transparent',
                color: viewMode === 'weeks' ? '#fff' : 'inherit',
              }}
            >
              W
            </button>
            <button
              onClick={() => onViewModeChange('months')}
              style={{
                fontSize: '0.7rem',
                padding: '1px 6px',
                borderRadius: 4,
                border: '1px solid currentColor',
                cursor: 'pointer',
                background: viewMode === 'months' ? '#1c1c1c' : 'transparent',
                color: viewMode === 'months' ? '#fff' : 'inherit',
              }}
            >
              M
            </button>
          </Group>
          {statusOrder.map((status) => (
            <Group key={status} gap={4}>
              <Text component="span" size="xs" style={{ color: colorForStatus(status), lineHeight: 1 }}>●</Text>
              <MetaText>
                {status.charAt(0).toUpperCase() + status.slice(1)} {statusCounts[status]}
              </MetaText>
            </Group>
          ))}
          <Group gap="sm" ml="auto" align="center">
            <Anchor component={Link} to="/about" size="sm" c="dimmed">
              About
            </Anchor>
            <ActionIcon
              component="a"
              href="https://github.com/ozzzzz/weeks"
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              color="gray"
              size="sm"
              aria-label="GitHub repository"
            >
              <IconBrandGithub size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Navigation;
```

**Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: error on `page.tsx` because `Navigation` now requires props — that's expected, fix in next task.

**Step 3: Commit**

```bash
git add src/app/components/Navigation.tsx
git commit -m "feat: add weeks/months toggle to Navigation"
```

---

### Task 6: Update `page.tsx` with viewMode state and conditional render

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Replace file content**

```tsx
import { useState } from 'react';
import Navigation from './components/Navigation';
import LifeMenu from './components/LifeMenu';
import WeeksVisualization from './components/WeeksVisualization';
import MonthsVisualization from './components/MonthsVisualization';

export default function Home() {
  const [viewMode, setViewMode] = useState<'weeks' | 'months'>('weeks');

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Navigation viewMode={viewMode} onViewModeChange={setViewMode} />
      <div className="relative flex-1 overflow-hidden">
        {viewMode === 'weeks' ? <WeeksVisualization /> : <MonthsVisualization />}
        <LifeMenu />
      </div>
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles clean**

```bash
npm run typecheck
```

Expected: no errors

**Step 3: Verify build succeeds**

```bash
npm run build
```

Expected: build completes with no errors

**Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire months experiment toggle on home page"
```

---

## Done

The experiment is complete. `npm run dev` should show a W/M toggle in the navigation bar. Switching to M renders the months scene (~1200 circles vs ~5200), calendar events and periods overlay correctly, and all settings remain unchanged.
