# Calendar UI Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove status diagnostics and calendar-level color indicators from the UI while preserving event/period color functionality.

**Architecture:** Straightforward UI cleanup targeting three components: LifeMenu (remove status check section), CalendarList (remove colored boxes and helper functions), and demoData (simplify to 2 calendars with emoji names). No data model changes.

**Tech Stack:** React, TypeScript, Mantine UI

---

## Task 1: Remove Status Check Section from LifeMenu

**Files:**
- Modify: `src/app/components/LifeMenu.tsx:203-213`

**Step 1: Remove the status check Stack component**

Edit `src/app/components/LifeMenu.tsx` and remove lines 203-213 (the entire `<Stack gap={4}>` block containing "Status check").

Keep line 201 (`<Divider />`) but remove everything from line 203 through line 213.

The result should look like:
```tsx
                    <Text c="dimmed">Current age: {age} years</Text>

                    <Divider />
                  </Stack>
                </Tabs.Panel>
```

**Step 2: Verify the app loads**

Run: `npm run dev` (or your dev command)
Expected: App loads without errors, Life menu shows profile fields but no "Status check" section

**Step 3: Commit**

```bash
git add src/app/components/LifeMenu.tsx
git commit -m "refactor: remove status check section from Life menu"
```

---

## Task 2: Remove Calendar Color Box and Helpers from CalendarList

**Files:**
- Modify: `src/app/components/CalendarList.tsx:11-17,109-117`

**Step 1: Remove the colored Box component**

Edit `src/app/components/CalendarList.tsx` and remove the `<Box>` element (lines 109-117).

Before:
```tsx
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                    <Box
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: getCalendarColor(calendar),
                        flexShrink: 0,
                      }}
                    />
                    {editingId === calendar.id ? (
```

After:
```tsx
                  <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                    {editingId === calendar.id ? (
```

**Step 2: Remove helper functions**

Remove lines 11-17:
```tsx
const DEFAULT_CALENDAR_COLOR = '#94a3b8';

const getCalendarColor = (calendar: Calendar): string => {
  if (calendar.periods.length > 0 && calendar.periods[0].color) return calendar.periods[0].color;
  if (calendar.events.length > 0 && calendar.events[0].color) return calendar.events[0].color;
  return DEFAULT_CALENDAR_COLOR;
};
```

**Step 3: Check if Box import is still needed**

Review line 4 to see if `Box` is used elsewhere in the file. If not, remove it from the import:

Before:
```tsx
import { Accordion, ActionIcon, Box, Button, Group, Stack, Text, TextInput } from '@mantine/core';
```

After (if Box is unused):
```tsx
import { Accordion, ActionIcon, Button, Group, Stack, Text, TextInput } from '@mantine/core';
```

**Step 4: Verify the app loads**

Run: `npm run dev`
Expected: App loads, calendar list displays calendar names without colored boxes

**Step 5: Commit**

```bash
git add src/app/components/CalendarList.tsx
git commit -m "refactor: remove colored box and helper functions from calendar list"
```

---

## Task 3: Update Demo Data

**Files:**
- Modify: `src/app/utils/demoData.ts:34-201`

**Step 1: Update calendar names with emojis**

Edit line 37: Change `name: 'Personal',` to `name: 'Personal ✨',`
Edit line 106: Change `name: 'Career',` to `name: 'Career 💼',`

**Step 2: Remove Family calendar**

Remove the entire `calendar-family` object (lines 149-177, approximately):
```tsx
    {
      id: 'calendar-family',
      name: 'Family',
      events: [...],
      periods: [...],
      isVisible: true,
    },
```

**Step 3: Remove Health calendar**

Remove the entire `calendar-health` object (lines 178-200, approximately):
```tsx
    {
      id: 'calendar-health',
      name: 'Health',
      events: [...],
      periods: [...],
      isVisible: true,
    },
```

Make sure to remove the trailing comma from the Career calendar object since it's now the last item in the array.

**Step 4: Verify calendars array structure**

The final `calendars` array should contain exactly 2 objects:
- Personal ✨ (id: 'calendar-personal')
- Career 💼 (id: 'calendar-career')

**Step 5: Test with fresh demo data**

Run: `npm run dev`
Clear browser storage (or use incognito) to load fresh demo data
Expected: Only 2 calendars appear: "Personal ✨" and "Career 💼"

**Step 6: Commit**

```bash
git add src/app/utils/demoData.ts
git commit -m "refactor: simplify demo data to Personal and Career calendars with emojis"
```

---

## Task 4: Final Verification

**Step 1: Manual testing checklist**

- [ ] App loads without errors
- [ ] Life menu shows profile fields, no "Status check" section
- [ ] Calendar list displays exactly 2 calendars with emoji names
- [ ] No colored boxes appear next to calendar names
- [ ] Open event form - color picker is still present
- [ ] Open period form - color picker is still present
- [ ] Create a test event with color - it renders in visualization
- [ ] Create a test period with color - it renders in visualization

**Step 2: Code verification**

Run: `npm run build` (or your build command)
Expected: Build succeeds with no errors or warnings about unused imports

**Step 3: Check for console errors**

Open browser dev tools console
Expected: No errors related to removed components or functions

---

## Success Criteria

- [x] Status check section completely removed from Life menu
- [x] Calendar list displays names without colored boxes
- [x] Demo data contains exactly 2 calendars: Personal ✨ and Career 💼
- [x] Event and period color pickers still work in forms
- [x] Visualization still renders event/period colors correctly
- [x] No unused imports (Box removed from CalendarList if unused)
- [x] No console errors
- [x] Build succeeds

---

## Notes

- This is a UI-only change - no data model modifications
- Existing user data with 4+ calendars will continue to work
- Only demo data initialization changes
- Event and period `color` properties remain fully functional
