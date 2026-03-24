import { createClient } from '@insforge/sdk'
import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'insforge_access_token'
const REFRESH_COOKIE = 'insforge_refresh_token'
const EMAIL_COOKIE = 'insforge_user_email'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function createInsForgeServerClient(accessToken?: string) {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    isServerMode: true,
    edgeFunctionToken: accessToken,
  })
}

export async function setAuthCookies(accessToken: string, refreshToken: string, email?: string) {
  const store = await cookies()
  store.set(ACCESS_COOKIE, accessToken, { ...cookieOptions, maxAge: 60 * 15 })
  store.set(REFRESH_COOKIE, refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })
  if (email) store.set(EMAIL_COOKIE, email, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 })
}

export async function clearAuthCookies() {
  const store = await cookies()
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
}

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value
}

export async function getCurrentUser() {
  const accessToken = await getAccessToken()
  if (!accessToken) return null

  const insforge = createInsForgeServerClient(accessToken)
  const { data, error } = await insforge.auth.getCurrentUser()
  if (error || !data?.user) return null

  return data.user
}
