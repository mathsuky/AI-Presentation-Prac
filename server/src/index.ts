import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { ChatOpenAI } from "@langchain/openai";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { cors } from "hono/cors";
import OpenAI from "openai";

require("dotenv").config();

const chatModel = new ChatOpenAI({
  model: "gpt-4o-2024-08-06",
});

const app = new Hono();

if (process.env.NODE_ENV === "development") {
  app.use("/*", cors());
}

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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/audio-to-text", async (c) => {
  const { audio } = await c.req.parseBody();
  if (!audio) {
    return c.json({ error: "audio is required" }, 400);
  }
  if (typeof audio === "string") {
    return c.json({ error: "audio must be a audio file" }, 400);
  }
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: "whisper-1",
  });
  return c.json({ text: transcription.text });
});

const orderText = `あなたはプレゼンテーションの授業の先生です。生徒のプレゼンテーションの音声の文字起こしが文字列として、スライドが画像の列として順番に渡されるので、生徒に適切なフィードバックを与えてください。日本語で答えてください。以下の3つの事柄についてフィードバックしてください。
contradiction: 文字起こしとスライドとの間に食い違いがある場合、その食い違いを列挙してください。無い場合は空の配列を返してください。
potential questions: 生徒のプレゼンテーションに対して、想定される質問を2つ以上列挙してください。
improvement: 生徒のスライドや、発表の仕方に対して、改善点を2つ以上列挙してください。
`;

const feedbackSchema = z.object({
  contradiction: z.string().array(),
  potential_questions: z.string().array(),
  improvement: z.string().array(),
});

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
    const aiMessageChunk = await chatModel
      .withStructuredOutput(feedbackSchema)
      .invoke([
        { role: "system", content: [{ type: "text", text: orderText }] },
        {
          role: "user",
          content,
        },
      ]);
    return c.json(aiMessageChunk);
  },
);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
