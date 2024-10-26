import { test, expect } from "@playwright/test";
import { Client, HistoricalDataTypes } from "../lib";
import "dotenv/config";

const TEST_BOT_ID = "583807014896140293";
const TOKEN = process.env.TOKEN!;

let client: Client;

test.beforeAll(() => {
  if (!TOKEN) {
    throw new Error("TOKEN environment variable is required");
  }
  client = new Client(TOKEN);
});

test.describe("TopStats API Client", () => {
  test.describe("Bot Information", () => {
    test("should fetch bot details", async () => {
      const bot = await client.getBot(TEST_BOT_ID);

      expect(bot).toBeDefined();
      expect(bot.id).toBe(TEST_BOT_ID);
      expect(bot.name).toBeTruthy();
      expect(typeof bot.server_count).toBe("number");
      expect(typeof bot.monthly_votes).toBe("number");
    });

    test("should reject invalid bot ID", async () => {
      await expect(client.getBot("invalid-id")).rejects.toThrow();
    });
  });

  test.describe("Historical Data", () => {
    const dataTypes: HistoricalDataTypes[] = [
      "monthly_votes",
      "total_votes",
      "server_count",
      "shard_count",
    ];

    for (const type of dataTypes) {
      test(`should fetch 24h ${type} data`, async () => {
        const history = await client.getBotHistorical(TEST_BOT_ID, "1d", type);

        expect(history.data).toBeInstanceOf(Array);
        expect(history.data.length).toBeGreaterThan(0);

        const dataPoint = history.data[0];
        expect(dataPoint).toHaveProperty("time");
        expect(dataPoint).toHaveProperty("id");
        expect(dataPoint).toHaveProperty(type);
        expect(typeof dataPoint[type]).toBe("number");
      });
    }

    test("should fetch data for different timeframes", async () => {
      const timeframes = ["1d", "7d", "30d"] as const;

      for (const timeframe of timeframes) {
        for (const type of dataTypes) {
          const history = await client.getBotHistorical(
            TEST_BOT_ID,
            timeframe,
            type,
          );

          expect(history.data.length).toBeGreaterThan(0);
          expect(history.data[0]).toHaveProperty(type);
        }
      }
    });

    test("should have correct type-specific data", async () => {
      // Monthly votes
      const monthlyVotes = await client.getBotHistorical(
        TEST_BOT_ID,
        "1d",
        "monthly_votes",
      );
      expect(monthlyVotes.data[0]).toHaveProperty("monthly_votes");

      // Total votes
      const totalVotes = await client.getBotHistorical(
        TEST_BOT_ID,
        "1d",
        "total_votes",
      );
      expect(totalVotes.data[0]).toHaveProperty("total_votes");

      // Server count
      const serverCount = await client.getBotHistorical(
        TEST_BOT_ID,
        "1d",
        "server_count",
      );
      expect(serverCount.data[0]).toHaveProperty("server_count");

      // Shard count
      const shardCount = await client.getBotHistorical(
        TEST_BOT_ID,
        "1d",
        "shard_count",
      );
      expect(shardCount.data[0]).toHaveProperty("shard_count");
    });
  });

  test.describe("Recent Data", () => {
    test("should fetch recent statistics", async () => {
      const recent = await client.getBotRecent(TEST_BOT_ID);

      expect(recent).toHaveProperty("hourlyData");
      expect(recent).toHaveProperty("dailyData");
      expect(recent.hourlyData).toBeInstanceOf(Array);
      expect(recent.dailyData).toBeInstanceOf(Array);
    });

    test("should have properly structured data", async () => {
      const recent = await client.getBotRecent(TEST_BOT_ID);

      const requiredProperties = [
        "time",
        "monthly_votes",
        "server_count",
        "shard_count",
        "total_votes",
        "monthly_votes_change",
        "server_count_change",
        "total_votes_change",
      ];

      if (recent.hourlyData.length > 0) {
        const hourlyPoint = recent.hourlyData[0];
        requiredProperties.forEach((prop) => {
          expect(hourlyPoint).toHaveProperty(prop);
        });
      }

      if (recent.dailyData.length > 0) {
        const dailyPoint = recent.dailyData[0];
        requiredProperties.forEach((prop) => {
          expect(dailyPoint).toHaveProperty(prop);
        });
      }
    });
  });

  test.describe("Rankings", () => {
    test("should fetch default rankings", async () => {
      const rankings = await client.getRankings({
        sortBy: "monthly_votes_rank",
        sortMethod: "desc",
      });

      expect(rankings).toHaveProperty("totalBotCount");
      expect(rankings).toHaveProperty("data");
      expect(rankings.data.length).toBe(100); // Default limit
    });

    test("should fetch rankings with custom limit", async () => {
      const limit = 250;
      const rankings = await client.getRankings({
        limit,
        sortBy: "monthly_votes_rank",
        sortMethod: "desc",
      });

      expect(rankings.data.length).toBe(limit);
    });

    test("should reject invalid limits", async () => {
      await expect(
        client.getRankings({
          limit: 1000,
          sortBy: "monthly_votes_rank",
          sortMethod: "desc",
        }),
      ).rejects.toThrow();
    });

    test("should sort correctly", async () => {
      const rankings = await client.getRankings({
        sortBy: "monthly_votes_rank",
        sortMethod: "asc",
        limit: 10,
      });

      const ranks = rankings.data.map((bot) => bot.monthly_votes_rank);
      const sortedRanks = [...ranks].sort((a, b) => a - b);
      expect(ranks).toEqual(sortedRanks);
    });
  });

  test.describe("Error Handling", () => {
    test("should handle rate limits with sequential requests", async () => {
      // Make many sequential requests to trigger rate limit
      for (let i = 0; i < 100; i++) {
        try {
          await client.getBot(TEST_BOT_ID);
        } catch (error) {
          // Check for the actual rate limit message
          expect(error.message).toBe(
            "You can only make 60 requests per 1 minute. Try again soon.",
          );
          return; // Test passes if we hit rate limit
        }
      }

      throw new Error("Expected rate limit to be hit");
    });

    test("should handle network errors", async () => {
      const badClient = new Client({
        token: TOKEN,
        baseUrl: "https://invalid-url.example.com",
      });

      await expect(badClient.getBot(TEST_BOT_ID)).rejects.toThrow();
    });
  });
});
