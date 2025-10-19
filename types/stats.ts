export interface OverviewStats {
  totalBrands: number;
  totalLinks: number;
  activeLinks: number;
  totalEvents: number;
  totalClicks: number;
}

export interface ClicksOverTime {
  date: string;
  count: number;
}

export interface GeographicDistribution {
  country: string;
  count: number;
}

export interface EventTypeDistribution {
  type: string;
  count: number;
}
