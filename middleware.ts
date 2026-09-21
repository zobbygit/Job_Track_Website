import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/auth/auth";

export const config = {
  // ✅ Only run on these routes — not on images, CSS, API, etc.
  matcher: ["/sign-in", "/sign-up", "/dashboard/:path*"],
  // ✅ Mongoose requires Node runtime — Edge will throw
  runtime: "nodejs",
};

export default async function middleware(request: NextRequest) {
  const session = await getSession();

  const { pathname } = request.nextUrl;
  const isSignInPage = pathname.startsWith("/sign-in");
  const isSignUpPage = pathname.startsWith("/sign-up");
  const isDashboard = pathname.startsWith("/dashboard");

  // Logged-in users should not see auth pages
  if ((isSignInPage || isSignUpPage) && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users should not see the dashboard
  if (isDashboard && !session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}