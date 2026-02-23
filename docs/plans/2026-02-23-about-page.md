# About Page & GitHub Icon Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an About page and a GitHub icon link to the navigation, using react-router-dom with HashRouter for static GitHub Pages hosting.

**Architecture:** Install react-router-dom, wrap the app in HashRouter, add two routes (`/` and `/about`), update Navigation to include links and a GitHub icon, and create the About page with Mantine components.

**Tech Stack:** React 19, Vite, Mantine 8, @tabler/icons-react, react-router-dom (HashRouter), TypeScript

> Note: This project has no test framework set up — skip all test steps.

---

### Task 1: Install react-router-dom

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install the package**

```bash
npm install react-router-dom
```

Expected: `react-router-dom` appears in `dependencies` in `package.json`.

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install react-router-dom"
```

---

### Task 2: Set up HashRouter and routes in App.tsx

**Files:**
- Modify: `src/App.tsx`
- Create: `src/app/about.tsx` (empty placeholder for now — just a stub so the import resolves)

**Step 1: Create a stub About page**

Create `src/app/about.tsx`:

```tsx
export default function About() {
  return null;
}
```

**Step 2: Update App.tsx to add routing**

Replace the contents of `src/App.tsx` with:

```tsx
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import Home from './app/page';
import About from './app/about';
import { calendarActions, layoutActions, lifeActions, store } from './app/store';
import { loadPersistedState, savePersistedState } from './app/utils/persistence';

const App = () => {
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) {
      store.dispatch(lifeActions.setLifeProfile(persisted.profile));
      store.dispatch(calendarActions.setCalendars(persisted.calendars));
      store.dispatch(calendarActions.setActiveCalendar(persisted.activeCalendarId));
      store.dispatch(layoutActions.setMenuCollapsed(persisted.isMenuCollapsed));
    }

    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      savePersistedState({
        profile: state.life.profile,
        calendars: state.calendar.calendars,
        activeCalendarId: state.calendar.activeCalendarId,
        isMenuCollapsed: state.layout.isMenuCollapsed,
      });
    });

    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <MantineProvider defaultColorScheme="light">
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </HashRouter>
      </MantineProvider>
    </Provider>
  );
};

export default App;
```

**Step 3: Verify the app compiles**

```bash
npm run typecheck
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/App.tsx src/app/about.tsx
git commit -m "feat: add HashRouter with / and /about routes"
```

---

### Task 3: Update Navigation with links and GitHub icon

**Files:**
- Modify: `src/app/components/Navigation.tsx`

**Step 1: Update Navigation.tsx**

Replace the contents of `src/app/components/Navigation.tsx` with:

```tsx
'use client';

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Anchor, Container, Group, Text } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { useAppSelector } from '../hooks';
import { buildWeekPoints } from '../utils/weeks';
import { WeekStatus } from '../types';
import { MetaText } from './ui/text';

const statusOrder: WeekStatus[] = ['lived', 'remaining', 'extra'];

const Navigation = () => {
  const lifeProfile = useAppSelector((state) => state.life.profile);
  const themeState = useAppSelector((state) => state.theme);
  const activeTheme = themeState.themes.find((t) => t.id === themeState.activeThemeId) ?? themeState.themes[0];

  const weeks = useMemo(() => buildWeekPoints(lifeProfile), [lifeProfile]);

  const statusCounts = useMemo(
    () =>
      weeks.reduce<Record<WeekStatus, number>>(
        (acc, week) => {
          acc[week.status] += 1;
          return acc;
        },
        { lived: 0, remaining: 0, extra: 0 },
      ),
    [weeks],
  );

  const colorForStatus = (status: WeekStatus) => activeTheme?.weeks[status] ?? '#ccc';

  return (
    <header>
      <Container fluid px="lg" py="xs">
        <Group gap="md" align="center">
          <Text size="sm" fw={600} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Weeks
          </Text>
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

**Step 2: Verify**

```bash
npm run typecheck
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/app/components/Navigation.tsx
git commit -m "feat: add About link and GitHub icon to navigation"
```

---

### Task 4: Implement the About page

**Files:**
- Modify: `src/app/about.tsx`

**Step 1: Replace the stub with the full About page**

```tsx
import { Anchor, Container, Stack, Text, Title } from '@mantine/core';

export default function About() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={1}>About</Title>

        <Text>
          Weeks is a tool to visualize your entire life at once — every week, laid out in a single
          grid. Lived weeks, remaining weeks, and potential extra time are all visible together,
          giving you a clear picture of your life as a whole.
        </Text>

        <Text>
          To configure your expected lifespan, you can look up average life expectancy by country
          and sex on the{' '}
          <Anchor
            href="https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy-at-birth-(years)"
            target="_blank"
            rel="noopener noreferrer"
          >
            WHO website
          </Anchor>
          .
        </Text>

        <Text>
          If you find this useful, you can{' '}
          <Anchor
            href="https://buymeacoffee.com/ozzzzz"
            target="_blank"
            rel="noopener noreferrer"
          >
            buy me a coffee
          </Anchor>
          .
        </Text>
      </Stack>
    </Container>
  );
}
```

**Step 2: Verify**

```bash
npm run typecheck
```

Expected: no errors.

**Step 3: Run the dev server and manually verify**

```bash
npm run dev
```

- Navigate to `http://localhost:5173` — Home page loads, status counts visible
- Click "About" in the nav — About page appears with three paragraphs and working links
- Click "Weeks" in the nav — returns to Home
- Click the GitHub icon — opens `https://github.com/ozzzzz/weeks` in a new tab

**Step 4: Commit**

```bash
git add src/app/about.tsx
git commit -m "feat: implement About page with project description and links"
```

---

### Task 5: Verify production build

**Step 1: Build**

```bash
npm run build
```

Expected: `dist/` is generated with no errors.

**Step 2: Preview**

```bash
npm run preview
```

- Navigate to `http://localhost:4173/#/about` — About page loads correctly
- Navigate to `http://localhost:4173/` — Home page loads correctly

**Step 3: Done**

No additional commit needed — build output is not committed.
