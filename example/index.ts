import "dotenv/config";
import { Client, HistoricalDataType, HistoricalTimeFrame } from "../lib";

const BOT_ID = "583807014896140293";

async function main() {
  // Initialize client
  const client = new Client(process.env.TOKEN!);

  // Get basic bot information
  const bot = await client.getBot(BOT_ID);
  console.log("Bot Info:", {
    name: bot.name,
    servers: bot.server_count,
    votes: bot.monthly_votes,
  });

  // Get historical data (last 24h)
  const history = await client.getBotHistorical(
    BOT_ID,
    HistoricalTimeFrame.ONE_DAY,
    HistoricalDataType.MONTHLY_VOTES,
  );
  console.log("24h History:", history.data.length, "entries");
  console.log("First Entry:", history.data[0]);

  const history7d = await client.getBotHistorical(
    BOT_ID,
    HistoricalTimeFrame.SEVEN_DAYS,
    HistoricalDataType.MONTHLY_VOTES,
  );
  console.log("7d History:", history7d.data.length, "entries");
  console.log("First Entry:", history7d.data[0]);

  // Get recent stats
  const recent = await client.getBotRecent(BOT_ID);
  console.log("Recent Stats:", {
    hourly: recent.hourlyData.length,
    daily: recent.dailyData.length,
  });

  // Get top 100 bots
  const rankings = await client.getRankings({
    sortBy: "monthly_votes_rank",
    sortMethod: "desc",
  });
  console.log("Top Bots:", rankings.totalBotCount, "total bots");

  // Get a user's bot list
  const userBots = (await client.getUsersBots("205680187394752512")).bots; // Xignotic's ID
  console.log("Xignotic's Bots:", userBots.length, "total bots");
}

main().catch(console.error);
