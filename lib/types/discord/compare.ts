import { HistoricalDataType, HistoricalTimeFrame } from './bots';

export interface CompareBotsRequest {
  ids: string[];
}

export interface CompareBotsHistoricalRequest extends CompareBotsRequest {
  timeFrame: HistoricalTimeFrame;
  type: HistoricalDataType;
}
