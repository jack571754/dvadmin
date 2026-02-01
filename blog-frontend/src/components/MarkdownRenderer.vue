<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// Props
interface Props {
  content: string;
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
});

// Configure markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return '';
  }
});

// Render markdown content
const renderedHtml = computed(() => {
  if (!props.content) return '';
  return md.render(props.content);
});

// Load highlight.js styles dynamically
onMounted(() => {
  // Import a clean, minimal code highlighting theme
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
  document.head.appendChild(link);
});

// Watch for content changes
watch(() => props.content, () => {
  // Re-render when content changes
  renderedHtml.value = md.render(props.content);
});
</script>

<style scoped>
@import '../assets/styles/variables.css';

.markdown-renderer {
  color: var(--color-primary);
  line-height: var(--line-height-relaxed);
}

/* Markdown Content Typography */
.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  font-family: var(--font-serif);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  color: var(--color-primary);
  margin-top: var(--space-2xl);
  margin-bottom: var(--space-md);
  letter-spacing: -0.02em;
}

.markdown-renderer :deep(h1) {
  font-size: 32px;
  margin-top: 0;
}

.markdown-renderer :deep(h2) {
  font-size: 26px;
}

.markdown-renderer :deep(h3) {
  font-size: 22px;
}

.markdown-renderer :deep(h4) {
  font-size: 20px;
}

.markdown-renderer :deep(p) {
  margin-bottom: var(--space-md);
  font-size: var(--font-size-body);
  color: var(--color-primary);
}

.markdown-renderer :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: all var(--transition-fast);
}

.markdown-renderer :deep(a:hover) {
  color: #136f13;
  text-decoration-thickness: 2px;
}

/* Lists */
.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  margin-bottom: var(--space-md);
  padding-left: var(--space-lg);
}

.markdown-renderer :deep(li) {
  margin-bottom: var(--space-sm);
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
}

.markdown-renderer :deep(li > p) {
  margin-bottom: 0;
}

/* Blockquotes */
.markdown-renderer :deep(blockquote) {
  margin: var(--space-lg) 0;
  padding: 0 var(--space-lg);
  border-left: 3px solid var(--color-accent);
  font-style: italic;
  color: var(--color-secondary);
}

.markdown-renderer :deep(blockquote p) {
  font-size: var(--font-size-body);
}

/* Code blocks */
.markdown-renderer :deep(pre) {
  margin: var(--space-lg) 0;
  padding: var(--space-lg);
  background-color: #f6f8fa;
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-size: var(--font-size-meta);
}

.markdown-renderer :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.markdown-renderer :deep(p code),
.markdown-renderer :deep(li code) {
  background-color: var(--color-accent-light);
  color: #0d5c0d;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.markdown-renderer :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

/* Tables */
.markdown-renderer :deep(table) {
  width: 100%;
  margin: var(--space-lg) 0;
  border-collapse: collapse;
  font-size: var(--font-size-body);
}

.markdown-renderer :deep(table thead) {
  border-bottom: 2px solid var(--color-border);
}

.markdown-renderer :deep(table th) {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);
  text-align: left;
  padding: var(--space-sm) var(--space-md);
}

.markdown-renderer :deep(table td) {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.markdown-renderer :deep(table tr:last-child td) {
  border-bottom: none;
}

/* Horizontal rule */
.markdown-renderer :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-2xl) 0;
}

/* Images */
.markdown-renderer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: var(--space-lg) 0;
}

/* Strong and emphasis */
.markdown-renderer :deep(strong) {
  font-weight: var(--font-weight-semibold);
}

.markdown-renderer :deep(em) {
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .markdown-renderer :deep(h1) {
    font-size: 26px;
  }

  .markdown-renderer :deep(h2) {
    font-size: 22px;
  }

  .markdown-renderer :deep(h3) {
    font-size: 20px;
  }

  .markdown-renderer :deep(pre) {
    padding: var(--space-md);
  }

  .markdown-renderer :deep(table) {
    font-size: var(--font-size-meta);
  }
}
</style>
