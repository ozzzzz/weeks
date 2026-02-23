# Birthdate DateInput Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the three `NumberInput` components (year, month, day) in the birthdate section of `LifeMenu.tsx` with a single Mantine `DateInput`.

**Architecture:** Thin adapter at the component boundary — `PartialDate ↔ Date` conversion lives only in `LifeMenu.tsx`. Redux store, `PartialDate` type, and all utility functions remain unchanged.

**Tech Stack:** React, TypeScript, Mantine 8 (`@mantine/core` + `@mantine/dates`), dayjs (peer dep for `@mantine/dates`), Redux Toolkit

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install `@mantine/dates` and `dayjs`**

```bash
npm install @mantine/dates dayjs
```

Expected output: `added N packages` with no errors.

**Step 2: Verify typecheck still passes**

```bash
npm run typecheck
```

Expected: no errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @mantine/dates and dayjs"
```

---

### Task 2: Replace the three NumberInputs with DateInput

**Files:**
- Modify: `src/app/components/LifeMenu.tsx`

**Context — what currently exists:**

The handler at lines 57–66:
```tsx
const handleBirthChange =
  (field: "year" | "month" | "day") => (value: string | number) => {
    if (typeof value !== "number") return;
    dispatch(
      lifeActions.setDateOfBirth({
        ...lifeProfile.dateOfBirth,
        [field]: value,
      }),
    );
  };
```

The three inputs at lines 166–189:
```tsx
<NumberInput
  label="Birth year"
  value={lifeProfile.dateOfBirth.year}
  min={1900}
  max={new Date().getFullYear()}
  onChange={handleBirthChange("year")}
/>

<Group grow>
  <NumberInput
    label="Birth month"
    value={lifeProfile.dateOfBirth.month}
    min={1}
    max={12}
    onChange={handleBirthChange("month")}
  />
  <NumberInput
    label="Birth day"
    value={lifeProfile.dateOfBirth.day}
    min={1}
    max={31}
    onChange={handleBirthChange("day")}
  />
</Group>
```

**Step 1: Add the `DateInput` import**

Find the existing Mantine import line (it will look like `import { ..., NumberInput, ... } from "@mantine/core"`).

Add a new import line directly after it:
```tsx
import { DateInput } from "@mantine/dates";
```

**Step 2: Remove `NumberInput` from the Mantine core import**

Remove `NumberInput` and `Group` from the `@mantine/core` import if they are no longer used elsewhere. Only remove them if they appear nowhere else in the file — do a quick search first.

**Step 3: Delete the `handleBirthChange` handler**

Delete the entire block (lines 57–66, shown in context above).

**Step 4: Add the new derived value and handler**

In its place (same location, right before the `return` statement of the component), add:

```tsx
const birthdateAsDate = new Date(
  lifeProfile.dateOfBirth.year,
  (lifeProfile.dateOfBirth.month ?? 1) - 1,
  lifeProfile.dateOfBirth.day ?? 1,
);

const handleBirthDateChange = (date: Date | null) => {
  if (!date) return;
  dispatch(
    lifeActions.setDateOfBirth({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    }),
  );
};
```

**Step 5: Replace the three NumberInputs with a single DateInput**

Delete the `<NumberInput label="Birth year" .../>` and the `<Group grow>...</Group>` block.

Replace with:
```tsx
<DateInput
  label="Birthdate"
  value={birthdateAsDate}
  onChange={handleBirthDateChange}
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
  valueFormat="YYYY-MM-DD"
  clearable={false}
/>
```

**Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors. If you see "Module not found: @mantine/dates", the install in Task 1 may have failed — re-run `npm install @mantine/dates dayjs`.

**Step 7: Verify in browser**

```bash
npm run dev
```

Open the app, open the sidebar, go to the birthdate section. Confirm:
- A single "Birthdate" field appears where the three inputs were.
- Clicking the field opens a calendar picker.
- Selecting a date updates the "Current age" display correctly.
- The value shows in YYYY-MM-DD format.

**Step 8: Commit**

```bash
git add src/app/components/LifeMenu.tsx
git commit -m "feat: replace birthdate steppers with Mantine DateInput"
```
