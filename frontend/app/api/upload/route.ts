import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
  },
})

const MAX_SIZE_BYTES = 15 * 1024 * 1024 // 15 MB

function resolveContentType(file: File): string {
  // "image/jpg" is not a valid MIME type — normalize to "image/jpeg"
  if (!file.type || file.type === "image/jpg") return "image/jpeg"
  return file.type
}

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Nie udało się odczytać pliku" }, { status: 400 })
  }

  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Zdjęcie jest za duże (max 15 MB)" }, { status: 413 })
  }

  const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    await s3.send(new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: resolveContentType(file),
    }))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `Błąd uploadu do S3: ${msg}` }, { status: 500 })
  }

  const publicUrl = `${process.env.BUCKET_PUBLIC_URL}/${key}`
  return NextResponse.json({ publicUrl })
}
