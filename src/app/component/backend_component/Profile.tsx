// src/app/Dashboard/backend.ts
'use server';

import { createClient } from "@/app/utils/supabase/db";

export default async function GetUserDetails() {
  try {
    // Initialize Supabase client per-call (server component / action)
    const supabase = await createClient();

    // Fetch exactly one user by ID
    const { data, error } = await supabase
      .from("profiles")
      .select("username,user_email, avatar_url")
      .single();

    if (error) {
      console.error("GetUserDetails supabase error:", error);
      return false;
    }
    console.log("🚀 ~ GetUserDetails ~ data:", data)


    // Map to your original property names
    return data;
  } catch (err) {
    console.error("GetUserDetails caught error:", err);
    return false;
  }
}
