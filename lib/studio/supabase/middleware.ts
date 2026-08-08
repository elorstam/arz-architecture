import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";

export async function refreshStudioSession(
  request: NextRequest,
  responseFactory: () => NextResponse = () => NextResponse.next({request}),
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return responseFactory();

  let response = responseFactory();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const {name, value} of cookiesToSet) request.cookies.set(name, value);
        response = responseFactory();
        for (const {name, value, options} of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}
