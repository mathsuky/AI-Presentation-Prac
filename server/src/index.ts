import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ChatOpenAI } from "@langchain/openai";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

require("dotenv").config();

const chatModel = new ChatOpenAI({
  model: "gpt-4o",
});

const app = new Hono();

const schema = z.object({
  message: z.string(),
  images: z.string().array().optional(),
});

type MessageType =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: { url: string };
    };

app.post(
  "/chat",
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      return c.json({ error: "invalid json" }, 400);
    }
  }),
  async (c) => {
    const { message, images } = c.req.valid("json");
    let content: MessageType[] = [{ type: "text", text: message }];
    if (images) {
      for (const image of images) {
        content.push({ type: "image_url", image_url: { url: image } });
      }
    }
    const aiMessageChunk = await chatModel.invoke([
      {
        role: "user",
        content,
      },
    ]);
    return c.json({ content: aiMessageChunk });
  },
);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
