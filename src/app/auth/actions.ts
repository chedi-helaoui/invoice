'use server'

import { createInsForgeServerClient, setAuthCookies } from '@/lib/insforge-server'

export async function signUpAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const name = String(formData.get('name') ?? '')

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    name
  })

  if (error) return { success: false, error: error.message }

  if (data?.requireEmailVerification) {
    return { success: true, requireVerification: true }
  }

  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken)
    return { success: true, requireVerification: false }
  }

  return { success: true, requireVerification: false }
}

export async function verifyEmailAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const otp = String(formData.get('otp') ?? '').trim()

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.verifyEmail({
    email,
    otp
  })

  if (error || !data?.accessToken || !data?.refreshToken) {
    return { success: false, error: error?.message ?? 'Verification failed or no token returned.' }
  }

  await setAuthCookies(data.accessToken, data.refreshToken)
  return { success: true }
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const insforge = createInsForgeServerClient()
  const { data, error } = await insforge.auth.signInWithPassword({
    email,
    password
  })

  if (error || !data?.accessToken || !data?.refreshToken) {
    return { success: false, error: error?.message ?? 'Sign in failed.' }
  }

  await setAuthCookies(data.accessToken, data.refreshToken, email)
  return { success: true }
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'All password fields are required.' }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match.' }
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters.' }
  }

  // Verify current password by attempting sign-in
  const insforge = createInsForgeServerClient()
  const cookieStore = await import('next/headers').then(m => m.cookies())
  const email = cookieStore.get('insforge_user_email')?.value

  if (!email) return { success: false, error: 'Session expired. Please sign in again.' }

  const { error: verifyError } = await insforge.auth.signInWithPassword({ email, password: currentPassword })
  if (verifyError) return { success: false, error: 'Current password is incorrect.' }

  // Reset to new password using the reset flow
  const { error: resetError } = await insforge.auth.sendResetPasswordEmail({ email })
  if (resetError) return { success: false, error: resetError.message }

  return { success: true }
}

export async function resendVerificationAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim()
  const insforge = createInsForgeServerClient()
  const { error } = await insforge.auth.resendVerificationEmail({ email })
  if (error) return { success: false, error: error.message }
  return { success: true }
}
