# Visualization Overhaul Design

## Problem

The current visualization has several aesthetic issues:
- Week dots are too close together — the grid looks dense and cluttered
- Period highlighting is nearly invisible (70% blend toward background)
- Event markers are small inner dots that don't stand out
- Calendar menu uses raw HTML radio buttons and lacks polish

## Design Direction

Clean & minimal. Lots of whitespace, subtle but clear distinctions.

## Changes

### 1. Dot Spacing

Reduce radius multiplier from `0.65` to `0.40` in `WeeksVisualization.tsx`.

- Dot fills ~40% of cell instead of ~65%
- Creates visible whitespace between dots
- May tune between 0.35–0.45 after visual testing

File: `src/app/components/WeeksVisualization.tsx` line 279

### 2. Period Colored Bands

Strengthen period background color visibility.

- Reduce lerp blend from `0.7` to `0.35`
- Periods go from "barely visible" to "clear pastel tint"
- Per-cell square approach stays, z-order unchanged at -0.08

File: `src/app/components/WeeksVisualization.tsx` line 441

### 3. Event Glow

Replace small inner dot with a glow halo behind the week dot.

- Remove current event dot (small circle at z=0.12, radius * 0.55)
- Add glow mesh: circle at z=-0.04, radius * 1.5, transparent, opacity 0.35
- Color from event color (default #ef4444)
- Z-order: period band (-0.08) → event glow (-0.04) → week dot (0)

File: `src/app/components/WeeksVisualization.tsx`

### 4. Calendar Accordion Polish

- Replace raw `<input type="radio">` with Mantine `Radio` component
- Add colored circle swatch next to calendar name
- Better spacing in accordion items
- Bold active calendar name
- Keep edit/delete icons, refine alignment

File: `src/app/components/CalendarList.tsx`

## What Stays the Same

- Grid layout algorithm (auto-fitting columns)
- Zoom/pan controls
- Tooltip on hover
- Status bar (lived/current/remaining/extra counts)
- All data structures and Redux state
