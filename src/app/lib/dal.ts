import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './auth'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { userInformation } from '../component/backend_component/LoginBackend'
 
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)
 
  if (!session?.userId) {
    redirect('/login')
  }
 
  return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async (userId : number) => {
  const session = await verifySession()
  if (!session) return null
 
  try {
    const data = await userInformation(userId)
 
    const user = data[0]
    console.log("🚀 ~ getUser ~ user:", user)
 
    return user
  } catch (error: unknown) {
    console.log('Failed to fetch user details',  error)
    return null
  }
})
