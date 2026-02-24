import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { text_extraction_prompt } from "./Prompt.js";

type ImageBytes = Uint8Array | ArrayBuffer | Buffer;

export const textExtractorFromImage = async (
  image: string,
  mediaType: string = "image/png",
) => {
  
  const { text } = await generateText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: text_extraction_prompt },
          {
            type: "image",
            image,
            mediaType,
          },
        ],
      },
    ],
  });
  return text;
};
