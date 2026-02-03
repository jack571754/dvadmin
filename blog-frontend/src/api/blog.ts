/**
 * Blog API Service Layer
 * Provides API communication with the backend using Axios
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { Article, Category, Tag, PaginatedResponse } from '@/types/blog';
import { formatDate, calculateReadTime } from '@/utils/date';
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

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
const API_TIMEOUT = 10000;

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

      // Debug: log full response
      console.log('[API] getArticle response status:', response.status);
      console.log('[API] getArticle response data:', response.data);
      console.log('[API] getArticle response.data.data:', response.data?.data);

      // Check response structure
      if (!response.data) {
        throw new Error('API 响应为空');
      }

      // Check if data field exists and is not null
      if (response.data.data === null || response.data.data === undefined) {
        console.error('[API] Article data is null. Full response:', response.data);
        throw new Error('文章不存在或已被删除');
      }

      return transformArticle(response.data.data);
    } catch (error) {
      console.error('[API] getArticle error:', error);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        console.error('[API] Error details:', { status, data });
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
   * Fetch articles by category
   */
  async getArticlesByCategory(categoryId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Article>> {
    try {
      const response = await apiClient.get<BackendResponse<ArticleApiResponse[]>>(`/blog/categories/${categoryId}/articles/`, {
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
        refreshToken: response.data.refresh,
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
}

// Export singleton instance
export const blogApi = new BlogApiService();

// Re-export types for convenience
export type { Article, Category, Tag, PaginatedResponse };
