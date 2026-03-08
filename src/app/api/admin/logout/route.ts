import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST() {
  const response = NextResponse.redirect(`${BASE_URL}/`, 303);
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
