/**
 * Branded type for rankings limit (1-500)
 */
export type RankingsLimit = number & { readonly __brand: unique symbol };

/**
 * Validates if a number is a valid rankings limit
 */
export function isValidRankingsLimit(value: number): value is RankingsLimit {
  return Number.isInteger(value) && value >= 1 && value <= 500;
}

export const DEFAULT_RANKINGS_LIMIT = 100 as RankingsLimit;

export type RankingsSortBy =
  | 'monthly_votes_rank'
  | 'total_votes_rank'
  | 'server_count_rank'
  | 'shard_count_rank';

export type RankingsSortMethod = 'asc' | 'desc';

export interface RankingsRequest {
  limit?: RankingsLimit;
  sortBy: RankingsSortBy;
  sortMethod: RankingsSortMethod;
}

export interface RankingsData {
  id: string;
  name: string;
  monthly_votes: number;
  monthly_votes_rank: number;
  server_count: number;
  server_count_rank: number;
  total_votes: number;
  total_votes_rank: number;
  shard_count: number;
  shard_count_rank: number;
  monthly_votes_rank_change: number;
  server_count_rank_change: number;
  total_votes_rank_change: number;
  shard_count_rank_change: number;
}

export interface RankingsResponse {
  totalBotCount: number;
  data: RankingsData[];
}
