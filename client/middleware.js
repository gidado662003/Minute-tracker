import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req) {
  // Get token from cookies (you could also get it from headers)
  const token = req.cookies.get("department")?.value;

  // If no token, allow access (user will see department selection)
  if (!token) {
    return NextResponse.next();
  }

  try {
    const decoded = jwt.verify(token, "test"); // Replace "test" with your secret

    console.log("Department", decoded.department);
    // Token valid, continue with department header
    const response = NextResponse.next();
    response.headers.set("x-department", decoded.department || "");
    return response;
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Token expired");
    } else {
      console.log("Invalid token");
    }

    // Clear invalid token and allow access to department selection
    const response = NextResponse.next();
    response.cookies.delete("department");
    return response;
  }
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
