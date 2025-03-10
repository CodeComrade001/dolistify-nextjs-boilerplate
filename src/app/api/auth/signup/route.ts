import CreateNewUserAccount from "@/app/component/backend_component/LoginBackend";
import { encrypt, storeSession } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  
  const { userName, email, password } = await request.json();
  console.log("🚀 ~ POST ~ password:", password)
  console.log("🚀 ~ POST ~ email:", email)
  console.log("🚀 ~ POST ~ userName:", userName)
  const result = await CreateNewUserAccount(userName, email, password);

  if (!result || "error" in result) {
    return NextResponse.json({ error: result?.error || "Unexpected error" }, { status: 400 });
  }

  const user = result.user;
  const sessionToken = await encrypt({ userId: Number(user.id) });
  console.log("🚀 ~ POST ~ sessionToken:", sessionToken)

  // Store session in PostgreSQL
  const sessionStored = await storeSession(user.id, sessionToken);
  if (!sessionStored) {
    return NextResponse.json({ error: "Failed to store session" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "session_token",
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  console.log("🚀 ~ POST ~ response.cookies.set:", response.cookies)
  return response;
}
