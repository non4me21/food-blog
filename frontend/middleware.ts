import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "admin_session"
const LOGIN_PATH = "/slowik/login"

async function computeSessionToken(login: string, password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(login + ":" + password + ":kacperje-admin-v1")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === LOGIN_PATH) return NextResponse.next()

  const adminLogin = process.env.ADMIN_LOGIN
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminLogin || !adminPassword) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)
  if (!sessionCookie?.value) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const expectedToken = await computeSessionToken(adminLogin, adminPassword)
  if (sessionCookie.value !== expectedToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/slowik/:path*"],
}
