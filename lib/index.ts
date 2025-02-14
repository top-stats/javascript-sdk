/**
 * @packageDocumentation
 * TopStats - Community maintained Node.js client for the topstats.gg API
 * @version 1.0.0
 */

import {
  BotData,
  HistoricalData,
  HistoricalTimeFrame,
  HistoricalDataType,
  RecentDataResponse,
} from './types/discord/bots';

import {
  isValidRankingsLimit,
  DEFAULT_RANKINGS_LIMIT,
  RankingsRequest,
  RankingsResponse,
} from './types/discord/rankings';

import { GetUsersBotsResponse } from './types/discord/users';

import {
  RateLimitError,
  TopStatsError,
  RateLimitedResponse,
} from './types/error';

import { CompareBotsHistoricalRequest } from './types/discord/compare';

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
    if (typeof options === 'string') {
      this.token = options;
      this.BASE_URL = 'https://api.topstats.gg';
    } else {
      this.token = options.token;
      this.BASE_URL = options.baseUrl ?? 'https://api.topstats.gg';
    }

    if (!this.token) {
      throw new TopStatsError('No API token provided');
    }
  }

  /**
   * Validates a Discord bot ID format
   * @throws {TopStatsError} If ID format is invalid
   */
  private validateBotId(botId: string): void {
    if (!/^\d{17,19}$/.test(botId)) {
      throw new TopStatsError('Invalid Discord bot ID format');
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
    query?: Record<string, unknown>
  ): Promise<T> {
    try {
      const url = new URL(`${this.BASE_URL}${path}`);

      if (query && method === 'GET') {
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
          'Content-Type': 'application/json',
          'User-Agent': 'TopStats/1.0.0',
        },
        body: method !== 'GET' && query ? JSON.stringify(query) : undefined,
      });

      const data = await response.json();

      if (response.status === 429) {
        const rateLimitData = data as RateLimitedResponse;
        throw new RateLimitError(
          rateLimitData.message,
          rateLimitData.expiresIn
        );
      }

      if (!response.ok) {
        throw new TopStatsError(
          `API Error ${response.status}: ${response.statusText}`
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof TopStatsError) throw error;
      throw new TopStatsError(
        error instanceof Error ? error.message : 'Unknown error occurred'
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
    return this._request<BotData>('GET', `/discord/bots/${botId}`);
  }

  /**
   * Fetch historical data for a specific bot
   * @param botId - The Discord bot ID
   * @param timeFrame - Time frame for historical data
   * @param type - Type of data to fetch
   */
  async getBotHistorical<T extends HistoricalDataType>(
    botId: string,
    timeFrame: HistoricalTimeFrame,
    type: T
  ): Promise<{ data: Array<Extract<HistoricalData, { type: T }>> }> {
    this.validateBotId(botId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this._request<any>(
      'GET',
      `/discord/bots/${botId}/historical`,
      { timeFrame, type }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedData = response.data.map((item: any) => ({
      time: item.time,
      id: item.id,
      type: type,
      value: item[type],
    }));

    return { data: transformedData };
  }

  /**
   * Fetches recent data for a specific bot
   * @param botId - The Discord bot ID
   */
  async getBotRecent(botId: string): Promise<RecentDataResponse> {
    this.validateBotId(botId);
    return this._request<RecentDataResponse>(
      'GET',
      `/discord/bots/${botId}/recent`
    );
  }

  /**
   * Fetches bot rankings based on specified criteria
   * @param options - Ranking options
   * @throws {TopStatsError} If limit is invalid
   */
  async getRankings(
    options: Omit<RankingsRequest, 'limit'> & { limit?: number }
  ): Promise<RankingsResponse> {
    const limit = options.limit ?? DEFAULT_RANKINGS_LIMIT;

    if (!isValidRankingsLimit(limit)) {
      throw new TopStatsError('Rankings limit must be between 1 and 500');
    }

    return this._request<RankingsResponse>('GET', '/discord/rankings/bots', {
      ...options,
      limit,
    });
  }

  /**
   * Fetches a user's bots
   * @param id - The Discord user ID
   */
  async getUsersBots(id: string): Promise<GetUsersBotsResponse> {
    return this._request<GetUsersBotsResponse>(
      'GET',
      `/discord/users/${id}/bots`
    );
  }

  /**
   * Compare multiple Discord bots.
   *
   * This method fetches the latest bot stats across multiple bots.
   *
   * @param ids - Array of Discord bot IDs
   * @returns A promise with the comparison data
   * @throws {TopStatsError} If any provided bot ID is invalid
   */
  async compareBots(ids: string[]): Promise<{ data: unknown[] }> {
    // Validate each ID in the request
    ids.forEach((id) => this.validateBotId(id));

    // Construct the endpoint by joining the ids with a slash
    const path = `/discord/compare/${ids.join('/')}`;

    return this._request<{ data: unknown[] }>('GET', path);
  }

  /**
   * Compare historical data for multiple Discord bots.
   *
   * This method fetches historical data (based on the provided timeframe and data type)
   * for a set of bots.
   *
   * @param request - Object containing an array of bot IDs, a timeFrame, and a historical data type
   * @returns A promise with the historical compare data
   * @throws {TopStatsError} If any provided bot ID is invalid
   */
  async compareBotsHistorical(
    request: CompareBotsHistoricalRequest
  ): Promise<{ data: Record<string, unknown[]> }> {
    const { ids, timeFrame, type } = request;

    // Validate each ID in the request
    ids.forEach((id) => this.validateBotId(id));

    // Construct the endpoint by joining the ids with a slash, then use the "historical" endpoint
    const path = `/discord/compare/historical/${ids.join('/')}`;

    return this._request<{ data: Record<string, unknown[]> }>('GET', path, {
      timeFrame,
      type,
    });
  }
}

export * from './types/discord/bots';
export * from './types/discord/rankings';
export * from './types/discord/users';
export * from './types/error';
