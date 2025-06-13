"use server";

import { createClient } from '@/app/utils/supabase/db';
import { NextResponse } from 'next/server'



export async function DELETE() {
  try {
    const supabase = await createClient()
    // Check if a user's logged in
    const { data: { user }, } = await supabase.auth.getUser()
    if (user) {
      // Sign out the user
      const { error } = await supabase.auth.signOut();
      if (error) {
        return NextResponse.json({success: false, error: "error logging out" });
      }

      return NextResponse.json({ success: true, message: 'Signed out successfully' });
    } else {
      return NextResponse.json({success: false, message: 'User not logged in' });
    }
  } catch {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}