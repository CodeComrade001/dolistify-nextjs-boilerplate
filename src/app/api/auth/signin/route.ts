"use server";
import { createClient } from "@/app/utils/supabase/db";
import { revalidatePath } from 'next/cache'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userName, password } = await request.json();
    console.log("🚀 ~ POST ~ password:", password)
    console.log("🚀 ~ POST ~ userName:", userName)
    const supabase = await createClient()
    // Step 1: Authenticate the user
    const data = {
      email: userName,
      password: password,
    }
    console.log("🚀 ~ POST ~ data:", data)
    const { error } = await supabase.auth.signInWithPassword(data)
    console.log("🚀 ~ POST ~ error:", error)
    if (error) {
      console.error("Signup error:", error);
      // Redirect back to home on error
      return NextResponse.redirect(new URL('/', request.url), 307);
    }
    revalidatePath('/', 'layout')
    // On success, send user to Dashboard
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.log("🚀 ~ POST ~ error:", error)
     return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

