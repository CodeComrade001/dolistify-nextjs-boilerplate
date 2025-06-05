"use server";

import { createClient } from '@/app/utils/supabase/db';
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'



export async function DELETE() {
  console.log("🚀 ~ DELETE ~ DELETE:", DELETE)
  try {
    const supabase = await createClient()
    // Check if a user's logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.auth.signOut()
    }
    revalidatePath('/', 'layout')
    return NextResponse.redirect('/')
  } catch (error: unknown) {
    console.log("Error deleting  session and token", error)
  }
}