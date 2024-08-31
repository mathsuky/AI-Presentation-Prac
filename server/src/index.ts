import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ChatOpenAI } from "@langchain/openai";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

require("dotenv").config({
  chatModel: "gpt-4o"
});

const chatModel = new ChatOpenAI();

const app = new Hono();

const schema = z.object({
  message: z.string(),
});

app.post(
  "/chat",
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid json" }, 400);
    }
  }),
  async (c) => {
    const { message } = c.req.valid("json");
    const aiMessageChunk = await chatModel.invoke(message);
    return c.json({ content: aiMessageChunk });
  },
);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
