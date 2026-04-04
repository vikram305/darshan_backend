import { z } from 'zod';

export const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format'),
    firstName: z.string().min(2, 'First name must be at least 2 characters').nullable().optional()
  })
});

// Infering TypeScript types from the Zod schema automatically
export type CreateUserDto = z.infer<typeof CreateUserSchema>['body'];
