import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { PDF_text_extraction_prompt } from "./Prompt.js";

export const extractTextFromImage = async (
  imageBuffers: Buffer[],
) => {

  const { text } = await generateText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PDF_text_extraction_prompt },
          ...imageBuffers.map(imageBuffer => (
            { image: imageBuffer,
             type: 'image' as const }
          )),
        ],
      },
    ],
  });
  return text;
};
