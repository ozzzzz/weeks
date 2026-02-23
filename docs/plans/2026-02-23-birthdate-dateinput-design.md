# Birthdate DateInput Design

**Date:** 2026-02-23
**Status:** Approved

## Problem

Three separate `NumberInput` components (year, birth month, birth day) feel like a spreadsheet. They are visually disconnected and require 3 interactions to set a single value.

## Solution

Replace the 3 inputs with a single Mantine `DateInput` component. Keep the Redux store shape (`PartialDate`) unchanged; convert at the component boundary.

## Approach

**Option A — Thin adapter at the component boundary** (chosen)

- No changes to the Redux store, `PartialDate` type, or any utility functions.
- Conversion logic lives entirely in `LifeMenu.tsx`.

## Changes

### New dependency

```
@mantine/dates   (installs alongside existing @mantine/core)
dayjs            (required peer dependency for @mantine/dates)
```

### `src/app/components/LifeMenu.tsx`

- Remove `handleBirthChange` curried handler.
- Add `birthdateAsDate` derived value: `new Date(year, (month ?? 1) - 1, day ?? 1)`.
- Add `handleBirthDateChange(date: Date | null)` that dispatches `setDateOfBirth` with `{ year, month, day }` extracted from the `Date`.
- Replace 3 `NumberInput` blocks with a single `DateInput`:
  - `label="Birthdate"`
  - `value={birthdateAsDate}`
  - `onChange={handleBirthDateChange}`
  - `minDate={new Date(1900, 0, 1)}`
  - `maxDate={new Date()}`
  - `valueFormat="YYYY-MM-DD"`
  - `clearable={false}`

### No other files change

- `src/app/store.ts` — unchanged
- `src/app/types/common.ts` — unchanged
- `src/app/utils/dates.ts` — unchanged
