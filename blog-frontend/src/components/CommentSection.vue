<template>
  <div class="comment-section">
    <h3 class="comment-title">
      <span class="title-icon">◇</span>
      <span>评论 ({{ comments.length }})</span>
    </h3>

    <!-- Comment Form - Only show when logged in -->
    <div v-if="isLoggedIn" class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="写下你的想法..."
        class="comment-textarea"
        rows="3"
        :disabled="submitting"
      ></textarea>
      <div class="comment-form-actions">
        <button
          @click="submitComment"
          :disabled="!newComment.trim() || submitting"
          class="submit-btn"
        >
          {{ submitting ? '提交中...' : '发表评论' }}
        </button>
      </div>
    </div>
    <div v-else class="comment-login-hint">
      <router-link to="/login" class="login-link">登录</router-link>
      <span>后参与评论</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="comment-loading">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </div>

    <!-- Comments List -->
    <div v-else-if="comments.length > 0" class="comment-list">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <div class="comment-avatar">
          <span class="avatar-text">{{ getAvatarText(comment.user_info?.name || comment.user_info?.username || '用户') }}</span>
        </div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">{{ comment.user_info?.name || comment.user_info?.username || '匿名用户' }}</span>
            <span class="comment-time">{{ formatTime(comment.create_datetime) }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          
          <!-- Reply Form -->
          <div v-if="replyingTo === comment.id && isLoggedIn" class="reply-form">
            <textarea
              v-model="replyContent"
              placeholder="写下你的回复..."
              class="reply-textarea"
              rows="2"
              :disabled="submitting"
            ></textarea>
            <div class="reply-form-actions">
              <button @click="cancelReply" class="cancel-btn">取消</button>
              <button
                @click="submitReply(comment.id)"
                :disabled="!replyContent.trim() || submitting"
                class="submit-btn"
              >
                回复
              </button>
            </div>
          </div>
          
          <!-- Reply Button -->
          <button
            v-else-if="isLoggedIn"
            @click="startReply(comment.id)"
            class="reply-btn"
          >
            回复
          </button>

          <!-- Nested Replies -->
          <div v-if="comment.replies_list && comment.replies_list.length > 0" class="reply-list">
            <div
              v-for="reply in comment.replies_list"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-avatar">
                <span class="avatar-text avatar-text--sm">{{ getAvatarText(reply.user_info?.name || reply.user_info?.username || '用户') }}</span>
              </div>
              <div class="reply-body">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.user_info?.name || reply.user_info?.username || '匿名用户' }}</span>
                  <span class="reply-time">{{ formatTime(reply.create_datetime) }}</span>
                </div>
                <p class="reply-content">{{ reply.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="comment-empty">
      <p>暂无评论，快来发表第一条评论吧！</p>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <span class="toast-icon">✓</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { blogApi, type CommentApiResponse } from '@/api/blog'

interface Props {
  articleId: string
}

const props = defineProps<Props>()

const loading = ref(true)
const submitting = ref(false)
const comments = ref<CommentApiResponse[]>([])
const newComment = ref('')
const replyingTo = ref<number | null>(null)
const replyContent = ref('')
const showToast = ref(false)
const toastMessage = ref('')

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('auth_token')
})

const fetchComments = async () => {
  loading.value = true
  try {
    comments.value = await blogApi.getCommentsByArticle(props.articleId)
  } catch (err) {
    console.error('Failed to fetch comments:', err)
    comments.value = []
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  submitting.value = true
  try {
    const comment = await blogApi.createComment({
      article: parseInt(props.articleId),
      content: newComment.value.trim()
    })
    comments.value.unshift(comment)
    newComment.value = ''
    showNotification('评论发表成功')
  } catch (err) {
    console.error('Failed to submit comment:', err)
    showNotification('评论发表失败，请重试')
  } finally {
    submitting.value = false
  }
}

const startReply = (commentId: number) => {
  replyingTo.value = commentId
  replyContent.value = ''
}

const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

const submitReply = async (parentId: number) => {
  if (!replyContent.value.trim()) return
  
  submitting.value = true
  try {
    const reply = await blogApi.createComment({
      article: parseInt(props.articleId),
      content: replyContent.value.trim(),
      parent: parentId
    })
    
    const parentComment = comments.value.find(c => c.id === parentId)
    if (parentComment) {
      if (!parentComment.replies_list) {
        parentComment.replies_list = []
      }
      parentComment.replies_list.push({
        id: reply.id,
        content: reply.content,
        user: reply.user,
        created_time: reply.create_datetime
      } as any)
    }
    
    cancelReply()
    showNotification('回复发表成功')
  } catch (err) {
    console.error('Failed to submit reply:', err)
    showNotification('回复发表失败，请重试')
  } finally {
    submitting.value = false
  }
}

const getAvatarText = (name: string) => {
  return name.charAt(0).toUpperCase()
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const showNotification = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2500)
}

watch(() => props.articleId, () => {
  fetchComments()
})

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: var(--space-8);
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
}

.comment-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-serif);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0 0 var(--space-6) 0;
}

.title-icon {
  color: var(--vermilion);
}

/* Comment Form */
.comment-form {
  margin-bottom: var(--space-8);
}

.comment-textarea,
.reply-textarea {
  width: 100%;
  padding: var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--ink-800);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  resize: vertical;
  transition: border-color var(--duration-fast) var(--ease-out-quart);
}

.comment-textarea:focus,
.reply-textarea:focus {
  outline: none;
  border-color: var(--vermilion);
}

.comment-form-actions,
.reply-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.submit-btn {
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: white;
  background: var(--vermilion);
  border: none;
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.submit-btn:hover:not(:disabled) {
  background: #b33827;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  background: transparent;
  border: 1px solid var(--stone-300);
  border-radius: var(--radius-base);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.cancel-btn:hover {
  border-color: var(--stone-400);
  color: var(--ink-900);
}

.comment-login-hint {
  padding: var(--space-4);
  text-align: center;
  background: var(--stone-50);
  border-radius: var(--radius-base);
  margin-bottom: var(--space-8);
}

.login-link {
  color: var(--vermilion);
  font-weight: var(--font-weight-medium);
}

/* Loading State */
.comment-loading {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-8) 0;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vermilion);
  animation: pulse 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Comments List */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.comment-item {
  display: flex;
  gap: var(--space-3);
}

.comment-avatar {
  flex-shrink: 0;
}

.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: white;
  background: var(--vermilion);
  border-radius: 50%;
}

.avatar-text--sm {
  width: 32px;
  height: 32px;
  font-size: var(--font-size-sm);
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-header,
.reply-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.comment-author,
.reply-author {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--ink-900);
}

.comment-time,
.reply-time {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
}

.comment-content,
.reply-content {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--ink-800);
  line-height: var(--leading-relaxed);
  margin: 0;
}

.reply-btn {
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.reply-btn:hover {
  color: var(--vermilion);
}

/* Reply Form */
.reply-form {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background: var(--stone-50);
  border-radius: var(--radius-base);
}

/* Reply List */
.reply-list {
  margin-top: var(--space-4);
  padding-left: var(--space-4);
  border-left: 2px solid var(--stone-200);
}

.reply-item {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) 0;
}

.reply-item + .reply-item {
  border-top: 1px solid var(--stone-100);
}

.reply-body {
  flex: 1;
  min-width: 0;
}

/* Empty State */
.comment-empty {
  padding: var(--space-8) 0;
  text-align: center;
}

.comment-empty p {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--stone-500);
  font-style: italic;
  margin: 0;
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--ink-900);
  color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-ink-lg);
  z-index: var(--z-modal);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--vermilion);
  border-radius: 50%;
  font-size: var(--font-size-xs);
}

.toast-message {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-out-quart);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* Responsive */
@media (max-width: 768px) {
  .comment-item {
    flex-direction: column;
  }
  
  .reply-list {
    padding-left: var(--space-3);
  }
}
</style>
