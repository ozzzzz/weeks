export interface WeekColors {
  lived: string;
  remaining: string;
  extra: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  weeks: WeekColors;
  accent: string; // used for calendar marks and interactive elements
  background: string;
  text: string;
}

export interface LayoutState {
  isMenuCollapsed: boolean;
  focusWeekIndex: number | null;
  resetView: boolean;
  hoveredEventId: string | null;
  hoveredPeriodId: string | null;
}