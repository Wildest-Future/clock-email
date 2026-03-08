import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = formData.get("token") as string;

  if (!token || !verifyAdminToken(token).valid) {
    return NextResponse.redirect(`${BASE_URL}/admin`, 303);
  }

  const response = NextResponse.redirect(`${BASE_URL}/admin`, 303);
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: BASE_URL.startsWith("https"),
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
