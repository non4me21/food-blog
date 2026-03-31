import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL ?? "http://backend:8000"

export async function POST(request: NextRequest) {
  const { query } = await request.json()

  if (!query?.trim()) {
    return NextResponse.json({ error: "Zapytanie nie może być puste." }, { status: 400 })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Nie udało się połączyć z serwisem wyszukiwania. Spróbuj ponownie." },
      { status: 500 }
    )
  }
}
