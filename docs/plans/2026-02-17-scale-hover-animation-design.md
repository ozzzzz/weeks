# Scale Hover Animation Design

**Date:** 2026-02-17
**Status:** Approved
**Goal:** Replace pulsing halo effect with smooth scale animation when hovering over events/periods in sidebar

## Overview

When users hover over event or period items in the left sidebar, the corresponding week dots in the Three.js visualization will smoothly scale up to 2x their size. When hover ends, dots spring back to normal size with smooth physics.

## Requirements

- **Trigger:** On hover over event/period items in CalendarDetail sidebar
- **Effect:** Scale dots to 2x their original size
- **Recovery:** Spring back smoothly when hover ends (not instant, not staying displaced)
- **Scope:** Only dots related to the hovered event/period are affected
- **Visual Style:** Replace current pulsing halo completely with clean scale animation

## Technical Approach

**Selected Approach:** Instance Matrix Manipulation

We'll modify the existing InstancedMesh matrices to directly scale highlighted dots, using spring physics for smooth transitions.

### Why This Approach?

- Fine-grained control over animation timing
- Smooth spring physics feels polished
- Works with existing mesh structure
- No additional rendering overhead
- No z-fighting or layering issues

### Alternatives Considered

1. **Separate Highlight Mesh Layer** - Extra rendering overhead, potential z-fighting
2. **CSS-style Transform Animation** - More complex state tracking

## Architecture & Component Changes

### WeeksVisualization.tsx Modifications

**Remove:**
- `pulseHaloRef` (line 55)
- Pulse animation logic in render loop (lines 213-219)
- Pulse halo creation/update effect (lines 501-567)

**Add:**
- `targetScalesRef: useRef<Map<number, number>>(new Map())`
- `currentScalesRef: useRef<Map<number, number>>(new Map())`
- Scale interpolation logic in render loop
- New effect to set target scales based on `hoveredEventId`/`hoveredPeriodId`

**Modify:**
- Animation loop to interpolate scales
- Instance matrix building to apply animated scales

**No changes needed:**
- CalendarDetail.tsx already dispatches hover events correctly
- Redux state already tracks `hoveredEventId` and `hoveredPeriodId`

## Data Flow

1. User hovers over event/period in sidebar (CalendarDetail.tsx:92-93, 156-157)
2. Redux action dispatched: `setHoveredEvent(eventId)` or `setHoveredPeriod(periodId)`
3. WeeksVisualization receives updated `hoveredEventId`/`hoveredPeriodId` via useAppSelector
4. Effect triggers to determine which week indices to highlight:
   - Events: single week index from event date
   - Periods: array of week indices from period range
5. Update `targetScalesRef` Map: highlighted weeks → 2.0, others → 1.0
6. Animation loop interpolates `currentScalesRef` toward targets on every frame
7. Matrix updates apply animated scale when positioning instances
8. When hover ends, targets reset to 1.0 and dots spring back

## Animation Implementation

### Spring Physics

```javascript
const SPRING_FACTOR = 0.18; // Tuned for smooth spring-back (~1 second)

// In render loop, for each week index:
const target = targetScalesRef.current.get(weekIndex) ?? 1.0;
const current = currentScalesRef.current.get(weekIndex) ?? 1.0;
const newScale = current + (target - current) * SPRING_FACTOR;

// Snap to target when close enough to prevent infinite tiny updates
if (Math.abs(newScale - target) < 0.01) {
  newScale = target;
}

currentScalesRef.current.set(weekIndex, newScale);
```

### Matrix Updates

When building instance matrices (in `updateLayout()` or render loop):

1. Calculate base position (x, y) and base radius (as currently done)
2. Look up current animated scale: `const animatedScale = currentScalesRef.current.get(weekIndex) ?? 1.0`
3. Apply combined scale: `dummy.scale.set(radius * animatedScale, radius * animatedScale, thickness)`
4. Update matrix: `mesh.setMatrixAt(instanceIndex, dummy.matrix)`

### Continuous Updates

Matrix updates must happen continuously during animation:
- Move matrix updates into render loop, OR
- Add `isAnimating` flag to trigger updates when any scale !== target

## State Management

### New Refs

```typescript
const targetScalesRef = useRef<Map<number, number>>(new Map());
const currentScalesRef = useRef<Map<number, number>>(new Map());
```

### State Update Strategy

**When hover changes** (in effect responding to `hoveredEventId`/`hoveredPeriodId`):
```javascript
// Reset all targets (or clear non-highlighted)
targetScalesRef.current.clear();

// Set targets for highlighted weeks
highlightedWeekIndices.forEach(weekIndex => {
  targetScalesRef.current.set(weekIndex, 2.0);
});

// Current scales remain unchanged - spring will interpolate
```

**In render loop:**
```javascript
// Interpolate for all tracked weeks
targetScalesRef.current.forEach((target, weekIndex) => {
  const current = currentScalesRef.current.get(weekIndex) ?? 1.0;
  const newScale = current + (target - current) * SPRING_FACTOR;

  if (Math.abs(newScale - target) < 0.01) {
    currentScalesRef.current.set(weekIndex, target);
  } else {
    currentScalesRef.current.set(weekIndex, newScale);
  }
});

// Clean up entries at rest (scale = 1.0)
currentScalesRef.current.forEach((scale, weekIndex) => {
  if (scale === 1.0 && !targetScalesRef.current.has(weekIndex)) {
    currentScalesRef.current.delete(weekIndex);
  }
});
```

### Optimization

- Only update matrices when `isAnimating` or layout changes
- `isAnimating = Array.from(currentScalesRef.current.values()).some(s => s !== 1.0)`
- Sparse Maps only track non-1.0 scales (memory efficient)

## Edge Cases & Considerations

### Rapid Hover Changes
- Target scales update immediately on new hover
- Spring interpolation naturally handles transitions
- Dots smoothly transition between scales without snapping

### Calendar Switching
- When `resetView` triggers or calendar changes, clear both Maps
- All dots return to scale 1.0 instantly
- Prevents orphaned animation state

### Performance
- Sparse Maps scale well (only store non-1.0 values)
- Spring interpolation is O(n) where n = animated weeks (typically <100)
- Matrix updates already optimized with `DynamicDrawUsage`

### Z-ordering
- Scaled dots may overlap neighbors (visually acceptable)
- If needed, can adjust z-position: `z = 0.01 * scale`

### Cleanup
- Maps garbage collected with refs on unmount
- No additional cleanup beyond existing mesh disposal

## Testing Strategy

**Manual Testing:**
1. Hover over single event - verify dot scales to 2x smoothly
2. Hover over period - verify all period dots scale together
3. Move between events rapidly - verify smooth transitions
4. Stop hovering - verify spring-back timing (~1 second feels natural)
5. Switch calendars - verify scales reset correctly
6. Test with 4000+ weeks - verify no performance issues

**Success Criteria:**
- Animation feels smooth and responsive
- No visual glitches or z-fighting
- Spring-back timing feels natural (not too fast/slow)
- Performance remains stable with large datasets
- Works correctly for both events and periods

## Implementation Notes

- Spring factor of 0.18 chosen for responsive yet smooth feel
- Scale factor of 2.0 provides clear visual feedback without overwhelming
- Sparse data structures ensure efficiency with 4000+ weeks
- Clean separation: animation state in refs, don't pollute Redux

## Summary

This design replaces the pulsing halo with a cleaner, more direct visual feedback mechanism. Users will see immediate, smooth scaling of relevant dots when exploring events and periods in the sidebar. The spring physics adds polish and the sparse state management ensures performance at scale.
