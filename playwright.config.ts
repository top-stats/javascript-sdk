import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  timeout: 30000,
  retries: 1,
  workers: 1, 
  reporter: "list",
  use: {
    baseURL: "https://api.topstats.gg",
  },
};

export default config;
