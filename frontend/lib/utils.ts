export function pluralPrzepis(n: number): string {
  if (n === 1) return "1 przepis"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20))
    return `${n} przepisy`
  return `${n} przepisów`
}

const BLOB_PATHS = [
  // 1 — asymetryczny, szeroki na dole
  "M25,30 C50,5 95,18 135,8 C165,-2 195,25 192,60 C189,90 175,105 185,135 C195,165 170,192 130,192 C95,192 80,175 50,182 C20,189 -5,165 2,130 C8,100 -5,80 5,55 C12,38 18,35 25,30Z",
  // 2 — bardziej okrągły, wklęśnięty z lewej
  "M30,25 C60,0 110,15 150,10 C180,5 200,30 198,65 C196,95 180,110 188,145 C196,175 168,198 128,195 C88,192 70,178 42,185 C14,192 -8,168 3,132 C12,100 0,75 8,50 C14,34 18,28 30,25Z",
  // 3 — bardziej kwadratowy z falami
  "M20,35 C45,8 100,20 145,12 C175,6 198,35 195,72 C192,105 170,115 180,150 C190,178 162,200 122,198 C85,196 65,180 35,186 C8,192 -10,162 5,125 C16,95 5,72 10,48 C14,36 12,38 20,35Z",
  // 4 — wąski na górze, szeroki na dole
  "M40,20 C65,2 105,10 140,5 C170,-2 198,20 196,58 C194,92 172,108 184,142 C196,172 165,200 120,200 C80,200 55,182 28,188 C4,193 -8,168 2,130 C10,98 -2,75 5,50 C10,36 22,28 40,20Z",
  // 5 — falisty, bardziej dramatyczny
  "M28,32 C55,4 108,22 148,8 C172,-2 200,28 196,66 C192,98 168,108 182,138 C196,168 162,198 118,196 C78,194 62,175 32,183 C6,190 -10,162 4,124 C14,92 -4,68 6,44 C12,32 16,36 28,32Z",
]

export function getBlobSvg(index: number): string {
  const path = BLOB_PATHS[index % BLOB_PATHS.length]
  return `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='white' d='${path}'/%3E%3C/svg%3E")`
}
