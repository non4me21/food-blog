"use client"

import { useState, useRef } from "react"
import Image from "next/image"

type Props = {
  initialUrl?: string | null
}

export default function ImageUpload({ initialUrl }: Props) {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)

    if (file.size > 10 * 1024 * 1024) {
      setError("Zdjęcie nie może przekraczać 10 MB")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })

      if (!res.ok) throw new Error("Upload zdjęcia nie powiódł się")

      const { publicUrl } = await res.json()
      setImageUrl(publicUrl)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd uploadu")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Hidden field submitted with the form */}
      <input type="hidden" name="image_url" value={imageUrl} />

      {/* Preview */}
      {imageUrl && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <Image src={imageUrl} alt="Podgląd zdjęcia" fill className="object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow transition-colors"
            aria-label="Usuń zdjęcie"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Upload button */}
      {!imageUrl && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-green-700 cursor-pointer transition-colors bg-gray-50 hover:bg-green-50"
        >
          {uploading ? (
            <p className="text-sm text-gray-500">Uploadowanie…</p>
          ) : (
            <>
              <UploadIcon />
              <p className="text-sm font-medium text-gray-600 mt-2">Kliknij lub przeciągnij zdjęcie</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP i inne — konwertowane do WebP</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
