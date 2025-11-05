import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  // Disable department-based checks; rely on Authorization header in API calls.
  return NextResponse.next();
}

// Paths where middleware should run
export const config = {
  matcher: [
    "/", // Home page
    "/create-meeting/:path*", // Create meeting page and sub-routes
    "/all-actions/:path*", // All actions page and sub-routes
    // Add other protected routes here
  ],
};
