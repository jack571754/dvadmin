<template>
  <footer class="site-footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-main">
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="brand-seal">
            <span class="seal-text">思·录</span>
          </div>
          <p class="brand-description">{{ description }}</p>
        </div>

        <!-- Navigation Section -->
        <nav v-if="navLinks.length" class="footer-nav">
          <h3 class="nav-heading">导航</h3>
          <ul class="nav-list">
            <li v-for="link in navLinks" :key="link.path">
              <router-link :to="link.path" class="nav-link">
                <span class="nav-text">{{ link.label }}</span>
                <span class="nav-indicator">→</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Social Section -->
        <div v-if="socialLinks.length" class="footer-social">
          <h3 class="social-heading">联系</h3>
          <div class="social-links">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              target="_blank"
              rel="noopener noreferrer"
              class="social-link"
              :title="social.name"
            >
              <span class="social-icon">{{ getSocialIcon(social.name) }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="footer-divider">
        <span class="divider-dot"></span>
      </div>

      <!-- Bottom Section -->
      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} {{ blogName }}
          <span class="copyright-separator">·</span>
          <span class="copyright-text">用墨迹记录思考</span>
        </p>

        <!-- Optional Extra Links -->
        <div v-if="extraLinks.length" class="extra-links">
          <a
            v-for="link in extraLinks"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="extra-link"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>

    <!-- Decorative Corner -->
    <div class="footer-decoration">
      <span class="decoration-corner"></span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NavLink {
  label: string
  path: string
}

interface SocialLink {
  name: string
  url: string
}

interface ExtraLink {
  label: string
  url: string
}

interface Props {
  blogName?: string
  description?: string
  navLinks?: NavLink[]
  socialLinks?: SocialLink[]
  extraLinks?: ExtraLink[]
}

const props = withDefaults(defineProps<Props>(), {
  blogName: '思·录',
  description: '关于技术、设计与思考的记录',
  navLinks: () => [
    { label: '首页', path: '/' },
    { label: '归档', path: '/archive' },
    { label: '关于', path: '/about' },
  ],
  socialLinks: () => [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Email', url: 'mailto:hello@example.com' },
  ],
  extraLinks: () => [] as ExtraLink[],
})

const currentYear = computed(() => new Date().getFullYear())

const getSocialIcon = (name: string): string => {
  const icons: Record<string, string> = {
    GitHub: '',
    Twitter: '𝕏',
    Email: '@',
    WeChat: '💬',
    Weibo: '📢',
    Zhihu: '🧠',
    RSS: '☰',
  }
  return icons[name] || name[0]
}
</script>

<style scoped>
.site-footer {
  position: relative;
  margin-top: var(--space-20);
  padding: var(--space-16) 0 var(--space-8);
  background: linear-gradient(to bottom, var(--color-background) 0%, var(--stone-100) 100%);
  border-top: 1px solid var(--stone-200);
}

.footer-container {
  max-width: var(--container-5xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* ========================================
   Main Footer Content
   ======================================== */

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-10);
  margin-bottom: var(--space-10);
}

/* Brand Section */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.brand-seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--ink-900);
  border-radius: var(--radius-full);
}

.seal-text {
  font-family: var(--font-serif);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  color: var(--paper-50);
  letter-spacing: var(--letter-snug);
}

.brand-description {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--stone-600);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 240px;
}

/* Navigation Section */
.footer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.nav-heading {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0;
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  text-decoration: none;
  color: var(--stone-600);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.nav-link:hover {
  color: var(--vermilion);
}

.nav-link:hover .nav-indicator {
  transform: translateX(4px);
}

.nav-text {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.nav-indicator {
  font-size: var(--font-size-base);
  color: var(--stone-400);
  transition: transform var(--duration-fast) var(--ease-out-quart);
}

/* Social Section */
.footer-social {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.social-heading {
  font-family: var(--font-serif);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--ink-900);
  margin: 0;
  letter-spacing: var(--letter-wide);
  text-transform: uppercase;
}

.social-links {
  display: flex;
  gap: var(--space-2);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--stone-200);
  border-radius: var(--radius-base);
  text-decoration: none;
  color: var(--stone-700);
  transition: all var(--duration-fast) var(--ease-out-quart);
}

.social-link:hover {
  background: var(--vermilion);
  color: white;
  transform: translateY(-2px);
}

.social-icon {
  font-size: var(--font-size-lg);
  line-height: 1;
}

/* ========================================
   Divider
   ======================================== */

.footer-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) 0;
}

.divider-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vermilion);
}

/* ========================================
   Bottom Section
   ======================================== */

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.copyright {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.copyright-separator {
  color: var(--stone-300);
}

.copyright-text {
  font-style: italic;
}

.extra-links {
  display: flex;
  gap: var(--space-4);
}

.extra-link {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--stone-500);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out-quart);
}

.extra-link:hover {
  color: var(--vermilion);
}

/* ========================================
   Decoration Corner
   ======================================== */

.footer-decoration {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 120px;
  height: 120px;
  pointer-events: none;
  opacity: 0.1;
}

.decoration-corner {
  display: block;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, var(--vermilion) 0%, transparent 60%);
}

/* ========================================
   Responsive Design
   ======================================== */

@media (max-width: 768px) {
  .site-footer {
    margin-top: var(--space-16);
    padding: var(--space-12) 0 var(--space-6);
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .copyright {
    flex-direction: column;
    gap: var(--space-1);
  }

  .footer-decoration {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 var(--space-4);
  }

  .brand-seal {
    width: 48px;
    height: 48px;
  }

  .seal-text {
    font-size: var(--font-size-base);
  }

  .brand-description {
    font-size: var(--font-size-xs);
  }

  .extra-links {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
