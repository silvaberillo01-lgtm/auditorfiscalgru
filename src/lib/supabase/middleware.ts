import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ROTAS_PUBLICAS = ["/login", "/auth/callback"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const rotaPublica = ROTAS_PUBLICAS.some((r) => path.startsWith(r));

  if (!user && !rotaPublica) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && path === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
