"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { loginAction } from "@/app/admin/actions"

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? ""
  const [error, formAction, isPending] = useActionState(loginAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Hasło
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-900 placeholder-gray-400"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
        style={{ backgroundColor: "#1e6020" }}
      >
        {isPending ? "Logowanie…" : "Zaloguj się"}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span
            className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-white text-xl font-black mb-4"
            style={{ backgroundColor: "#e8531a" }}
          >
            F
          </span>
          <h1 className="text-2xl font-black text-gray-900">Panel admina</h1>
          <p className="text-gray-500 text-sm mt-1">Wpisz hasło, aby kontynuować</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
