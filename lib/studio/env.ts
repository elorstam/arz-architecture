import "server-only";

import {z} from "zod";

const studioServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export function getStudioServerEnv() {
  const result = studioServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `ARZ Studio environment is incomplete: ${result.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ")}`,
    );
  }
  return result.data;
}
