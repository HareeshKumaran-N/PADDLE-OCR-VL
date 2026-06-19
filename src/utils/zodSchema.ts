import z from "zod";


export const textExtractionResponseSchema = z.object({
  extracted_content: z.string().min(1,"extracted text cannot be empty"),
  chunks: z.array(z.string()).nonempty(),
  isError: z.boolean(),
  errorMessage: z.string(),
})
