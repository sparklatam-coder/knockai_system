import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseUrl } from "./src/lib/env";

const protectedPaths = ["/admin", "/dashboard", "/map", "/api/admin", "/api/messaging"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // API routes handle their own auth via getAdminRequestContext; middleware is defense-in-depth
  const isApiRoute = pathname.startsWith("/api/");

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail closed: do not allow access when auth infrastructure is unavailable
    if (isApiRoute) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }
    return NextResponse.redirect(new URL("/login?error=service_unavailable", request.url));
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isApiRoute) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = user.app_metadata?.role;
  if (pathname.startsWith("/admin") && userRole !== "admin" && userRole !== "super_admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/map") && userRole !== "super_admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/map/:path*", "/api/admin/:path*", "/api/messaging/:path*"],
};
