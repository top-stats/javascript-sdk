# TopStats

Community maintained Node.js client for the [topstats.gg](https://topstats.gg) API

## Installation

```bash
npm install topstats
```

## Quick Start

```typescript
import { Client, HistoricalDataType, HistoricalTimeFrame } from "@topstats/sdk";

// Initialize client with your API token
const client = new Client("YOUR_TOKEN");

// Get bot information
const bot = await client.getBot("583807014896140293");
console.log(bot.name, bot.server_count);

// Get historical data
const history = await client.getBotHistorical(
  "583807014896140293",
  HistoricalTimeFrame.THIRTY_DAYS,
  HistoricalDataType.MONTHLY_VOTES
);
console.log(history.data);

// Get recent statistics
const recent = await client.getBotRecent("583807014896140293");
console.log(recent.hourlyData, recent.dailyData);

// Get top bots ranking
const rankings = await client.getRankings({
  sortBy: "monthly_votes_rank",
  sortMethod: "desc",
});
console.log(rankings.data);

// Compare multiple bots (latest data)
const compareResponse = await client.compareBots([
  "432610292342587392",
  "646937666251915264",
]);
console.log("Compare Bots:", compareResponse.data);

// Compare historical data for multiple bots
const historicalCompareResponse = await client.compareBotsHistorical({
  ids: ["432610292342587392", "646937666251915264"],
  timeFrame: HistoricalTimeFrame.SEVEN_DAYS,
  type: HistoricalDataType.MONTHLY_VOTES,
});
console.log("Historical Compare Data:", historicalCompareResponse.data);
```

## API Reference

### Constructor

```typescript
new Client(token: string)
// or
new Client({ token: string })
```

### Methods

#### `getBot(botId: string): Promise<BotData>`

Fetches detailed information about a specific bot.

```typescript
const bot = await client.getBot("583807014896140293");
```

#### `getBotHistorical(botId: string, timeFrame: HistoricalTimeFrame, type: HistoricalDataType): Promise<HistoricalDataResponse>`

Fetches historical data for a specific bot.

```typescript
const history = await client.getBotHistorical(
  "583807014896140293",
  HistoricalTimeFrame.THIRTY_DAYS,
  HistoricalDataType.MONTHLY_VOTES
);
```

#### `getBotRecent(botId: string): Promise<RecentDataResponse>`

Fetches recent statistics for a specific bot.

```typescript
const recent = await client.getBotRecent("583807014896140293");
```

#### `getRankings(options: RankingsRequest): Promise<RankingsResponse>`

Fetches bot rankings based on specified criteria.

```typescript
const rankings = await client.getRankings({
  sortBy: "monthly_votes_rank",
  sortMethod: "desc",
  limit: 250, // Optional, defaults to 100
});
```

#### `compareBots(ids: string[]): Promise<{ data: any[] }>` 

Fetches the latest statistics for multiple bots and returns their data for comparison.

```typescript
const compareResponse = await client.compareBots([
  "432610292342587392",
  "646937666251915264",
]);
```

#### `compareBotsHistorical(request: CompareBotsHistoricalRequest): Promise<{ data: Record<string, any[]> }>` 

Fetches historical comparison data for multiple bots based on the provided time frame and data type.

```typescript
const historicalCompareResponse = await client.compareBotsHistorical({
  ids: ["432610292342587392", "646937666251915264"],
  timeFrame: HistoricalTimeFrame.SEVEN_DAYS,
  type: HistoricalDataType.MONTHLY_VOTES,
});
```

### Types

```typescript
// Bot data and statistics
interface BotData {
  id: string;
  name: string;
  server_count: number;
  monthly_votes: number;
  total_votes: number;
  // ... and more
}

// Recent data statistics
interface RecentDataResponse {
  hourlyData: RecentData[];
  dailyData: RecentData[];
}

// Rankings response
interface RankingsResponse {
  totalBotCount: number;
  data: RankingsData[];
}

// Compare response
interface CompareBotsResponse {
  data: any[];
}

// Historical compare response
interface CompareBotsHistoricalResponse {
  data: Record<string, any[]>;
}
```

## Error Handling

The client throws typed errors for different scenarios:

```typescript
try {
  await client.getBot("invalid-id");
} catch (error) {
  if (error instanceof RateLimitError) {
    // Handle rate limit
    console.log("Rate limited, try again later");
  } else if (error instanceof TopStatsError) {
    // Handle other API errors
    console.error("API Error:", error.message);
  } else {
    // Handle unknown errors
    console.error("Unknown Error:", error);
  }
}
```

## Rate Limits

The API has a rate limit that varies per route, typically 60 requests per minute. You can find up-to-date rate limit information in the [official docs](https://docs.topstats.gg/authentication/ratelimits/).

## Examples

### Tracking Bot Growth

```typescript
// Get monthly growth statistics
const history = await client.getBotHistorical(
  "583807014896140293",
  HistoricalTimeFrame.THIRTY_DAYS,
  HistoricalDataType.SERVER_COUNT
);

const growth = history.data.reduce((acc, curr, i, arr) => {
  if (i === 0) return acc;
  const prev = arr[i - 1];
  const diff = curr.value - prev.value;
  return acc + diff;
}, 0);

console.log(`30-day growth: ${growth} servers`);
```

### Getting Top 10 Bots

```typescript
const top10 = await client.getRankings({
  sortBy: "monthly_votes_rank",
  sortMethod: "desc",
  limit: 10,
});

console.log("Top 10 Bots by Monthly Votes:");
top10.data.forEach((bot, i) => {
  console.log(`${i + 1}. ${bot.name}: ${bot.monthly_votes} votes`);
});
```

### Comparing Multiple Bots

```typescript
// Compare basic data for two bots
const compareBots = await client.compareBots([
  "432610292342587392",
  "646937666251915264",
]);
console.log("Comparative Bot Data:", compareBots.data);

// Compare historical monthly votes data over the last 7 days
const compareHistorical = await client.compareBotsHistorical({
  ids: ["432610292342587392", "646937666251915264"],
  timeFrame: HistoricalTimeFrame.SEVEN_DAYS,
  type: HistoricalDataType.MONTHLY_VOTES,
});
console.log("Comparative Historical Data:", compareHistorical.data);
```

## License

MIT
