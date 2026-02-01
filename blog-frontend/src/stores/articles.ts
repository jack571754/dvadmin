/**
 * Articles Store - Pinia State Management
 * Manages article, category, and tag state for the blog application
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Article } from '@/types/blog';
import { blogApi, type Category, type Tag, type PaginatedResponse } from '@/api/blog';

export const useArticlesStore = defineStore('articles', () => {
  // State
  const articles = ref<Article[]>([]);
  const currentArticle = ref<Article | null>(null);
  const categories = ref<Category[]>([]);
  const tags = ref<Tag[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Pagination state
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);
  const hasNext = ref(false);
  const hasPrevious = ref(false);

  // Computed properties
  const hasArticles = computed(() => articles.value.length > 0);
  const hasCategories = computed(() => categories.value.length > 0);
  const hasTags = computed(() => tags.value.length > 0);
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  /**
   * Fetch all articles with pagination
   */
  async function fetchArticles(page: number = 1, reset: boolean = false): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: PaginatedResponse<Article> = await blogApi.getArticles(page, pageSize.value);

      if (reset || page === 1) {
        articles.value = response.results;
      } else {
        articles.value = [...articles.value, ...response.results];
      }

      currentPage.value = page;
      totalCount.value = response.count;
      hasNext.value = response.next !== null;
      hasPrevious.value = response.previous !== null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch articles';
      console.error('Store error fetching articles:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch a single article by ID
   */
  async function fetchArticle(id: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      currentArticle.value = await blogApi.getArticle(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch article';
      console.error(`Store error fetching article ${id}:`, err);
      throw err; // Re-throw to allow component handling
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch all categories
   */
  async function fetchCategories(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      categories.value = await blogApi.getCategories();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      console.error('Store error fetching categories:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch all tags
   */
  async function fetchTags(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      tags.value = await blogApi.getTags();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tags';
      console.error('Store error fetching tags:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch articles by category
   */
  async function fetchArticlesByCategory(categoryId: string, page: number = 1): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: PaginatedResponse<Article> = await blogApi.getArticlesByCategory(categoryId, page, pageSize.value);

      articles.value = response.results;
      currentPage.value = page;
      totalCount.value = response.count;
      hasNext.value = response.next !== null;
      hasPrevious.value = response.previous !== null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch articles by category';
      console.error(`Store error fetching articles for category ${categoryId}:`, err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Fetch articles by tag
   */
  async function fetchArticlesByTag(tagId: string, page: number = 1): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: PaginatedResponse<Article> = await blogApi.getArticlesByTag(tagId, page, pageSize.value);

      articles.value = response.results;
      currentPage.value = page;
      totalCount.value = response.count;
      hasNext.value = response.next !== null;
      hasPrevious.value = response.previous !== null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch articles by tag';
      console.error(`Store error fetching articles for tag ${tagId}:`, err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Search articles
   */
  async function searchArticles(query: string, page: number = 1): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response: PaginatedResponse<Article> = await blogApi.searchArticles(query, page, pageSize.value);

      articles.value = response.results;
      currentPage.value = page;
      totalCount.value = response.count;
      hasNext.value = response.next !== null;
      hasPrevious.value = response.previous !== null;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search articles';
      console.error(`Store error searching articles with query "${query}":`, err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Load more articles (infinite scroll)
   */
  async function loadMore(): Promise<void> {
    if (!loading.value && hasNext.value) {
      await fetchArticles(currentPage.value + 1, false);
    }
  }

  /**
   * Reset article state
   */
  function resetArticles(): void {
    articles.value = [];
    currentArticle.value = null;
    currentPage.value = 1;
    totalCount.value = 0;
    hasNext.value = false;
    hasPrevious.value = false;
    error.value = null;
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    // State
    articles,
    currentArticle,
    categories,
    tags,
    loading,
    error,
    currentPage,
    pageSize,
    totalCount,
    hasNext,
    hasPrevious,

    // Computed
    hasArticles,
    hasCategories,
    hasTags,
    totalPages,

    // Actions
    fetchArticles,
    fetchArticle,
    fetchCategories,
    fetchTags,
    fetchArticlesByCategory,
    fetchArticlesByTag,
    searchArticles,
    loadMore,
    resetArticles,
    clearError,
  };
});
