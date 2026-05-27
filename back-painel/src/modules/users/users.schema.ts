import { z } from "zod";

export const UserItemSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  role: z.enum(["ADMIN", "VENDEDOR"]),
  isActive: z.boolean(),
});

export const UsersListResponseSchema = z.object({
  data: z.array(UserItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type UserItem = z.infer<typeof UserItemSchema>;
export type UsersListResponse = z.infer<typeof UsersListResponseSchema>;
