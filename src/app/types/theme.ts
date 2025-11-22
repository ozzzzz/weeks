export interface WeekColors {
  lived: string;
  current: string;
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
}