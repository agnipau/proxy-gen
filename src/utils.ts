export function delay(ms: number = 3000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function emptyTextToNull(str: string): string | null {
  return str === '' ? null : str.trim() === '' ? null : str
}

export function hardTrim(str: string) {
  return str.trim().replace(/\s+/g, ' ')
}
