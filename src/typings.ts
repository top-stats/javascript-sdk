type Snowflake = string

interface Bot {
  /**
   * Whether or not the bot is certified
   */
  certified: boolean
  /**
   * Array of owner ID's
   */
  owners: Snowflake[]
  /**
   * Whether or not the bot is deleted
   */
  deleted: boolean
  /**
   * The ID of the bot
   */
  id: Snowflake
  /**
   * The name of the bot
   */
  name: string
  /**
   * The cdn hash of the bot's avatar if the bot has none
   */
  def_avatar: string
  /**
   * The avatar hash of the bot's avatar
   */
  avatar: string
  /**
   * Short description of the bot
   */
  short_desc: string
  /**
   * The library the bot uses
   */
  lib: string
  /**
   * The prefix of the bot
   */
  prefix: string
  /**
   * Website for the bot
   */
  website: string
  /**
   * When the bot was approved in ISO 8601
   */
  approved_at: string
  /**
   * Amount of votes this month
   */
  monthly_votes: number
  /**
   * Amount of total votes
   */
  total_votes: number
  /**
   * Amount of shards
   */
  shard_count: number
  /**
   * Rank on monthly votes leaderboard
   */
  monthly_votes_rank: number
  /**
   * Rank on shard count leaderboard
   */
  shard_count_rank: number
  /**
   * When this data was captured from
   */
  timestamp: string
  /**
   * Unix timestamp
   */
  unix_timestamp: number
}

interface User {
  /**
   * ID of the user
   */
  id: Snowflake
  /**
   * The cdn hash of the user's avatar if the user has none
   */
  def_avatar: string
  /**
   * The avatar hash of the user's avatar
   */
  avatar: string
  /**
   * The tag of the user ({username}#{discriminator})
   */
  tag: string
}

type LeaderboardType = 'servers' | 'votes' | 'monthly votes' | 'shards'