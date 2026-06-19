import { groq } from "@ai-sdk/groq";
import { generateText, Output, zodSchema } from "ai";
import { PDF_text_extraction_prompt } from "./Prompt.js";
import { textExtractionResponseSchema } from "@/utils/zodSchema.js";
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// old version
// export const processDocument = async (
//   imageBuffers: Buffer[],
// ) => {

//   const { output } = await generateText({
//     model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
//     output: Output.object({
//       schema: textExtractionResponseSchema
//     }),
//     messages: [
//       {
//         role: "user",
//         content: [
//           { type: "text", text: PDF_text_extraction_prompt },
//           ...imageBuffers.map(imageBuffer => (
//             {
//               image: imageBuffer,
//               type: 'image' as const
//             }
//           )),
//         ],
//       },
//     ],
//   });



//   console.log("PDF=>TEXT EXTRACTION", output)

//   return  textExtractionResponseSchema.parse(output)
// };

import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const processDocument = async (
  batch: Buffer[],
) => {
  const { output } = await generateText({
    model: google("gemini-2.5-flash"),

    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: PDF_text_extraction_prompt },
          ...batch.map(imageBuffer => (
            {
              image: imageBuffer,
              type: 'image' as const
            }
          )),
        ]
      },
    ],

    output: Output.object({
      schema: textExtractionResponseSchema
    }),
  });

  return output;
};