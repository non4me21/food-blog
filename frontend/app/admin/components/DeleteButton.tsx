"use client"

import { useTransition } from "react"

type Props = {
  action: () => Promise<void>
  label?: string
  confirmMessage?: string
}

export default function DeleteButton({
  action,
  label = "Usuń",
  confirmMessage = "Na pewno chcesz usunąć?",
}: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmMessage)) return
    startTransition(() => action())
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Usuwanie…" : label}
    </button>
  )
}
