"use server";
import { createClient } from "@/app/utils/supabase/db";
import { revalidatePath } from 'next/cache'
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userName, email, password } = await request.json();

    const supabase = await createClient()
    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
      email: email as string,
      password: password as string,
    }
    const { error } = await supabase.auth.signUp(data)
    if (error) {
      // Redirect back to home on error
      return NextResponse.redirect(new URL('/', request.url), 307);
    }
    revalidatePath('/', 'layout')
    // On success, send user to Dashboard
     return NextResponse.json({ success: true });
  } catch (error: unknown) {
     return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
