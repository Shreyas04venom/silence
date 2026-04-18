export function isDirectVideoUrl(url?: string | null): boolean {
  if (!url) return false
  return /\/api\/generate-video\b/i.test(url) || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)
}
