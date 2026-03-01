export interface WeekColors {
  lived: string;
  remaining: string;
  extra: string;
}

export type ViewMode = 'weeks' | 'months';

export interface LayoutState {
  isMenuCollapsed: boolean;
  viewMode: ViewMode;
  focusWeekIndex: number | null;
  resetView: boolean;
  hoveredEventId: string | null;
  hoveredPeriodId: string | null;
}