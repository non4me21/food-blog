import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10 MB limit" }, { status: 413 })
  }

  const rawBuffer = Buffer.from(await file.arrayBuffer())
  const webpBuffer = await sharp(rawBuffer).webp({ quality: 80 }).toBuffer()

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
  const key = `uploads/${Date.now()}-${baseName}.webp`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: key,
    Body: webpBuffer,
    ContentType: "image/webp",
  }))

  const publicUrl = `${process.env.BUCKET_PUBLIC_URL}/${key}`
  return NextResponse.json({ publicUrl })
}
