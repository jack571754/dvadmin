/**
 * Blog API Service Layer
 * Provides API communication with the backend using Axios
 * 
 * 后端接口清单：
 * - GET  /api/blog/categories/        分类列表（公开）
 * - GET  /api/blog/categories/dict/   分类字典（公开）
 * - GET  /api/blog/tags/              标签列表（公开）
 * - GET  /api/blog/tags/dict/         标签字典（公开）
 * - GET  /api/blog/articles/          文章列表（公开，支持搜索/分类筛选）
 * - GET  /api/blog/articles/{id}/     文章详情（公开，自动增加阅读量）
 * - GET  /api/blog/articles/hot/      热门文章（公开，前10篇）
 * - POST /api/blog/articles/{id}/like/ 点赞文章（公开）
 * - GET  /api/blog/comments/          评论列表（公开）
 * - GET  /api/blog/comments/by_article/?article_id={id} 按文章获取评论（公开）
 * - POST /api/blog/comments/          创建评论（需登录）
 * - POST /api/blog/register/          用户注册（公开）
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { Article, Category, Tag, PaginatedResponse } from '@/types/blog';
import { calculateReadTime } from '@/utils/date';
import { handleApiError } from '@/utils/errorHandler';

// API Response Interfaces - Backend format
export interface BackendResponse<T> {
  code: number;
  msg: string;
  data: T;
  page?: number;
  limit?: number;
  total?: number;
  is_next?: boolean;
  is_previous?: boolean;
}

// Article interface from backend API
export interface ArticleApiResponse {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  cover_image?: string | null;
  category?: number | null;
  category_name?: string | null;
  tags_list?: Tag[];
  status: string;
  views_count: number;
  likes_count: number;
  is_top: boolean;
  author_name?: string | null;
  create_datetime: string;
  update_datetime?: string;
}

// Comment interface from backend API
export interface CommentApiResponse {
  id: number;
  article: number;
  article_title?: string;
  content: string;
  user: number;
  user_info?: {
    id: number;
    username: string;
    name: string;
    avatar?: string;
  };
  parent?: number;
  replies_list?: CommentApiResponse[];
  is_active: boolean;
  create_datetime: string;
}

// Dict item interface
export interface DictItem {
  label: string;
  value: number;
}

// Article input interface for create/update
export interface ArticleInput {
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  category?: number | null;
  tags?: number[];
  status?: 'draft' | 'published';
  is_top?: boolean;
}

// Category input interface
export interface CategoryInput {
  name: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Tag input interface
export interface TagInput {
  name: string;
  color?: string;
}

// API Configuration
// Use proxy path '/api' for development, backend will handle the routing
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const API_TIMEOUT = 10000;

// Check if backend is available
export const isBackendAvailable = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Use proxy path /api which will be forwarded to backend
    await fetch(`/api/blog/categories/`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    // Any HTTP response means backend is reachable
    return true;
  } catch {
    return false;
  }
};

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add authentication token if available
    // 后端期望的格式是 "JWT <token>"
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Log error for debugging
    const errorMessage = handleApiError(error);
    console.error('[API Error]', errorMessage);

    // Handle specific status codes
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }

    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * Transform backend article to app article format
 */
function transformArticle(apiArticle: ArticleApiResponse): Article {
  const excerpt = apiArticle.summary || apiArticle.content?.substring(0, 200) || '';
  const content = apiArticle.content || '';
  const categoryName = apiArticle.category_name || '未分类';
  const author = apiArticle.author_name || '作者';
  const tags = apiArticle.tags_list?.map(tag => tag.name) || [];

  return {
    id: String(apiArticle.id),
    title: apiArticle.title,
    excerpt,
    content,
    createdAt: apiArticle.create_datetime,
    readTime: calculateReadTime(content),
    category: categoryName,
    categoryId: apiArticle.category || null,  // 保留原始分类ID
    author,
    slug: apiArticle.title.toLowerCase().replace(/\s+/g, '-'),
    tags,
    viewsCount: apiArticle.views_count || 0,
    likesCount: apiArticle.likes_count || 0,
    isTop: apiArticle.is_top || false,
  };
}

/**
 * Blog API Service Class
 */
class BlogApiService {
  /**
   * Fetch all articles with optional pagination
   */
  async getArticles(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> {
    try {
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>('/blog/articles/', {
        params: { page, page_size: pageSize, status: 'published' },
      });

      const backendData = response.data;
      const transformedResults = (backendData.data || []).map(transformArticle);

      return {
        count: backendData.total || 0,
        next: backendData.is_next ? String(page + 1) : null,
        previous: backendData.is_previous ? String(page - 1) : null,
        results: transformedResults,
        page: backendData.page,
        pageSize: backendData.limit,
      };
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch a single article by ID
   */
async getArticle(id: string): Promise<Article> {
    try {
      const response = await apiClient.get<any>(`/blog/articles/${id}/`);

      // Check response structure
      if (!response.data) {
        throw new Error('API 响应为空');
      }

      // Check if data field exists and is not null
      if (response.data.data === null || response.data.data === undefined) {
        throw new Error('文章不存在或已被删除');
      }

      return transformArticle(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        throw new Error(data?.msg || data?.message || `请求失败 (${status})`);
      }
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<BackendResponse<Category[]>>('/blog/categories/');
      return response.data.data || [];
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch all tags
   */
  async getTags(): Promise<Tag[]> {
    try {
      const response = await apiClient.get<BackendResponse<Tag[]>>('/blog/tags/');
      return response.data.data || [];
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch category dictionary (for dropdowns)
   */
  async getCategoryDict(): Promise<DictItem[]> {
    try {
      const response = await apiClient.get<BackendResponse<DictItem[]>>('/blog/categories/dict/');
      return response.data.data || [];
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch tag dictionary (for dropdowns)
   */
  async getTagDict(): Promise<DictItem[]> {
    try {
      const response = await apiClient.get<BackendResponse<DictItem[]>>('/blog/tags/dict/');
      return response.data.data || [];
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch hot articles (top 10 by views and likes)
   */
  async getHotArticles(): Promise<Article[]> {
    try {
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>('/blog/articles/hot/');
      return (response.data.data || []).map(transformArticle);
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Like an article
   */
  async likeArticle(id: string): Promise<{ likes_count: number }> {
    try {
      const response = await apiClient.post<BackendResponse<{ likes_count: number }>>(`/blog/articles/${id}/like/`);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch comments by article ID
   */
  async getCommentsByArticle(articleId: string): Promise<CommentApiResponse[]> {
    try {
      const response = await apiClient.get<BackendResponse<CommentApiResponse[]>>('/blog/comments/by_article/', {
        params: { article_id: articleId }
      });
      return response.data.data || [];
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Create a comment
   */
  async createComment(data: { article: number; content: string; parent?: number }): Promise<CommentApiResponse> {
    try {
      const response = await apiClient.post<BackendResponse<CommentApiResponse>>('/blog/comments/', data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch articles by category
   */
  async getArticlesByCategory(categoryId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> {
    try {
      // 使用文章列表接口 + category 参数筛选，而不是分类子资源接口
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>('/blog/articles/', {
        params: { page, page_size: pageSize, category: categoryId, status: 'published' },
      });

      const backendData = response.data;
      const transformedResults = (backendData.data || []).map(transformArticle);

      return {
        count: backendData.total || 0,
        next: backendData.is_next ? String(page + 1) : null,
        previous: backendData.is_previous ? String(page - 1) : null,
        results: transformedResults,
      };
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Fetch articles by tag
   */
  async getArticlesByTag(tagId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> {
    try {
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>(`/blog/tags/${tagId}/articles/`, {
        params: { page, page_size: pageSize },
      });

      const backendData = response.data;
      const transformedResults = (backendData.data || []).map(transformArticle);

      return {
        count: backendData.total || 0,
        next: backendData.is_next ? String(page + 1) : null,
        previous: backendData.is_previous ? String(page - 1) : null,
        results: transformedResults,
      };
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Search articles
   */
  async searchArticles(query: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> {
    try {
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>('/blog/articles/', {
        params: { search: query, page, page_size: pageSize },
      });

      const backendData = response.data;
      const transformedResults = (backendData.data || []).map(transformArticle);

      return {
        count: backendData.total || 0,
        next: backendData.is_next ? String(page + 1) : null,
        previous: backendData.is_previous ? String(page - 1) : null,
        results: transformedResults,
      };
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Login with username and password
   * Uses DVAdmin /api/login/ endpoint
   * Returns JWT access token
   */
  async login(username: string, password: string): Promise<{ token: string; user?: any }> {
    try {
      const response = await apiClient.post<{ access: string; refresh: string }>('/login/', {
        username,
        password,
      });
      // Transform JWT response to expected format
      return {
        token: response.data.access,
        user: undefined, // TODO: 获取用户信息
      };
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Register new user
   * Uses blog /api/blog/register/ endpoint
   */
  async register(data: { username: string; email: string; password: string }): Promise<any> {
    try {
      const response = await apiClient.post('/blog/register/', data);
      return response.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  /**
   * Get current user info
   * Uses DVAdmin /api/system/user/getUserInfo/ endpoint
   */
async getUserInfo(): Promise<any> {
    try {
      const response = await apiClient.get('/system/user/getUserInfo/');
      return response.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  // ==================== Admin APIs ====================

  async createArticle(data: ArticleInput): Promise<ArticleApiResponse> {
    try {
      const response = await apiClient.post<BackendResponse<ArticleApiResponse>>('/blog/articles/', data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async updateArticle(id: string | number, data: Partial<ArticleInput>): Promise<ArticleApiResponse> {
    try {
      const response = await apiClient.put<BackendResponse<ArticleApiResponse>>(`/blog/articles/${id}/`, data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async deleteArticle(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/blog/articles/${id}/`);
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async createCategory(data: CategoryInput): Promise<Category> {
    try {
      const response = await apiClient.post<BackendResponse<Category>>('/blog/categories/', data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async updateCategory(id: number, data: Partial<CategoryInput>): Promise<Category> {
    try {
      const response = await apiClient.put<BackendResponse<Category>>(`/blog/categories/${id}/`, data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      await apiClient.delete(`/blog/categories/${id}/`);
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async createTag(data: TagInput): Promise<Tag> {
    try {
      const response = await apiClient.post<BackendResponse<Tag>>('/blog/tags/', data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async updateTag(id: number, data: Partial<TagInput>): Promise<Tag> {
    try {
      const response = await apiClient.put<BackendResponse<Tag>>(`/blog/tags/${id}/`, data);
      return response.data.data;
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }

  async deleteTag(id: number): Promise<void> {
    try {
      await apiClient.delete(`/blog/tags/${id}/`);
    } catch (error) {
      const message = handleApiError(error);
      throw new Error(message);
    }
  }
}

// Export singleton instance
export const blogApi = new BlogApiService();

// Re-export types for convenience
export type { Article, Category, Tag, PaginatedResponse };
