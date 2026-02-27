import { groq } from "@ai-sdk/groq";
import { generateText, Output, zodSchema } from "ai";
import { PDF_text_extraction_prompt } from "./Prompt.js";
import z from "zod";

const outputSchema = z.object({
  extracted_semantic_content: z.string(),
  chunks: z.array(z.string()),
  isError: z.boolean().default(false),
  errorMessage: z.string().default(''),
})


export const extractTextFromImage = async (
  imageBuffers: Buffer[],
): Promise<z.infer<typeof outputSchema>> => {


  const { output } = await generateText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    output: Output.object({
      schema: outputSchema
    }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PDF_text_extraction_prompt },
          ...imageBuffers.map(imageBuffer => (
            {
              image: imageBuffer,
              type: 'image' as const
            }
          )),
        ],
      },
    ],
  });

  console.log("PDF=>TEXT EXTRACTION", output)
  
  return output;
};
