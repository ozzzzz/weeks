# Calendar UI Cleanup Design

**Date**: 2026-02-17
**Status**: Approved
**Context**: Prototype phase - simplifying calendar UI

## Overview

Remove status diagnostics and calendar-level color indicators from the UI while preserving event/period color functionality. Simplify demo data to focus on two core calendar types with emoji-based visual distinction.

## Objectives

1. Remove "Status check" diagnostic section from Life menu
2. Remove colored boxes from calendar list display
3. Update demo data to show only Personal and Career calendars with emoji names
4. Clean up unused helper functions and imports

## Approach: UI Removal + Code Cleanup

**What**: Remove UI elements AND clean up now-unused helper functions

**Why**: Cleaner codebase, removes truly unused code, more thorough cleanup

**Trade-offs**: Slightly more changes than minimal approach, but results in cleaner code

## Architecture

Straightforward cleanup task targeting three areas:
1. **LifeMenu.tsx** - Remove diagnostic "Status check" section
2. **CalendarList.tsx** - Remove colored box display and cleanup helper functions
3. **demoData.ts** - Simplify to 2 calendars with emoji names

No changes to data models, types, or core logic. Event and period colors remain fully functional. Changes are purely presentational - removing visual indicators at the calendar list level while preserving them for events/periods.

## Component Changes

### LifeMenu.tsx
- Remove entire `<Stack gap={4}>` block containing "Status check" (lines 203-213)
- Keep `<Divider />` before it
- Diagnostics calculation code can be verified and removed if unused elsewhere

### CalendarList.tsx
- Remove `<Box>` component displaying colored square (lines ~111-119)
- Remove `getCalendarColor()` function (lines 13-16)
- Remove `DEFAULT_CALENDAR_COLOR` constant (line 11)
- Clean up unused `Box` import from Mantine if no longer used

### demoData.ts
- Remove `calendar-family` object entirely
- Remove `calendar-health` object entirely
- Update calendar names:
  - `'Personal'` → `'Personal ✨'`
  - `'Career'` → `'Career 💼'`
- Keep all events and periods for remaining calendars unchanged

## Data Flow & Impact

**No data model changes**: `Calendar`, `CalendarEvent`, and `CalendarPeriod` types remain unchanged. The `color` property stays on events and periods.

**Prototype context**: No backward compatibility concerns. Fresh demo data initializes with 2 calendars.

**Visual impact**:
- Calendar list becomes cleaner, relying on emoji in names for visual distinction
- Status diagnostics removed from UI
- No impact on event/period visualization or color pickers in forms

## Verification

### Manual Testing
1. Load app - verify demo data shows only Personal ✨ and Career 💼 calendars
2. Check calendar list - no colored boxes appear
3. Open Life menu - no "Status check" section visible
4. Create/edit events and periods - color pickers still work
5. Verify visualization still renders event/period colors correctly

### Code Verification
- Check for unused imports after removing Box component
- Verify no other references to `getCalendarColor` function
- Ensure diagnostics variables aren't breaking anything when status check removed

## Success Criteria

- [ ] Status check section completely removed from Life menu
- [ ] Calendar list displays calendar names without colored boxes
- [ ] Demo data contains exactly 2 calendars with emoji names
- [ ] Event and period color functionality remains intact
- [ ] No unused imports or dead code remains
- [ ] App loads and displays correctly with new demo data
