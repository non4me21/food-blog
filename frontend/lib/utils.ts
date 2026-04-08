export function pluralPrzepis(n: number): string {
  if (n === 1) return "1 przepis"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return `${n} przepisy`
  return `${n} przepisów`
}

export function pluralPrzepisLabel(n: number): string {
  if (n === 1) return "przepis"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "przepisy"
  return "przepisów"
}

export function pluralKategoriaLabel(n: number): string {
  if (n === 1) return "kategoria"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return "kategorie"
  return "kategorii"
}

const BLOB_PATHS = [
  // 1 — klasyczny asymetryczny blob (baseline)
  "M25,30 C50,5 95,18 135,8 C165,-2 195,25 192,60 C189,90 175,105 185,135 C195,165 170,192 130,192 C95,192 80,175 50,182 C20,189 -5,165 2,130 C8,100 -5,80 5,55 C12,38 18,35 25,30Z",
  // 2 — jajowaty, 6 punktów, wyraźna asymetria lewo-prawo
  "M38,15 C88,-2 155,8 186,50 C202,82 196,125 175,158 C155,185 115,198 72,192 C30,186 2,158 5,105 C8,60 5,28 38,15Z",
  // 3 — organiczny, wiele wypukłości, lewa strona trzyma się w granicach
  "M35,25 C58,0 125,15 165,10 C190,5 198,45 192,85 C188,112 160,98 175,142 C188,180 155,200 105,195 C58,190 28,178 12,148 C2,120 8,88 8,62 C10,45 20,38 35,25Z",
  // 4 — lewostronna przewaga (masa po lewej stronie)
  "M8,50 C4,12 58,0 112,14 C158,25 194,58 192,102 C190,146 164,186 110,193 C56,200 6,172 2,128 C-4,86 -2,52 8,50Z",
  // 5 — ciężki dół, wąska góra
  "M65,15 C95,2 148,8 180,48 C198,76 196,122 180,158 C164,188 128,202 85,196 C42,190 5,165 5,118 C5,75 38,26 65,15Z",
]

export function getBlobSvg(index: number): string {
  const path = BLOB_PATHS[index % BLOB_PATHS.length]
  return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23ffffff' fill-opacity='0.70' stroke='%23ffffff' stroke-opacity='0.6' stroke-width='4' d='${path}'/%3E%3C/svg%3E")`
}
