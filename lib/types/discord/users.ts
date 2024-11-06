import { BotData } from "./bots";

export interface GetUsersBotsRequest {
  id: string;
}

export interface GetUsersBotsResponse {
  bots: BotData[];
}
