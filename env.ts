import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NOTION_SECRET: z.string(),
    NOTION_DATABASE_ID: z.string().length(32),
    NOTION_DATA_SOURCE_ID: z.uuid(),
  },
  client: {},
  runtimeEnv: {
    NOTION_SECRET: process.env.NOTION_SECRET,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NOTION_DATA_SOURCE_ID: process.env.NOTION_DATA_SOURCE_ID,
  },
});
