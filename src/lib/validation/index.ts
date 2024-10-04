import { z } from "zod";

/**
 * SignupValidation is a Zod schema used to validate the data for user sign-up.
 * It ensures that the following fields meet the specified criteria:
 * - name: A string that must be at least 2 characters long.
 * - username: A string that must be at least 2 characters long.
 * - email: A valid email address.
 * - password: A string that must be at least 8 characters long.
 */

export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Too short" }),
  username: z.string().min(2, { message: "Too short" }),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

/**
 * SignInValidation is a Zod schema used to validate the data for user sign-in.
 * It ensures that the following fields meet the specified criteria:
 * - email: A valid email address.
 * - password: A string that must be at least 8 characters long.
 */

export const SignInValidation = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

/**
 * PostValidation is a Zod schema used to validate the data for creating or updating a post.
 * It ensures that the following fields meet the specified criteria:
 * - caption: A string representing the content of the post.
 * - file: A custom validation for an array of File objects, ensuring that files are provided.
 * - location: A string that must be between 2 and 100 characters long, representing the location of the post.
 * - tags: A string representing the tags associated with the post.
 */

export const PostValidation = z.object({
  caption: z.string(),
  file: z.custom<File[]>(),
  location: z.string().min(2).max(100),
  tags: z.string(),
});
