import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = new Set(["/login", "/signup"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();

  const hasSession = !!request.cookies.get("ocss_session")?.value;
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|favicon|robots|sitemap|.*\\..*).*)"],
};
