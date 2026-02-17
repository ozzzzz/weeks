# Scale Hover Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace pulsing halo with smooth 2x scale animation when hovering over events/periods in sidebar

**Architecture:** Modify WeeksVisualization.tsx to track target and current scales per week index using Maps, interpolate scales with spring physics in the animation loop, and apply animated scales when building instance matrices.

**Tech Stack:** React, Three.js, TypeScript, Redux

---

## Task 1: Remove Pulse Halo System

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Remove pulseHaloRef and pulse animation variables**

Remove line 55:
```typescript
const pulseHaloRef = useRef<THREE.InstancedMesh | null>(null);
```

Remove line 57:
```typescript
const pulseTimeRef = useRef(0);
```

**Step 2: Remove pulse animation logic from render loop**

In the `render` function (around lines 213-219), remove:
```typescript
// Pulse animation
pulseTimeRef.current += 0.05;
const pulseHalo = pulseHaloRef.current;
if (pulseHalo && pulseHalo.material) {
  const pulseFactor = (Math.sin(pulseTimeRef.current) + 1) / 2; // 0 to 1
  const opacity = 0.2 + pulseFactor * 0.3; // 0.2 to 0.5
  (pulseHalo.material as THREE.MeshBasicMaterial).opacity = opacity;
}
```

**Step 3: Remove pulse halo cleanup in unmount**

In the cleanup return function (around lines 248-252), remove:
```typescript
if (pulseHaloRef.current) {
  pulseHaloRef.current.geometry.dispose();
  (pulseHaloRef.current.material as THREE.Material).dispose();
  gridGroupRef.current?.remove(pulseHaloRef.current);
}
```

**Step 4: Remove entire pulse halo creation/update effect**

Remove the entire useEffect (lines 501-567):
```typescript
// Create/update pulse halo for hovered event/period
useEffect(() => {
  // ... entire effect body
}, [hoveredEventId, hoveredPeriodId, calendars, weeks, lifeProfile.dateOfBirth, periodInstances]);
```

**Step 5: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors, visualization renders without pulse halo

**Step 6: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "feat: remove pulse halo animation system

Remove pulseHaloRef, pulse animation logic, and pulse halo effect in
preparation for scale-based hover animation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Scale Animation State

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Add new refs for scale tracking**

After the existing refs (around line 60), add:
```typescript
const targetScalesRef = useRef<Map<number, number>>(new Map());
const currentScalesRef = useRef<Map<number, number>>(new Map());
```

**Step 2: Add spring constant**

At the top of the component (after imports, around line 36), add:
```typescript
const SPRING_FACTOR = 0.18;
```

**Step 3: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors

**Step 4: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "feat: add scale animation state refs

Add targetScalesRef and currentScalesRef Maps to track per-week scale
animations, plus SPRING_FACTOR constant for interpolation.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add Effect to Set Target Scales on Hover

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Add effect to determine highlighted weeks and set targets**

After the existing useEffects (around line 500, where the pulse halo effect was), add:

```typescript
// Set target scales for hovered event/period
useEffect(() => {
  const layout = layoutRef.current;
  if (!layout) return;

  // Find which weeks to highlight
  let weekIndicesToHighlight: number[] = [];

  if (hoveredEventId) {
    calendars.forEach((calendar) => {
      const event = calendar.events.find((e) => e.id === hoveredEventId);
      if (event) {
        const weekIndex = dateToWeekIndex(event.date, lifeProfile.dateOfBirth);
        if (weekIndex >= 0 && weekIndex < weeks.length) {
          weekIndicesToHighlight.push(weekIndex);
        }
      }
    });
  } else if (hoveredPeriodId) {
    const instance = periodInstances.find((inst) => inst.period.id === hoveredPeriodId);
    if (instance) {
      weekIndicesToHighlight = instance.weekIndices;
    }
  }

  // Update target scales
  targetScalesRef.current.clear();
  weekIndicesToHighlight.forEach((weekIndex) => {
    targetScalesRef.current.set(weekIndex, 2.0);
  });

  // If no highlights, current scales will naturally spring back to 1.0
}, [hoveredEventId, hoveredPeriodId, calendars, weeks, lifeProfile.dateOfBirth, periodInstances]);
```

**Step 2: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors

**Step 3: Test hover triggers target updates**

Add temporary console.log in the effect:
```typescript
console.log('Target scales:', Array.from(targetScalesRef.current.entries()));
```

Open browser console, hover over an event in sidebar.
Expected: Console logs show target scale of 2.0 for highlighted week indices

Remove console.log after verification.

**Step 4: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "feat: add effect to set target scales on hover

When hovering over event/period in sidebar, determine highlighted week
indices and set target scale to 2.0 in targetScalesRef Map.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Add Scale Interpolation in Render Loop

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Add spring interpolation logic in render function**

In the `render` function, after the focus animation logic (around line 210), add:

```typescript
// Spring interpolation for scale animation
const allWeekIndices = new Set([
  ...Array.from(targetScalesRef.current.keys()),
  ...Array.from(currentScalesRef.current.keys()),
]);

allWeekIndices.forEach((weekIndex) => {
  const target = targetScalesRef.current.get(weekIndex) ?? 1.0;
  const current = currentScalesRef.current.get(weekIndex) ?? 1.0;
  const newScale = current + (target - current) * SPRING_FACTOR;

  // Snap to target when close enough
  if (Math.abs(newScale - target) < 0.01) {
    if (target === 1.0) {
      currentScalesRef.current.delete(weekIndex);
    } else {
      currentScalesRef.current.set(weekIndex, target);
    }
  } else {
    currentScalesRef.current.set(weekIndex, newScale);
  }
});
```

**Step 2: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors

**Step 3: Test interpolation runs**

Add temporary console.log:
```typescript
if (currentScalesRef.current.size > 0) {
  console.log('Current scales:', Array.from(currentScalesRef.current.entries()));
}
```

Hover over an event, watch console.
Expected: Console logs show scales interpolating from 1.0 toward 2.0

Remove console.log after verification.

**Step 4: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "feat: add spring interpolation in render loop

Interpolate current scales toward targets using spring physics.
Snap to target when close enough and clean up 1.0 entries.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Apply Animated Scales to Instance Matrices

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Track which status each week belongs to**

In the `updateLayout` function, before positioning week circles (around line 335), add a helper to track week-to-instance mapping:

```typescript
// Track week index to (status, offset) mapping for scale animation
const weekToInstance = new Map<number, { status: WeekStatus; offset: number }>();

// Position week circles
for (let index = 0; index < weeks.length; index += 1) {
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = startX + col * cellSize;
  const y = startY - row * cellSize;

  const week = weeks[index];
  const mesh = meshes[week.status];
  if (!mesh) continue;

  const offset = statusOffsets[week.status];

  // Track mapping for scale animation
  weekToInstance.set(index, { status: week.status, offset });

  // Get animated scale
  const animatedScale = currentScalesRef.current.get(index) ?? 1.0;

  dummy.position.set(x, y, 0);
  dummy.scale.set(radius * animatedScale, radius * animatedScale, thickness);
  dummy.updateMatrix();
  mesh.setMatrixAt(offset, dummy.matrix);

  statusOffsets[week.status] += 1;
}
```

**Step 2: Trigger matrix updates when animating**

Add a check to determine if we're animating, and ensure matrices update:

At the end of the `updateLayout` function (before `controlsRef.current?.update()`), ensure:
```typescript
statusOrder.forEach((status) => {
  const mesh = meshes[status];
  if (!mesh) return;
  mesh.instanceMatrix.needsUpdate = true;
});
```

This already exists, so no change needed. The key is that `updateLayout` is now called on every frame via the render loop when scales are animating.

**Step 3: Call updateLayout in render loop when animating**

In the render function, after the scale interpolation logic, add:

```typescript
// Update layout if animating
if (currentScalesRef.current.size > 0 && layoutRef.current) {
  updateLayout();
}
```

**Step 4: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors

**Step 5: Manual testing - hover over event**

1. Open app in browser
2. Load demo data if needed
3. Hover over an event in the sidebar
4. Expected: Corresponding dot scales up smoothly to ~2x size
5. Move mouse away
6. Expected: Dot springs back to normal size smoothly

**Step 6: Manual testing - hover over period**

1. Hover over a period in the sidebar
2. Expected: All dots in that period scale up to ~2x size
3. Move mouse away
4. Expected: All dots spring back smoothly

**Step 7: Manual testing - rapid hover changes**

1. Quickly move between different events
2. Expected: Dots smoothly transition between scales, no snapping or glitches

**Step 8: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "feat: apply animated scales to instance matrices

Apply currentScalesRef values when building instance matrices.
Call updateLayout in render loop when scales are animating.
Dots now smoothly scale to 2x on hover and spring back.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Optimization - Avoid Redundant Updates

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Track previous animation state to avoid redundant updateLayout calls**

Add a ref to track if we were animating on the previous frame (around line 62):
```typescript
const wasAnimatingRef = useRef(false);
```

**Step 2: Only call updateLayout when needed**

Replace the `updateLayout` call in render loop with:
```typescript
// Update layout only when animating or animation state changes
const isAnimating = currentScalesRef.current.size > 0;
if (isAnimating || wasAnimatingRef.current !== isAnimating) {
  updateLayout();
}
wasAnimatingRef.current = isAnimating;
```

**Step 3: Verify file compiles and performance**

Run: `npm run dev`
Expected: App compiles without errors, smooth animation with no dropped frames

**Step 4: Test that optimization doesn't break functionality**

1. Hover over events/periods
2. Expected: Animation still works perfectly
3. Check browser dev tools performance tab
4. Expected: No excessive matrix updates when idle

**Step 5: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "perf: optimize matrix updates during scale animation

Only call updateLayout when animating or animation state changes.
Prevents redundant matrix updates when idle.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Handle Calendar Switch Edge Case

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx`

**Step 1: Clear scale state when resetView triggers**

In the existing `resetView` effect (around line 616), after setting the focus animation, add:

```typescript
// Clear scale animations when resetting view
targetScalesRef.current.clear();
currentScalesRef.current.clear();
```

**Step 2: Verify file compiles**

Run: `npm run dev`
Expected: App compiles without errors

**Step 3: Test calendar switching clears animations**

1. Hover over an event (dots scale up)
2. Switch to a different calendar
3. Expected: All dots immediately return to normal size, view resets smoothly

**Step 4: Commit**

```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "fix: clear scale animations on calendar switch

When resetView triggers, clear target and current scale Maps to
prevent orphaned animation state from previous calendar.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Final Testing and Polish

**Files:**
- Modify: `src/app/components/WeeksVisualization.tsx` (if needed)

**Step 1: Comprehensive manual testing**

Test matrix:
- [ ] Hover over single event → single dot scales to 2x
- [ ] Hover over period → all period dots scale to 2x
- [ ] Stop hovering → dots spring back in ~1 second
- [ ] Rapid hover between events → smooth transitions
- [ ] Switch calendars while hovering → scales reset
- [ ] Test with 4000+ weeks (full life span) → no performance issues
- [ ] Check animation feels smooth (not jerky)
- [ ] Verify spring-back timing feels natural

**Step 2: Adjust SPRING_FACTOR if needed**

If animation feels too slow or too fast, adjust the constant:
- Too slow (>1.5 seconds): increase to 0.22-0.25
- Too fast (<0.5 seconds): decrease to 0.12-0.15

Current: 0.18 (targets ~1 second)

**Step 3: Verify no console errors or warnings**

Open browser console, interact with app.
Expected: No errors or warnings related to Three.js or animation

**Step 4: Visual polish check**

- Dots scale uniformly (no stretching)
- No z-fighting or overlap issues
- Hover interaction feels responsive
- No visual artifacts during animation

**Step 5: Commit any adjustments**

If SPRING_FACTOR or other values were adjusted:
```bash
git add src/app/components/WeeksVisualization.tsx
git commit -m "polish: adjust spring factor for optimal feel

Fine-tune animation timing based on manual testing.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Otherwise, no commit needed.

---

## Task 9: Update Design Document Status

**Files:**
- Modify: `docs/plans/2026-02-17-scale-hover-animation-design.md`

**Step 1: Update status to implemented**

Change the header from:
```markdown
**Status:** Approved
```

To:
```markdown
**Status:** Implemented
```

**Step 2: Add implementation notes section**

At the end of the document, add:

```markdown
## Implementation Notes

**Completed:** 2026-02-17

**Final Parameters:**
- Spring factor: 0.18 (tuned for ~1 second spring-back)
- Scale multiplier: 2.0x
- Snap threshold: 0.01 (for smooth completion)

**Changes from design:**
- [Note any deviations from original design, if any]

**Performance:**
- Tested with 4000+ weeks, no performance degradation
- Animation runs at 60fps
- Memory efficient sparse Map storage

**Known issues:**
- None identified
```

**Step 3: Commit documentation update**

```bash
git add docs/plans/2026-02-17-scale-hover-animation-design.md
git commit -m "docs: mark scale hover animation as implemented

Update design document status and add implementation notes.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

- ✅ Pulse halo completely removed
- ✅ Dots scale to 2x on hover over events/periods
- ✅ Spring-back animation feels smooth and natural (~1 second)
- ✅ Rapid hover changes transition smoothly
- ✅ Calendar switching clears animation state
- ✅ No performance issues with large datasets
- ✅ No console errors or visual artifacts
- ✅ Code is clean, well-commented, and type-safe

## Total Estimated Time

~45-60 minutes for full implementation and testing
