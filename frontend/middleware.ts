import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const COOKIE_NAME = "admin_session"
const LOGIN_PATH = "/admin/login"

async function computeSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + ":flavourfind-admin-v1")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === LOGIN_PATH) return NextResponse.next()

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)
  if (!sessionCookie?.value) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const expectedToken = await computeSessionToken(adminPassword)
  if (sessionCookie.value !== expectedToken) {
    const loginUrl = new URL(LOGIN_PATH, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
