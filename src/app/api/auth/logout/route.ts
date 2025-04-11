"use server";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";



export async function DELETE() {
  console.log("🚀 ~ DELETE ~ DELETE:", DELETE)
  try {
    const cookieStore = await cookies()
    console.log("🚀 ~ DELETE ~ cookieStore:", cookieStore)
    const deleteCookie = cookieStore.delete("session_token")
    console.log("🚀 ~ DELETE ~ deleteCookie:", deleteCookie)
    const deleteSession = cookieStore.delete("userId")
    console.log("🚀 ~ DELETE ~ deleteSession:", deleteSession)

    if (deleteCookie && deleteSession) {
      const response = NextResponse.json({ success: true });
      return response
    }

  } catch (error: unknown) {
    console.log("Error deleting  session and token", error)
  }
}