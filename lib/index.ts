/**
 * @packageDocumentation
 * TopStats - Official Node.js client for the topstats.gg API
 * @version 1.0.0
 */

/**
 * Response structure for rate limit errors
 */
export interface RateLimitedResponse {
  statusCode: number;
  error: string;
  message: string;
  date: string;
  expiresIn: string;
}

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
  shard_count: number;
  /** Current rank by monthly votes */
  monthly_votes_rank: number;
  /** Current rank by server count */
  server_count_rank: number;
  /** Current rank by total votes */
  total_votes_rank: number;
  /** Current rank by shard count */
  shard_count_rank: number;
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
 * Available time frames for historical data queries
 */
export type HistoricalDataTimeFrame =
  | "alltime"
  | "5y"
  | "3y"
  | "1y"
  | "90d"
  | "30d"
  | "7d"
  | "1d"
  | "12hr"
  | "6hr";

/**
 * Types of data that can be queried historically
 */
export type HistoricalDataTypes =
  | "monthly_votes"
  | "total_votes"
  | "server_count"
  | "shard_count";

/**
 * Historical data point structure with type-safe value field
 */
export interface BaseHistoricalData {
  time: string;
  id: string;
}

export interface MonthlyVotesHistoricalData extends BaseHistoricalData {
  type: "monthly_votes";
  monthly_votes: number;
}

export interface TotalVotesHistoricalData extends BaseHistoricalData {
  type: "total_votes";
  total_votes: number;
}

export interface ServerCountHistoricalData extends BaseHistoricalData {
  type: "server_count";
  server_count: number;
}

export interface ShardCountHistoricalData extends BaseHistoricalData {
  type: "shard_count";
  shard_count: number;
}

export type HistoricalData =
  | MonthlyVotesHistoricalData
  | TotalVotesHistoricalData
  | ServerCountHistoricalData
  | ShardCountHistoricalData;

export interface HistoricalDataResponse {
  data: HistoricalData[];
}

export interface HistoricalDataRequest {
  id: string;
  timeFrame: HistoricalDataTimeFrame;
  type: HistoricalDataTypes;
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
  shard_count: number;
  total_votes: number;
  monthly_votes_change: number;
  monthly_votes_change_perc: number;
  server_count_change: number;
  shard_count_change: number;
  total_votes_change: number;
}

export interface RecentDataRequest {
  id: string;
}

export interface RecentDataResponse {
  hourlyData: RecentData[];
  dailyData: RecentData[];
}

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
  | "monthly_votes_rank"
  | "total_votes_rank"
  | "server_count_rank"
  | "shard_count_rank";

export type RankingsSortMethod = "asc" | "desc";

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

/**
 * Custom error classes for better error handling
 */
export class TopStatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TopStatsError";
    Object.setPrototypeOf(this, TopStatsError.prototype);
  }
}

export class RateLimitError extends TopStatsError {
  constructor(
    message: string,
    public expiresIn: string,
  ) {
    super(message);
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

export interface ClientOptions {
  /** API Token for authentication */
  token: string;
  /** Optional custom base URL */
  baseUrl?: string;
}

/**
 * Main client class for interacting with the TopStats API
 * @example
 * ```typescript
 * const client = new Client({ token: 'your-token' });
 * // or
 * const client = new Client('your-token');
 *
 * // Get bot info
 * const bot = await client.getBot('123456789');
 * ```
 */
export class Client {
  private readonly token: string;
  private readonly BASE_URL: string;

  /**
   * Creates a new TopStats API client
   * @param options - Token string or client options object
   */
  constructor(options: string | ClientOptions) {
    if (typeof options === "string") {
      this.token = options;
      this.BASE_URL = "https://api.topstats.gg";
    } else {
      this.token = options.token;
      this.BASE_URL = options.baseUrl ?? "https://api.topstats.gg";
    }
  }

  /**
   * Validates a Discord bot ID format
   * @throws {TopStatsError} If ID format is invalid
   */
  private validateBotId(botId: string): void {
    if (!/^\d{17,19}$/.test(botId)) {
      throw new TopStatsError("Invalid Discord bot ID format");
    }
  }

  /**
   * Makes an HTTP request to the API
   * @throws {RateLimitError} When rate limited
   * @throws {TopStatsError} For other API errors
   */
  private async _request<T>(
    method: string,
    path: string,
    query?: Record<string, any>,
  ): Promise<T> {
    try {
      const url = new URL(`${this.BASE_URL}${path}`);

      if (query && method === "GET") {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          Authorization: this.token,
          "Content-Type": "application/json",
          "User-Agent": "TopStats/1.0.0",
        },
        body: method !== "GET" && query ? JSON.stringify(query) : undefined,
      });

      const data = await response.json();

      if (response.status === 429) {
        const rateLimitData = data as RateLimitedResponse;
        throw new RateLimitError(
          rateLimitData.message,
          rateLimitData.expiresIn,
        );
      }

      if (!response.ok) {
        throw new TopStatsError(
          `API Error ${response.status}: ${response.statusText}`,
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof TopStatsError) throw error;
      throw new TopStatsError(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  }

  /**
   * Fetches detailed information about a specific bot
   * @param botId - The Discord bot ID
   * @throws {TopStatsError} If bot ID is invalid
   */
  async getBot(botId: string): Promise<BotData> {
    this.validateBotId(botId);
    return this._request<BotData>("GET", `/discord/bots/${botId}`);
  }

  /**
   * Fetch historical data for a specific bot
   * @param botId - The Discord bot ID
   * @param timeFrame - Time frame for historical data
   * @param type - Type of data to fetch
   */
  async getBotHistorical<T extends HistoricalDataTypes>(
    botId: string,
    timeFrame: HistoricalDataTimeFrame,
    type: T,
  ): Promise<{
    data: Array<Extract<HistoricalData, { type: T }>>;
  }> {
    this.validateBotId(botId);
    return this._request<{
      data: Array<Extract<HistoricalData, { type: T }>>;
    }>("GET", `/discord/bots/${botId}/historical`, { timeFrame, type });
  }

  /**
   * Fetches recent data for a specific bot
   * @param botId - The Discord bot ID
   */
  async getBotRecent(botId: string): Promise<RecentDataResponse> {
    this.validateBotId(botId);
    return this._request<RecentDataResponse>(
      "GET",
      `/discord/bots/${botId}/recent`,
    );
  }

  /**
   * Fetches bot rankings based on specified criteria
   * @param options - Ranking options
   * @throws {TopStatsError} If limit is invalid
   */
  async getRankings(
    options: Omit<RankingsRequest, "limit"> & { limit?: number },
  ): Promise<RankingsResponse> {
    const limit = options.limit ?? DEFAULT_RANKINGS_LIMIT;

    if (!isValidRankingsLimit(limit)) {
      throw new TopStatsError("Rankings limit must be between 1 and 500");
    }

    return this._request<RankingsResponse>("GET", "/discord/rankings/bots", {
      ...options,
      limit,
    });
  }
}
