/**
 * Date formatting utilities
 */

/**
 * Format date to relative time or full date
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format date to full date string
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "2024年2月1日")
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Calculate read time from content
 * @param content - Article content
 * @returns Read time in minutes
 */
export function calculateReadTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length
  return wordCount > 0 ? Math.ceil(wordCount / 200) : 5
}
