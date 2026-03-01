export interface WeekColors {
  lived: string;
  remaining: string;
  extra: string;
}

export interface LayoutState {
  isMenuCollapsed: boolean;
  viewMode: 'weeks' | 'months';
  focusWeekIndex: number | null;
  resetView: boolean;
  hoveredEventId: string | null;
  hoveredPeriodId: string | null;
}