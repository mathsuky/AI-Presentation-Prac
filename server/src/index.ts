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

app.use("/*", cors());

const schema = z.object({
  message: z.union([z.string(), z.string().array()]),
  images: z.string().array().optional(),
});

type MessageType =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image_url";
      image_url: { url: string; detail?: "low" | "high" };
    };

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/audio-to-text", async (c) => {
  const { audio, image } = await c.req.parseBody();
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
  if (typeof image === "string") {
    const systemMessage = "生徒のプレゼンテーションの音声の文字起こしが文字列として、スライドが画像として与えられます。あなたのタスクは、スライドから得られる情報を使って、文字起こしに含まれるタイプミスを修正してください。与えられたコンテキストのみを使ってください。"
    const aiMessageChunk = await chatModel
      .withStructuredOutput(z.object({ text: z.string() }))
      .invoke([
        {
          role: "system",
          content: [{ type: "text", text: systemMessage }],
        },
        {
          role: "user",
          content: [
            { type: "text", text: transcription.text },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ]);
    return c.json(aiMessageChunk);
  }
  return c.json({ text: transcription.text });
});

const orderText = (is_single_text: boolean) => {
  const single_text_structure =
    "生徒のプレゼンテーションの音声の文字起こしが文字列として、スライドが画像の列として順番に渡されるので";
  const multi_text_structure =
    "生徒のプレゼンテーションのスライドの画像と、そのスライドに対応する発表の音声の文字起こしが交互に渡されるので";
  const text = `あなたはプレゼンテーションの授業の先生です。${is_single_text ? single_text_structure : multi_text_structure}、生徒に適切なフィードバックを与えてください。文字起こしとスライドから得られる情報のみから答えてください。以下の3つの事柄についてフィードバックしてください。日本語で答えてください。スライドの時系列を考慮してフィードバックしてください。
contradiction: 文字起こしとスライドとの間に食い違いがある場合、その食い違いを列挙してください。無い場合は空の配列を返してください。
potential questions: 生徒のプレゼンテーションに対して、想定される質問を挙げてください。特に良い質問がなければ、空の配列を返してください。
improvement: 生徒のスライドや、発表の仕方に対して、良い点にも触れつつ、改善点を挙げてください。スライドについて言及する時は、何枚目のスライドの話なのかを文章に含めてください。特に改善点がなければ、空の配列を返してください。
`;
  return text;
};

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
    let content: MessageType[] = [];
    const is_single_text = typeof message === "string";
    if (is_single_text) {
      content = [{ type: "text", text: message }];
      if (images) {
        for (const image of images) {
          content.push({ type: "image_url", image_url: { url: image } });
        }
      }
    } else {
      if (!images) {
        return c.json({ error: "images is required for multiple text" }, 400);
      }
      if (message.length !== images.length) {
        return c.json(
          { error: "message and images must have the same length" },
          400
        );
      }
      for (let i = 0; i < message.length; i++) {
        content.push({
          type: "image_url",
          image_url: { url: images[i], detail: "low" },
        });
        content.push({ type: "text", text: message[i] });
      }
    }
    const aiMessageChunk = await chatModel
      .withStructuredOutput(feedbackSchema)
      .invoke([
        {
          role: "system",
          content: [{ type: "text", text: orderText(is_single_text) }],
        },
        {
          role: "user",
          content,
        },
      ]);
    return c.json(aiMessageChunk);
  }
);

const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
