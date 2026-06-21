import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/",
  "/products",
  "/categories",
];

const ADMIN_PREFIX = "/admin";
const AUTH_PATHS = ["/account", "/checkout"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth token from cookie (set by client after login)
  const token = request.cookies.get("instant-need-access-token")?.value;
  const role = request.cookies.get("instant-need-role")?.value;

  const isAuthed = !!token;
  const isAdmin = role === "ADMIN";

  // Admin routes — must be authenticated + admin role
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protected customer routes
  if (AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isAuthed) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Already logged in — don't show auth pages
  if (isAuthed && ["/login", "/register"].includes(pathname)) {
    return NextResponse.redirect(
      new URL(isAdmin ? "/admin" : "/", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
