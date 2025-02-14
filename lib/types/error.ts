/**
 * Response structure for rate limit errors
 */
export interface RateLimitedResponse {
  statusCode: number;
  error: string;
  message: string;
  date: string;
  expiresIn: number;
}

/**
 * Custom error classes for better error handling
 */
export class TopStatsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TopStatsError';
    Object.setPrototypeOf(this, TopStatsError.prototype);
  }
}

export class RateLimitError extends TopStatsError {
  constructor(
    message: string,
    public expiresIn: number
  ) {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
