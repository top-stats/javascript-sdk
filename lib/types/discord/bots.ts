/**
 * Represents detailed bot data from the API
 */
export interface BotData {
  /** @deprecated */
  certified: boolean;
  /** Array of bot owner Discord IDs */
  owners: string[];
  /** Whether the bot has been deleted */
  deleted: boolean;
  /** Bot's Discord ID */
  id: string;
  /** Bot's display name */
  name: string;
  /** Default avatar URL */
  def_avatar: string;
  /** Short description of the bot */
  short_desc: string;
  /** @deprecated */
  lib: string;
  /** Bot's command prefix */
  prefix: string;
  /** Bot's website URL */
  website: string;
  /** ISO timestamp of when the bot was approved */
  approved_at: string;
  /** Current monthly votes */
  monthly_votes: number;
  /** Current server count */
  server_count: number;
  /** Total votes received */
  total_votes: number;
  /** Current shard count */
  review_count: number;
  /** Current rank by monthly votes */
  monthly_votes_rank: number;
  /** Current rank by server count */
  server_count_rank: number;
  /** Current rank by total votes */
  total_votes_rank: number;
  /** ISO timestamp of last update */
  timestamp: string;
  /** Unix timestamp of last update */
  unix_timestamp: number;
  /** Percentage changes in metrics */
  percentageChanges: {
    /** Daily percentage change */
    daily: number;
    /** Monthly percentage change */
    monthly: number;
  };
}

/**
 *	Types of data that can be queried historically
 */
export enum HistoricalDataType {
  MONTHLY_VOTES = 'monthly_votes',
  TOTAL_VOTES = 'total_votes',
  SERVER_COUNT = 'server_count',
  REVIEW_COUNT = 'review_count',
}

/**
 *	Available time frames for historical data queries
 */
export enum HistoricalTimeFrame {
  ALL_TIME = 'alltime',
  FIVE_YEARS = '5y',
  THREE_YEARS = '3y',
  ONE_YEAR = '1y',
  NINE_MONTHS = '270d',
  SIX_MONTHS = '180d',
  NINETY_DAYS = '90d',
  THIRTY_DAYS = '30d',
  SEVEN_DAYS = '7d',
  ONE_DAY = '1d',
  TWELVE_HOURS = '12hr',
  SIX_HOURS = '6hr',
}

/**
 * Base historical data point structure
 */
export interface BaseHistoricalData {
  time: string;
  id: string;
  type: HistoricalDataType;
  value: number;
}

/**
 * Type for historical data with specific value field
 */
export type HistoricalData = {
  [K in HistoricalDataType]: BaseHistoricalData & {
    type: K;
    value: number;
  };
}[HistoricalDataType];

export interface HistoricalDataRequest {
  id: string;
  timeFrame: HistoricalTimeFrame;
  type: HistoricalDataType;
}

export interface HistoricalDataResponse {
  data: HistoricalData[];
}

/**
 * Structure for recent bot statistics
 */
export interface RecentData {
  time: string;
  monthly_votes: number;
  server_count: number;
  review_count: number;
  total_votes: number;
  monthly_votes_change: number;
  monthly_votes_change_perc: number;
  server_count_change: number;
  review_count_change: number;
  total_votes_change: number;
}

export interface RecentDataRequest {
  id: string;
}

export interface RecentDataResponse {
  hourlyData: RecentData[];
  dailyData: RecentData[];
}
