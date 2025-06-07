"use server";
import { createClient } from "@/app/utils/supabase/db";
import { revalidatePath } from 'next/cache'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userName, password } = await request.json();
    const supabase = await createClient()
    // Step 1: Authenticate the user
    const data = {
      email: userName,
      password: password,
    }
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) {
      console.error("Signup error:", error);
      // Redirect back to home on error
      return NextResponse.redirect(new URL('/', request.url), 307);
    }
    revalidatePath('/', 'layout')
    // On success, send user to Dashboard
    return NextResponse.json({ success: true });
  } catch  {
     return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

