export interface G25Entry {
  name: string
  coords: number[]
}

/**
 * Parse a raw G25 text file (CSV-like, one entry per line).
 * Format: GroupName_(n=X),c1,c2,...,c25
 */
export function parseG25(raw: string): G25Entry[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const commaIdx = line.indexOf(',')
      if (commaIdx === -1) return null
      const rawName = line.slice(0, commaIdx)
      // Clean name: remove trailing sample size annotation like _(n=X)
      const name = rawName.replace(/_\(n=\d+\)$/, '').replace(/_/g, ' ').trim()
      const coords = line
        .slice(commaIdx + 1)
        .split(',')
        .map(Number)
      if (coords.length !== 25 || coords.some(isNaN)) return null
      return { name, coords } satisfies G25Entry
    })
    .filter((e): e is G25Entry => e !== null)
}

/**
 * Euclidean distance between two 25-dimensional G25 coordinate vectors.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < 25; i++) {
    const d = a[i] - b[i]
    sum += d * d
  }
  return Math.sqrt(sum)
}

/**
 * Return a random integer in [0, max).
 */
export function randInt(max: number): number {
  return Math.floor(Math.random() * max)
}

/**
 * Pick `count` unique random indices from [0, total).
 */
export function pickUniqueIndices(total: number, count: number): number[] {
  const indices = new Set<number>()
  while (indices.size < count) {
    indices.add(randInt(total))
  }
  return [...indices]
}
