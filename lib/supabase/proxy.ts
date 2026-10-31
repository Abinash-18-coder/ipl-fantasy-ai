import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getClientEnv } from "@/lib/env";

export const PROTECTED_ROUTE_PREFIXES = ["/fantasy", "/settings"] as const;

export const PUBLIC_SEO_ROUTE_PREFIXES = [
  "/",
  "/scores",
  "/fixtures",
  "/analytics",
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function updateSessionAndGuardRoutes(
  request: NextRequest
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const env = getClientEnv();
  const { pathname } = request.nextUrl;

  const isPlaceholderSupabase =
    env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co") ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder-anon-key");

  if (isPlaceholderSupabase) {
    supabaseResponse.headers.set("x-cricintel-route-guard", "dev-bypass");
    return supabaseResponse;
  }

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("authRequired", "true");
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  supabaseResponse.headers.set(
    "x-cricintel-route-tier",
    isProtectedPath(pathname) ? "protected-authenticated" : "public-seo"
  );

  return supabaseResponse;
}