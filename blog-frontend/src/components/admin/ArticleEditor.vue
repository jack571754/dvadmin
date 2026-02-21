<template>
  <Teleport to="body">
    <!-- Overlay -->
    <transition name="overlay">
      <div v-if="visible" class="editor-overlay" @click.self="handleClose"></div>
    </transition>

    <!-- Sidebar Editor -->
    <transition name="sidebar">
      <div v-if="visible" class="editor-sidebar">
        <div class="sidebar-main">
          <!-- Left: Editor Panel -->
          <div class="editor-panel">
            <!-- Header -->
            <header class="panel-header">
              <h2 class="panel-title">{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
              <button class="close-btn" @click="handleClose" aria-label="关闭">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4L12 12M12 4L4 12" stroke-linecap="round"/>
                </svg>
              </button>
            </header>

            <!-- Form -->
            <div class="panel-body">
              <!-- Title -->
              <div class="form-group">
                <label class="form-label">标题 <span class="required">*</span></label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-input"
                  :class="{ 'form-input--error': errors.title }"
                  placeholder="请输入文章标题"
                  maxlength="200"
                  @input="errors.title = ''"
                />
                <span v-if="errors.title" class="form-error">{{ errors.title }}</span>
              </div>

              <!-- Category & Status Row -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">分类</label>
                  <select v-model="form.category" class="form-select">
                    <option :value="null">无分类</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">状态</label>
                  <select v-model="form.status" class="form-select">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
              </div>

              <!-- Tags -->
              <div class="form-group">
                <label class="form-label">标签</label>
                <div class="tags-input" :class="{ 'tags-input--focused': tagsFocused }">
                  <div class="selected-tags">
                    <span v-for="tagId in form.tags" :key="tagId" class="tag-item">
                      {{ getTagName(tagId) }}
                      <button class="tag-remove" @click="removeTag(tagId)" type="button">×</button>
                    </span>
                  </div>
                  <select
                    class="tag-select"
                    @change="addTag($event)"
                    @focus="tagsFocused = true"
                    @blur="tagsFocused = false"
                  >
                    <option value="">添加标签...</option>
                    <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
                      {{ tag.name }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Summary -->
              <div class="form-group">
                <label class="form-label">摘要</label>
                <textarea
                  v-model="form.summary"
                  class="form-textarea"
                  placeholder="请输入文章摘要（可选，留空将自动截取内容前200字）"
                  rows="2"
                  maxlength="500"
                ></textarea>
                <span class="form-hint">{{ (form.summary || '').length }}/500</span>
              </div>

              <!-- Markdown Editor -->
              <div class="form-group form-group--flex">
                <label class="form-label">内容 <span class="required">*</span></label>
                <div ref="editorRef" class="vditor-container"></div>
                <span v-if="errors.content" class="form-error">{{ errors.content }}</span>
              </div>

              <!-- Options -->
              <div class="form-options">
                <label class="checkbox-label">
                  <input v-model="form.is_top" type="checkbox" />
                  <span class="checkbox-custom"></span>
                  <span class="checkbox-text">置顶文章</span>
                </label>
              </div>
            </div>

            <!-- Footer -->
            <footer class="panel-footer">
              <div class="footer-left">
                <span class="char-count">{{ charCount }} 字</span>
              </div>
              <div class="footer-right">
                <button class="btn btn-secondary" @click="handleClose" type="button">取消</button>
                <button class="btn btn-primary" :disabled="saving" @click="handleSave" type="button">
                  <svg v-if="saving" class="btn-spinner" width="16" height="16" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="30 10"/>
                  </svg>
                  {{ saving ? '保存中...' : '保存' }}
                </button>
              </div>
            </footer>
          </div>

          <!-- Right: Preview Panel -->
          <div class="preview-panel">
            <!-- Preview Header -->
            <header class="preview-header">
              <span class="preview-title">预览</span>
              <div class="preview-actions">
                <button class="preview-action" @click="scrollPreviewToTop" title="回到顶部">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M8 12V4M4 8l4-4 4 4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </header>

            <!-- Preview Content -->
            <div ref="previewRef" class="preview-content">
              <div v-if="!previewContent" class="preview-placeholder">
                <svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1">
                  <rect x="2" y="2" width="12" height="12" rx="2"/>
                  <path d="M5 5h6M5 8h4M5 11h6"/>
                </svg>
                <p>在左侧输入内容后<br/>这里将显示预览效果</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification" :class="`toast--${toastType}`">
        <span class="toast-icon">{{ toastType === 'error' ? '!' : '✓' }}</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { blogApi, type ArticleInput, type Category, type Tag } from '@/api/blog'
import type { Article } from '@/types/blog'

interface Props {
  visible: boolean
  article?: Article | null
  categories: Category[]
  tags: Tag[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'saved', article: Article): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  article: null,
  categories: () => [],
  tags: () => [],
})

const emit = defineEmits<Emits>()

// Refs
const editorRef = ref<HTMLElement | null>(null)
const previewRef = ref<HTMLDivElement | null>(null)
const vditor = ref<Vditor | null>(null)

// State
const saving = ref(false)
const tagsFocused = ref(false)
const previewContent = ref('')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Form state
const form = ref<ArticleInput>({
  title: '',
  content: '',
  summary: '',
  category: null,
  tags: [],
  status: 'draft',
  is_top: false,
})

// Form errors
const errors = ref<{
  title?: string
  content?: string
}>({})

// Computed
const isEdit = computed(() => !!props.article?.id)

const availableTags = computed(() => {
  return props.tags.filter(tag => !form.value.tags?.includes(tag.id as number))
})

const charCount = computed(() => {
  return (form.value.content || '').length
})

// Methods
const getTagName = (tagId: number): string => {
  const tag = props.tags.find(t => t.id === tagId)
  return tag?.name || ''
}

const addTag = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const tagId = Number(select.value)
  if (tagId && !form.value.tags?.includes(tagId)) {
    form.value.tags = [...(form.value.tags || []), tagId]
  }
  select.value = ''
}

const removeTag = (tagId: number) => {
  form.value.tags = form.value.tags?.filter(id => id !== tagId) || []
}

const showToastNotification = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!form.value.title.trim()) {
    errors.value.title = '请输入文章标题'
    return false
  }
  
  const content = vditor.value?.getValue() || ''
  if (!content.trim()) {
    errors.value.content = '请输入文章内容'
    return false
  }
  
  return true
}

// Debounce helper
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// Update preview with debouncing
const updatePreview = debounce((value: string) => {
  if (!previewRef.value) return
  
  previewContent.value = value
  
  if (value.trim()) {
    // Clear placeholder and render preview
    previewRef.value.innerHTML = ''
    Vditor.preview(previewRef.value, value, {
      cdn: 'https://unpkg.com/vditor@3.10.4',
      mode: 'light',
      markdown: {
        toc: true,
        mark: true,
        paragraphBeginningSpace: false,
      },
      hljs: {
        enable: true,
        lineNumber: true,
        style: 'github',
      },
      anchor: 1,
      lazyLoadImage: 'https://unpkg.com/vditor@3.10.4/dist/images/img-loading.svg',
    })
  } else {
    // Show placeholder
    previewRef.value.innerHTML = `
      <div class="preview-placeholder">
        <svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="2" y="2" width="12" height="12" rx="2"/>
          <path d="M5 5h6M5 8h4M5 11h6"/>
        </svg>
        <p>在左侧输入内容后<br/>这里将显示预览效果</p>
      </div>
    `
  }
}, 300)

const scrollPreviewToTop = () => {
  if (previewRef.value) {
    previewRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Initialize Vditor
const initVditor = () => {
  if (!editorRef.value) return

  vditor.value = new Vditor(editorRef.value, {
    height: '100%',
    placeholder: '请输入文章内容，支持 Markdown 语法...',
    theme: 'classic',
    icon: 'material',
    counter: {
      enable: true,
      type: 'markdown',
    },
    cache: {
      enable: false,
    },
    mode: 'wysiwyg',
    preview: {
      markdown: {
        toc: true,
        mark: true,
      },
    },
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'line',
      'quote',
      '|',
      'list',
      'ordered-list',
      'check',
      '|',
      'code',
      'inline-code',
      '|',
      'link',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help',
        ],
      },
    ],
    input: (value) => {
      form.value.content = value
      updatePreview(value)
    },
    after: () => {
      if (props.article?.content) {
        vditor.value?.setValue(props.article.content)
        updatePreview(props.article.content)
      }
    },
  })
}

const destroyVditor = () => {
  if (vditor.value) {
    vditor.value.destroy()
    vditor.value = null
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    summary: '',
    category: null,
    tags: [],
    status: 'draft',
    is_top: false,
  }
  errors.value = {}
  vditor.value?.setValue('')
  previewContent.value = ''
  if (previewRef.value) {
    previewRef.value.innerHTML = `
      <div class="preview-placeholder">
        <svg width="48" height="48" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1">
          <rect x="2" y="2" width="12" height="12" rx="2"/>
          <path d="M5 5h6M5 8h4M5 11h6"/>
        </svg>
        <p>在左侧输入内容后<br/>这里将显示预览效果</p>
      </div>
    `
  }
}

const populateForm = (article: Article) => {
  form.value = {
    title: article.title,
    content: article.content || '',
    summary: article.excerpt || '',
    category: article.categoryId,
    tags: [], // Will be populated separately if we have tag IDs
    status: 'published',
    is_top: false,
  }
  errors.value = {}
  vditor.value?.setValue(article.content || '')
  updatePreview(article.content || '')
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSave = async () => {
  if (!validateForm()) {
    showToastNotification(errors.value.title || errors.value.content || '请填写必填项', 'error')
    return
  }

  const content = vditor.value?.getValue() || ''
  
  saving.value = true
  try {
    const data: ArticleInput = {
      ...form.value,
      content,
      summary: form.value.summary || content.substring(0, 200),
    }

    let result
    if (isEdit.value && props.article?.id) {
      result = await blogApi.updateArticle(props.article.id, data)
    } else {
      result = await blogApi.createArticle(data)
    }

    emit('saved', {
      id: String(result.id),
      title: result.title,
      content: result.content,
      excerpt: result.summary || '',
      createdAt: result.create_datetime,
      readTime: 0,
      category: '',
      categoryId: result.category,
      author: result.author_name || '',
      slug: result.title.toLowerCase().replace(/\s+/g, '-'),
      viewsCount: result.views_count || 0,
      likesCount: result.likes_count || 0,
    } as Article)

    showToastNotification(isEdit.value ? '文章更新成功' : '文章创建成功')
    handleClose()
  } catch (error) {
    console.error('Failed to save article:', error)
    showToastNotification(error instanceof Error ? error.message : '保存失败，请重试', 'error')
  } finally {
    saving.value = false
  }
}

// Watch visibility
watch(() => props.visible, async (newVal) => {
  if (newVal) {
    await nextTick()
    setTimeout(() => {
      if (!vditor.value) {
        initVditor()
      }
      if (props.article) {
        populateForm(props.article)
      } else {
        resetForm()
      }
    }, 100)
  }
})

// Lock body scroll when sidebar is open
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  if (props.visible) {
    nextTick(() => initVditor())
  }
})

onUnmounted(() => {
  destroyVditor()
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Overlay */
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 999;
}

/* Sidebar */
.editor-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: min(95vw, 1400px);
  height: 100vh;
  background: var(--color-background, #fff);
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.sidebar-main {
  display: flex;
  height: 100%;
}

/* Editor Panel (Left) */
.editor-panel {
  width: 45%;
  min-width: 360px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--stone-200, #e7e5e4);
  background: var(--color-background, #fff);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4, 16px) var(--space-5, 20px);
  border-bottom: 1px solid var(--stone-200, #e7e5e4);
  flex-shrink: 0;
}

.panel-title {
  font-family: var(--font-serif, serif);
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--ink-900, #1c1917);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--stone-500, #78716c);
  background: transparent;
  border: none;
  border-radius: var(--radius-base, 6px);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--vermilion, #c53d43);
  background: var(--vermilion-dim, rgba(197, 61, 67, 0.1));
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5, 20px);
}

/* Form Styles */
.form-group {
  margin-bottom: var(--space-4, 16px);
}

.form-group--flex {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-4, 16px);
}

.form-label {
  display: block;
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--stone-700, #44403c);
  margin-bottom: var(--space-2, 8px);
}

.required {
  color: var(--vermilion, #c53d43);
  margin-left: 2px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  color: var(--ink-900, #1c1917);
  background: var(--color-background, #fff);
  border: 1px solid var(--stone-300, #d6d3d1);
  border-radius: var(--radius-base, 6px);
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--vermilion, #c53d43);
  box-shadow: 0 0 0 3px rgba(197, 61, 67, 0.1);
}

.form-input--error {
  border-color: var(--vermilion, #c53d43);
}

.form-error {
  display: block;
  font-size: var(--font-size-xs, 12px);
  color: var(--vermilion, #c53d43);
  margin-top: var(--space-1, 4px);
}

.form-hint {
  display: block;
  font-size: var(--font-size-xs, 12px);
  color: var(--stone-500, #78716c);
  margin-top: var(--space-1, 4px);
  text-align: right;
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

/* Tags Input */
.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
  align-items: center;
  padding: var(--space-2, 8px);
  background: var(--color-background, #fff);
  border: 1px solid var(--stone-300, #d6d3d1);
  border-radius: var(--radius-base, 6px);
  transition: all 0.2s;
}

.tags-input--focused {
  border-color: var(--vermilion, #c53d43);
  box-shadow: 0 0 0 3px rgba(197, 61, 67, 0.1);
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1, 4px);
  padding: var(--space-1, 4px) var(--space-2, 8px);
  font-size: var(--font-size-xs, 12px);
  color: var(--vermilion, #c53d43);
  background: var(--vermilion-dim, rgba(197, 61, 67, 0.1));
  border-radius: var(--radius-sm, 4px);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 12px;
  color: var(--stone-500, #78716c);
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-remove:hover {
  color: var(--vermilion, #c53d43);
  background: rgba(197, 61, 67, 0.2);
}

.tag-select {
  flex: 1;
  min-width: 100px;
  padding: var(--space-1, 4px);
  font-size: var(--font-size-sm, 14px);
  color: var(--stone-600, #57534e);
  background: transparent;
  border: none;
  cursor: pointer;
}

.tag-select:focus {
  outline: none;
}

/* Vditor Container */
.vditor-container {
  flex: 1;
  min-height: 200px;
  border: 1px solid var(--stone-300, #d6d3d1);
  border-radius: var(--radius-base, 6px);
  overflow: hidden;
}

/* Form Options */
.form-options {
  display: flex;
  gap: var(--space-4, 16px);
  padding-top: var(--space-2, 8px);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  font-size: var(--font-size-sm, 14px);
  color: var(--stone-700, #44403c);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--stone-400, #a8a29e);
  border-radius: var(--radius-sm, 4px);
  transition: all 0.2s;
  position: relative;
}

.checkbox-label input:checked + .checkbox-custom {
  background: var(--vermilion, #c53d43);
  border-color: var(--vermilion, #c53d43);
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Panel Footer */
.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3, 12px) var(--space-5, 20px);
  border-top: 1px solid var(--stone-200, #e7e5e4);
  background: var(--stone-50, #fafaf9);
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
}

.char-count {
  font-size: var(--font-size-xs, 12px);
  color: var(--stone-500, #78716c);
}

.footer-right {
  display: flex;
  gap: var(--space-3, 12px);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2, 8px);
  padding: var(--space-2, 8px) var(--space-5, 20px);
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  border-radius: var(--radius-base, 6px);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  color: white;
  background: var(--vermilion, #c53d43);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #a83238;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  color: var(--stone-700, #44403c);
  background: var(--color-background, #fff);
  border: 1px solid var(--stone-300, #d6d3d1);
}

.btn-secondary:hover {
  background: var(--stone-100, #f5f5f4);
  border-color: var(--stone-400, #a8a29e);
}

.btn-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Preview Panel (Right) */
.preview-panel {
  width: 55%;
  display: flex;
  flex-direction: column;
  background: var(--stone-50, #fafaf9);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3, 12px) var(--space-5, 20px);
  border-bottom: 1px solid var(--stone-200, #e7e5e4);
  background: var(--color-background, #fff);
  flex-shrink: 0;
}

.preview-title {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--stone-600, #57534e);
  text-transform: uppercase;
  letter-spacing: var(--letter-wide, 0.05em);
}

.preview-actions {
  display: flex;
  gap: var(--space-2, 8px);
}

.preview-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--stone-500, #78716c);
  background: transparent;
  border: 1px solid var(--stone-300, #d6d3d1);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all 0.2s;
}

.preview-action:hover {
  color: var(--ink-900, #1c1917);
  background: var(--stone-100, #f5f5f4);
  border-color: var(--stone-400, #a8a29e);
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6, 24px);
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--stone-400, #a8a29e);
  text-align: center;
}

.preview-placeholder p {
  margin-top: var(--space-4, 16px);
  font-size: var(--font-size-sm, 14px);
  line-height: 1.8;
}

/* Preview Content Styles - Matching Article Detail Page */
.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4) {
  font-family: var(--font-serif, Georgia, serif);
  font-weight: 700;
  line-height: 1.4;
  color: #1c1917;
  margin-top: 24px;
  margin-bottom: 12px;
}

.preview-content :deep(h1) {
  font-size: 28px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e7e5e4;
}

.preview-content :deep(h2) {
  font-size: 24px;
}

.preview-content :deep(h3) {
  font-size: 20px;
}

.preview-content :deep(h4) {
  font-size: 18px;
}

.preview-content :deep(p) {
  margin-bottom: 16px;
  font-size: 16px;
  line-height: 1.75;
  color: #292524;
}

.preview-content :deep(a) {
  color: #c53d43;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.preview-content :deep(a:hover) {
  border-bottom-color: #c53d43;
}

.preview-content :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  background: #f5f5f4;
  border-radius: 4px;
  color: #4f46e5;
}

.preview-content :deep(blockquote) {
  border-left: 3px solid #c53d43;
  padding: 12px 20px;
  margin: 20px 0;
  background: #fafaf9;
  color: #57534e;
  font-style: italic;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.preview-content :deep(li) {
  margin-bottom: 8px;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
}

.preview-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #e7e5e4;
}

.preview-content :deep(th) {
  font-weight: 600;
  color: #44403c;
  background: #fafaf9;
}

.preview-content :deep(hr) {
  border: none;
  border-top: 1px solid #e7e5e4;
  margin: 32px 0;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: var(--space-8, 32px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-5, 20px);
  background: var(--ink-900, #1c1917);
  color: white;
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1100;
}

.toast--success {
  background: #1c1917;
}

.toast--error {
  background: var(--vermilion, #c53d43);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: var(--font-size-xs, 12px);
  font-weight: 700;
}

.toast-message {
  font-family: var(--font-sans, sans-serif);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
}

/* Transitions */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Vditor Custom Styles */
:deep(.vditor) {
  border: none !important;
  height: 100% !important;
}

:deep(.vditor-toolbar) {
  border-bottom: 1px solid var(--stone-200, #e7e5e4) !important;
  padding: var(--space-2, 8px) !important;
  background: var(--stone-50, #fafaf9) !important;
}

:deep(.vditor-content) {
  min-height: 100% !important;
}

:deep(.vditor-sv) {
  font-size: 14px !important;
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .editor-sidebar {
    width: 100vw;
  }

  .editor-panel {
    width: 100%;
    min-width: unset;
    border-right: none;
  }

  .preview-panel {
    display: none;
  }

  .panel-body {
    padding: var(--space-4, 16px);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .panel-footer {
    padding: var(--space-3, 12px) var(--space-4, 16px);
  }
}
</style>
