import { z } from "zod";


// Define validation schemas
export const createFormSchema = z.object({
    name: z.string().min(1, "Form name is required"),
    description: z.string().optional(),
    fields: z.array(
        z.object({
            name: z.string().min(1, "Field name is required"),
            type: z.enum([
                "TEXT",
                "NUMBER",
                "DATE",
                "TIME",
            ] as const),
            required: z.boolean().optional().default(false),
        })
    ).min(1, "Form must have at least one field"),
});

export const createFormResponseSchema = z.object({
    formId: z.string().uuid("Invalid form ID"),
    responses: z.record(z.string(), z.any()),
});