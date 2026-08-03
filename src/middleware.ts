import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const KYC_COOKIE = "pr_kyc";
const SUBMIT_PATHS = ["/app/submit"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (SUBMIT_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const kycStatus = request.cookies.get(KYC_COOKIE)?.value;

    if (kycStatus && kycStatus !== "approved") {
      const url = request.nextUrl.clone();
      url.pathname = "/app/kyc";
      url.searchParams.set("reason", "submit-required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/submit", "/app/submit/:path*"],
};
