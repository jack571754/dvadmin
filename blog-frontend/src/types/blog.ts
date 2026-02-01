/**
 * Blog data type definitions
 */

/**
 * Article interface used in the app
 */
export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  createdAt: string
  readTime: number
  category: string
  categoryId: number | null  // 分类ID，用于筛选
  author: string
  slug: string
  tags?: string[]  // 标签列表
}

/**
 * Blog configuration
 */
export interface BlogConfig {
  title: string
  description: string
  logo: string
}

/**
 * Navigation item
 */
export interface NavigationItem {
  label: string
  path: string
  active: boolean
}

/**
 * Article card component props
 */
export interface ArticleCardProps {
  article: Article
  loading?: boolean
}

/**
 * Category interface
 */
export interface Category {
  id: number | string
  name: string
  description?: string
  article_count?: number
}

/**
 * Tag interface
 */
export interface Tag {
  id: number | string
  name: string
  article_count?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
  page?: number
  pageSize?: number
}
