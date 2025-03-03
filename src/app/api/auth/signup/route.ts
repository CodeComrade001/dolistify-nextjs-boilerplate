import CreateNewUserAccount from "@/app/component/backend_component/LoginBackend";
import { encrypt, storeSession } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies()
  
  
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

  return NextResponse.json({ success: true, user, sessionToken });
}
