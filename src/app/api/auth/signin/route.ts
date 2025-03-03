import { NextResponse } from "next/server";
import { LoginExistingAccount } from "@/app/component/backend_component/LoginBackend";
import { encrypt, manageSession, storeSession } from "@/app/lib/auth";

export async function POST(request: Request) {
  const { userName, password } = await request.json();

  // Step 1: Authenticate the user
  const isAuthenticated = await LoginExistingAccount(userName, password);
  console.log("🚀 ~ POST ~ isAuthenticated:", isAuthenticated)

  if (!isAuthenticated || "error" in isAuthenticated) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 400 });
  }

  const user = isAuthenticated.user;

  // Step 2: Check and manage the session (delete if expired, or reuse)
  const existingSession = await manageSession(user.id );
  console.log("🚀 ~ POST ~ existingSession:", existingSession)

  if (!existingSession) {
    // Session expired or does not exist, create a new one
    const sessionToken = await encrypt({ userId: user.id });

    // Store the new session in the database
    const isSessionStored = await storeSession(user.id, sessionToken);
    if (!isSessionStored) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }

    // Set session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  }

  return NextResponse.json({ success: true });
}

