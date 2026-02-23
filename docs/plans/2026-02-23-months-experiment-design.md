# Months Experiment Design

**Date:** 2026-02-23
**Branch:** `feature/months_experiment`
**Status:** Approved

## Goal

Add a months view as an experiment alongside the existing weeks view. The user can toggle between the two modes on the home page. Settings, Redux store, and persistence are unchanged.

## Decisions

| Question | Decision |
|---|---|
| How is the mode accessed? | Toggle on the home page (local state, no new route) |
| Three.js scene | Duplicate `WeeksVisualization.tsx` → `MonthsVisualization.tsx` |
| Current (partial) month | Treated as lived |
| Mode persistence | Not persisted (local state, resets to `weeks` on refresh) |

## Files Changed

| File | Type | Description |
|---|---|---|
| `src/app/utils/months.ts` | New | `buildMonthPoints()` — mirrors `buildWeekPoints()` for months |
| `src/app/utils/calendar.ts` | Modified | Add `dateToMonthIndex()` and `buildMonthOverlays()` alongside existing week equivalents |
| `src/app/components/MonthsVisualization.tsx` | New | Copy of `WeeksVisualization.tsx` adapted for months |
| `src/app/page.tsx` | Modified | `useState<'weeks' \| 'months'>('weeks')`, toggle UI, conditional render |

## Data Layer

### `buildMonthPoints(profile, today)`

- Total months = `(realExpectancyYears + extraExpectancyYears) × 12`
- Extra months start at `realExpectancyYears × 12`
- Status per month:
  - `lived` — month index ≤ months elapsed since birth (month that has started counts as lived)
  - `remaining` — after current month, up to `realExpectancyYears × 12`
  - `extra` — beyond real expectancy

### `dateToMonthIndex(date, dateOfBirth)`

Converts a date to a month index (0-based from birth month).

### `buildMonthOverlays(calendars, profile)`

Same structure as `buildWeekOverlays` — returns `Map<monthIndex, { events, periods }>`.

## Three.js Scene

`MonthsVisualization.tsx` is a copy of `WeeksVisualization.tsx` with:

- `buildMonthPoints` / `buildMonthOverlays` / `dateToMonthIndex` imported instead of week equivalents
- All `week*` variable names renamed to `month*`
- Grid layout, camera, InstancedMesh, hover/easing system — unchanged
- Fewer items (~1200 vs ~5200) so circles naturally render larger

## Toggle UI

In `page.tsx`:

```tsx
const [viewMode, setViewMode] = useState<'weeks' | 'months'>('weeks')
```

A small segmented control (two buttons: `Weeks` / `Months`) placed in the Navigation bar or above the scene. The Navigation status counts (lived/remaining/extra) reflect the active mode.
