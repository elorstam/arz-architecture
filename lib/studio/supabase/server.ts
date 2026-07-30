import "server-only";

import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";

import {getStudioServerEnv} from "@/lib/studio/env";

export async function createStudioServerClient() {
  const cookieStore = await cookies();
  const env = getStudioServerEnv();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const {name, value, options} of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot always set cookies; proxy refreshes them.
        }
      },
    },
  });
}
