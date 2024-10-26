# TopStats

Official Node.js client for the [topstats.gg](https://topstats.gg) API

## Installation

```bash
npm install topstats
```

## Quick Start

```typescript
import { Client } from 'topstats';

// Initialize client with your API token
const client = new Client('YOUR_TOKEN');

// Get bot information
const bot = await client.getBot('583807014896140293');
console.log(bot.name, bot.server_count);

// Get historical data
const history = await client.getBotHistorical(
  '583807014896140293',
  '30d',
  'monthly_votes'
);
console.log(history.data);

// Get recent statistics
const recent = await client.getBotRecent('583807014896140293');
console.log(recent.hourlyData, recent.dailyData);

// Get top bots ranking
const rankings = await client.getRankings({
  sortBy: 'monthly_votes_rank',
  sortMethod: 'desc'
});
console.log(rankings.data);
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
const bot = await client.getBot('583807014896140293');
```

#### `getBotHistorical(botId: string, timeFrame: HistoricalDataTimeFrame, type: HistoricalDataTypes): Promise<HistoricalDataResponse>`
Fetches historical data for a specific bot.

```typescript
// Available timeframes
type HistoricalDataTimeFrame = 
  'alltime' | '5y' | '3y' | '1y' | '90d' | 
  '30d' | '7d' | '1d' | '12hr' | '6hr';

// Available data types
type HistoricalDataTypes = 
  'monthly_votes' | 'total_votes' | 
  'server_count' | 'shard_count';

const history = await client.getBotHistorical(
  '583807014896140293',
  '30d',
  'monthly_votes'
);
```

#### `getBotRecent(botId: string): Promise<RecentDataResponse>`
Fetches recent statistics for a specific bot.

```typescript
const recent = await client.getBotRecent('583807014896140293');
```

#### `getRankings(options: RankingsRequest): Promise<RankingsResponse>`
Fetches bot rankings based on specified criteria.

```typescript
const rankings = await client.getRankings({
  sortBy: 'monthly_votes_rank',
  sortMethod: 'desc',
  limit: 250 // Optional, defaults to 100
});
```

### Types

```typescript
interface BotData {
  id: string;
  name: string;
  server_count: number;
  monthly_votes: number;
  total_votes: number;
  // ... and more
}

interface RecentDataResponse {
  hourlyData: RecentData[];
  dailyData: RecentData[];
}

interface RankingsResponse {
  totalBotCount: number;
  data: RankingsData[];
}
```

## Error Handling

The client throws typed errors for different scenarios:

```typescript
try {
  await client.getBot('invalid-id');
} catch (error) {
  if (error.message.includes('Rate limit')) {
    // Handle rate limit
    console.log('Rate limited, try again later');
  } else {
    // Handle other errors
    console.error('Error:', error.message);
  }
}
```

## Rate Limits

The API has a rate limit of 60 requests per minute. The client will throw an error when the rate limit is exceeded.

## Examples

### Tracking Bot Growth

```typescript
// Get monthly growth statistics
const history = await client.getBotHistorical(
  '583807014896140293',
  '30d',
  'server_count'
);

const growth = history.data.reduce((acc, curr, i, arr) => {
  if (i === 0) return acc;
  const diff = curr.server_count - arr[i-1].server_count;
  return acc + diff;
}, 0);

console.log(`30-day growth: ${growth} servers`);
```

### Getting Top 10 Bots

```typescript
const top10 = await client.getRankings({
  sortBy: 'monthly_votes_rank',
  sortMethod: 'desc',
  limit: 10
});

console.log('Top 10 Bots by Monthly Votes:');
top10.data.forEach((bot, i) => {
  console.log(`${i + 1}. ${bot.name}: ${bot.monthly_votes} votes`);
});
```

## License

MIT
