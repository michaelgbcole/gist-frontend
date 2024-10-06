import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  console.log(requestUrl)
  const code = requestUrl.searchParams.get('code')
  const isSignUp = requestUrl.searchParams.get('isSignUp') === 'true'
  const role = requestUrl.searchParams.get('role')
  console.log('isSignUp:', isSignUp)
  console.log('requesturl.origin:', requestUrl.origin)

  if (code) {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('callback data', requestUrl.origin, 'isSignup', isSignUp, data)

    if (!error && data?.user) {
      if (isSignUp) {
        // Create user in Prisma database
        try {
          const response = await fetch(`${requestUrl.origin}/api/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata.full_name,
              role: role,
            }),
          })
          
          if (!response.ok) {
            console.error('Failed to create user in database')
          }
        } catch (error) {
          console.error('Error creating user:', error)
        }
      }
    }
  }

  // Redirect to the dashboard after successful login or sign-up
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}