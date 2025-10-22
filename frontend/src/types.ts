export interface AggregatedRate {
  currency: string;
  average_rate: number;
  min_rate: number;
  max_rate: number;
  last_updated: string;
  sources: string[];
}

export interface TrendData {
  currency: string;
  timeframe: string;
  data_points: Array<Record<string, number>>;
  start_date: string;
  end_date: string;
}