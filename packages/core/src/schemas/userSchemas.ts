import {z} from "zod";

export const maxEmails = 3;

export const createUserSchema = z.object({
    firstName: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z]+$/, 'First name must only contain letters (no spaces or special characters)'),
    lastName: z
        .string()
        .min(1)
        .regex(/^[a-zA-Z]+$/, 'Last name must only contain letters (no spaces or special characters)'),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    emails: z.array(z.string().email()).min(1).max(maxEmails),
});

export const userIdSchema = z.string().uuid();

export const updateUserSchema = createUserSchema.extend({
    userId: userIdSchema,
});

