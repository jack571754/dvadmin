<template>
  <div class="portfolio-wrapper" ref="scrollContainer" @scroll="handleScroll">
    <!-- Navbar -->
    <nav class="nav" :class="{ 'scrolled': isScrolled || mobileMenuOpen }">
      <div class="nav-logo">{{ config.name }}</div>
      
      <!-- Right Side Controls -->
      <div class="nav-right">
        <!-- Desktop Links -->
        <div class="nav-links">
          <a href="#hero" @click="scrollTo($event, '#hero')">主页</a>
          <a href="#blog" @click="scrollTo($event, '#blog')">作品</a>
          <a href="#resume" @click="scrollTo($event, '#resume')">履历</a>
          <a href="#contact" @click="scrollTo($event, '#contact')">联络</a>
        </div>

        <!-- Contact CTA Button -->
        <a href="#contact" @click="contactMe($event)" class="nav-contact-btn">联系我</a>

        <!-- Hamburger Button (Mobile Only) -->
        <button class="menu-btn" @click="toggleMobileMenu" aria-label="Toggle Menu">
          <span class="menu-btn-bar" :class="{ 'open': mobileMenuOpen }"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <transition name="drawer-fade">
      <div class="mobile-drawer" v-if="mobileMenuOpen" @click.self="closeMobileMenu">
        <div class="mobile-drawer-content">
          <a href="#hero" @click="scrollTo($event, '#hero', true)">主页</a>
          <a href="#blog" @click="scrollTo($event, '#blog', true)">作品</a>
          <a href="#resume" @click="scrollTo($event, '#resume', true)">履历</a>
          <a href="#contact" @click="scrollTo($event, '#contact', true)">联络</a>
        </div>
      </div>
    </transition>

    <!-- Hero Card Section -->
    <section class="hero" id="hero">
      <div class="card-perspective">
        <div 
          class="business-card" 
          :style="{ transform: cardTransform }"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
        >
          <div class="card-inner">
            <div class="card-header-main">
              <div v-if="config.avatar" class="avatar-wrap">
                <img :src="getImageUrl(config.avatar)" alt="Avatar" class="avatar-img" />
              </div>
              <h1 class="card-title">
                {{ config.hero_title.split(' ')[0] || 'Crafting' }}
                <span>{{ config.hero_title.split(' ').slice(1).join(' ') || 'digital' }}</span>
              </h1>
            </div>
            <div class="card-role">{{ config.hero_role }}</div>
            <!-- Social Proof -->
            <div v-if="config.social_proof" class="card-social-proof">
              <span class="star-icon">★</span> {{ config.social_proof }}
            </div>
            <p class="card-bio">{{ config.hero_bio }}</p>
            <!-- CTA Button -->
            <div class="card-cta-wrap">
              <button class="card-cta-btn" @click="contactMe($event)">
                <span>立即合作</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator" @click="scrollTo($event, '#blog')">向下滑动发现更多</div>
    </section>

    <!-- Portfolio Section -->
    <section class="container reveal" id="blog">
      <div class="section-header">
        <div class="section-subtitle">01 / Portfolio & Words</div>
        <h2 class="section-title">视界与作品</h2>
      </div>

      <!-- Filter Group -->
      <div class="filter-group">
        <button 
          class="filter-btn" 
          :class="{ 'active': activeCategory === 'all' }" 
          @click="activeCategory = 'all'"
        >
          全部内容
        </button>
        <button 
          class="filter-btn" 
          :class="{ 'active': activeCategory === 'case-study' }" 
          @click="activeCategory = 'case-study'"
        >
          精选案例
        </button>
        <button 
          class="filter-btn" 
          :class="{ 'active': activeCategory === 'essay' }" 
          @click="activeCategory = 'essay'"
        >
          深度思考
        </button>
        <button 
          class="filter-btn" 
          :class="{ 'active': activeCategory === 'experiment' }" 
          @click="activeCategory = 'experiment'"
        >
          代码实验
        </button>
      </div>

      <!-- Grid -->
      <transition-group name="grid" tag="div" class="grid">
        <div 
          v-for="item in filteredItems" 
          :key="item.id" 
          class="card" 
          @click="handleItemClick(item)"
        >
          <div class="card-image-wrap" v-if="item.image">
            <img :src="getImageUrl(item.image)" :alt="item.title" class="card-img" />
          </div>
          <div class="card-text-wrap">
            <div class="card-meta-row">
              <span class="card-meta">{{ formatCategory(item.category) }}</span>
              <span v-if="item.result_tag" class="card-result-badge">{{ item.result_tag }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <div class="card-links" v-if="item.demo_url || item.git_url || item.content">
              <span class="read-more-btn" v-if="item.content">阅读详情</span>
              <a v-if="item.demo_url" :href="item.demo_url" target="_blank" @click.stop class="link-btn">
                演示
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <a v-if="item.git_url" :href="item.git_url" target="_blank" @click.stop class="link-btn">
                源码
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </transition-group>
    </section>

    <!-- Resume Section -->
    <section class="container reveal" id="resume">
      <div class="section-header">
        <div class="section-subtitle">02 / Experience</div>
        <h2 class="section-title">职业履历</h2>
      </div>

      <div class="timeline">
        <div 
          v-for="item in timeline" 
          :key="item.id" 
          class="timeline-item" 
          :class="{ 'active': expandedTimelineId === item.id }"
        >
          <div class="timeline-header" @click="toggleTimeline(item.id)">
            <div class="timeline-header-left">
              <div class="timeline-role">{{ item.role }}</div>
              <div class="timeline-company">{{ item.company }}</div>
            </div>
            <div class="timeline-date">{{ item.start_date }} — {{ item.end_date }}</div>
          </div>
          <transition name="accordion">
            <div class="timeline-content-wrapper" v-show="expandedTimelineId === item.id">
              <div class="timeline-content">
                <p class="timeline-summary">{{ item.summary }}</p>
                <ul v-if="item.achievements && item.achievements.length">
                  <li v-for="(achievement, index) in item.achievements" :key="index">
                    {{ achievement }}
                  </li>
                </ul>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="contact" class="reveal">
      <h2 class="contact-title">期待与你的对话。</h2>
      <p class="contact-desc">
        无论是全职机会、独立项目咨询，还是仅仅想探讨设计与技术。
      </p>
      <button class="btn-primary" @click="contactMe($event)">
        <span>获取我的联络邮箱</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      </button>
      <span class="copy-feedback" :class="{ 'show': copySuccess }">已复制并唤起邮箱：{{ config.email }}</span>
    </footer>

    <!-- Details Modal -->
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="detailVisible" @click.self="detailVisible = false">
        <div class="modal-content">
          <button class="modal-close" @click="detailVisible = false" aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="modal-body-scroll">
            <div class="modal-header-info">
              <span class="modal-category">{{ formatCategory(activeItem?.category) }}</span>
              <h2 class="modal-title">{{ activeItem?.title }}</h2>
              <p class="modal-summary">{{ activeItem?.summary }}</p>
              <div class="modal-links" v-if="activeItem?.demo_url || activeItem?.git_url">
                <a v-if="activeItem.demo_url" :href="activeItem.demo_url" target="_blank" class="modal-link-btn">
                  在线演示
                </a>
                <a v-if="activeItem.git_url" :href="activeItem.git_url" target="_blank" class="modal-link-btn">
                  查看源码
                </a>
              </div>
            </div>
            <div class="modal-divider"></div>
            <div class="modal-text-content" v-html="renderMarkdown(activeItem?.content)"></div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { request } from '/@/utils/service';
import { getBaseURL } from '/@/utils/baseUrl';

// States
const scrollContainer = ref<HTMLElement | null>(null);
const loading = ref(true);
const config = ref<any>({
  name: 'H.',
  avatar: '',
  hero_title: 'Crafting digital experiences.',
  hero_role: '产品设计专家 & 全栈开发者',
  hero_bio: '我专注于复杂系统的体验设计与现代 Web 技术的融合。在这里，不仅是我的过往履历，也是我思考设计与工程边界的数字游乐场。',
  email: 'hello@yourdomain.com'
});
const timeline = ref<any[]>([]);
const items = ref<any[]>([]);

const activeCategory = ref('all');
const expandedTimelineId = ref<number | null>(null);
const copySuccess = ref(false);
const mobileMenuOpen = ref(false);
const isScrolled = ref(false);

// Details Modal State
const activeItem = ref<any>(null);
const detailVisible = ref(false);

// 3D Card Tilt state
const tiltX = ref(0);
const tiltY = ref(0);
const cardTransform = computed(() => {
  return `rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg)`;
});

// Fetch Data
const fetchData = async () => {
  try {
    const res = await request({
      url: '/api/portfolio/public/',
      method: 'get'
    });
    if (res.data) {
      if (res.data.config) config.value = res.data.config;
      if (res.data.timeline) {
        timeline.value = res.data.timeline;
        if (timeline.value.length > 0) {
          expandedTimelineId.value = timeline.value[0].id;
        }
      }
      if (res.data.items) items.value = res.data.items;
    }
  } catch (err) {
    console.error('Failed to load portfolio data:', err);
  } finally {
    loading.value = false;
  }
};

// Filtered Items
const filteredItems = computed(() => {
  if (activeCategory.value === 'all') return items.value;
  return items.value.filter(item => item.category === activeCategory.value);
});

// Image helper
const getImageUrl = (url: string) => {
  if (!url) return '';
  return getBaseURL(url);
};

// Category label helper
const formatCategory = (cat: string) => {
  switch (cat) {
    case 'case-study': return '精选案例';
    case 'essay': return '深度思考';
    case 'experiment': return '代码实验';
    default: return cat || '';
  }
};

// Scroll listener
const handleScroll = () => {
  if (scrollContainer.value) {
    isScrolled.value = scrollContainer.value.scrollTop > 50;
  }
};

// Scroll to target element
const scrollTo = (e: Event, selector: string, isMobile: boolean = false) => {
  e.preventDefault();
  if (isMobile) {
    closeMobileMenu();
  }
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
};

// Mouse move for 3D card tilt
const handleMouseMove = (e: MouseEvent) => {
  if (window.innerWidth < 768) return; // Disable on H5 mobile
  const card = e.currentTarget as HTMLElement;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  
  // Max angles limit
  const rotateX = Math.max(-10, Math.min(10, -(y / (rect.height / 2)) * 10));
  const rotateY = Math.max(-10, Math.min(10, (x / (rect.width / 2)) * 10));
  
  tiltX.value = rotateX;
  tiltY.value = rotateY;
};

const handleMouseLeave = () => {
  tiltX.value = 0;
  tiltY.value = 0;
};

// Toggle timeline folding items
const toggleTimeline = (id: number) => {
  if (expandedTimelineId.value === id) {
    expandedTimelineId.value = null;
  } else {
    expandedTimelineId.value = id;
  }
};

// Copy email & open client
const contactMe = (e?: Event) => {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const emailAddr = config.value.email || 'hello@yourdomain.com';
  navigator.clipboard.writeText(emailAddr).then(() => {
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  });
  window.location.href = `mailto:${emailAddr}`;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

// Markdown simple parser
const renderMarkdown = (text: string) => {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/gim, '<br />');
  
  // Wrap list items in lists
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
  // Clean double nested lists
  html = html.replace(/<\/ul>(\s*<br\s*\/?>\s*)*<ul>/gim, '');
  return html;
};

const handleItemClick = (item: any) => {
  if (item.content) {
    activeItem.value = item;
    detailVisible.value = true;
  } else if (item.demo_url) {
    window.open(item.demo_url, '_blank');
  }
};

// Intersection Observer for animations
let observer: IntersectionObserver | null = null;
const setupObserver = () => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer?.unobserve(entry.target);
      }
    });
  }, { 
    root: scrollContainer.value,
    threshold: 0.1 
  });

  const els = document.querySelectorAll('.reveal');
  els.forEach(el => observer?.observe(el));
};

onMounted(() => {
  fetchData().then(() => {
    setTimeout(setupObserver, 200);
  });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');

.portfolio-wrapper {
  --bg: #070709;
  --surface: #121216;
  --surface-hover: #1a1a1f;
  --fg: #f4f4f5;
  --muted: #8a8a93;
  --border: #26262d;
  --accent: #d4af37; /* Gold */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --ease: cubic-bezier(0.25, 1, 0.5, 1);

  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  line-height: 1.6;
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

.portfolio-wrapper * {
  box-sizing: border-box;
}

/* Nav */
.nav {
  position: fixed;
  top: 0;
  width: 100%;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  background: rgba(7, 7, 9, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease, padding 0.3s ease;
}

.nav.scrolled {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border);
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--fg);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 0.02em;
  transition: color 0.3s var(--ease);
}

.nav-links a:hover {
  color: var(--accent);
}

.nav-contact-btn {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.4rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s var(--ease);
  white-space: nowrap;
}

.nav-contact-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  color: var(--fg);
  border-color: var(--fg);
}

/* Mobile Hamburger Menu */
.menu-btn {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 110;
}

.menu-btn-bar {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--fg);
  position: relative;
  transition: background 0.3s;
}

.menu-btn-bar::before,
.menu-btn-bar::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 2px;
  background: var(--fg);
  left: 0;
  transition: transform 0.3s;
}

.menu-btn-bar::before {
  top: -6px;
}

.menu-btn-bar::after {
  bottom: -6px;
}

.menu-btn-bar.open {
  background: transparent;
}

.menu-btn-bar.open::before {
  transform: rotate(45deg);
  top: 0;
}

.menu-btn-bar.open::after {
  transform: rotate(-45deg);
  bottom: 0;
}

/* Mobile Drawer */
.mobile-drawer {
  position: fixed;
  inset: 0;
  background: rgba(7, 7, 9, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mobile-drawer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.mobile-drawer-content a {
  font-family: var(--font-display);
  font-size: 2rem;
  color: var(--fg);
  text-decoration: none;
  transition: color 0.3s;
}

.mobile-drawer-content a:hover {
  color: var(--accent);
}

/* Hero */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
}

.card-perspective {
  perspective: 1500px;
  width: 100%;
  max-width: 640px;
}

.business-card {
  width: 100%;
  padding: 4rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  cursor: crosshair;
}

.business-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 8px;
  pointer-events: none;
}

.card-inner {
  transform: translateZ(40px);
}

.card-header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.avatar-wrap {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--accent);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title {
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 400;
  color: var(--fg);
}

.card-title span {
  color: var(--accent);
  font-style: italic;
}

.card-role {
  font-size: 1rem;
  color: var(--muted);
  margin-bottom: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card-social-proof {
  font-size: 0.85rem;
  color: var(--accent);
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-social-proof .star-icon {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-bio {
  font-size: 0.95rem;
  color: #b0b0b8;
  line-height: 1.7;
}

.card-cta-wrap {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-start;
}

.card-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--accent);
  color: var(--bg);
  padding: 0.75rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s var(--ease);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

.card-cta-btn:hover {
  background: var(--fg);
  color: var(--bg);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.15);
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  animation: pulse 2s infinite;
  cursor: pointer;
  transition: color 0.3s;
}

.scroll-indicator:hover {
  color: var(--accent);
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, 0); }
  50% { opacity: 1; transform: translate(-50%, 5px); }
}

/* Layout */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 8rem 2rem;
}

.section-header {
  margin-bottom: 4rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 400;
  margin-top: 0.5rem;
}

.section-subtitle {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

/* Resume */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.3s var(--ease);
}

.timeline-item:hover {
  border-color: #3a3a45;
}

.timeline-header {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.timeline-header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.timeline-role {
  font-family: var(--font-display);
  font-size: 1.4rem;
  color: var(--fg);
}

.timeline-company {
  color: var(--muted);
  font-size: 0.9rem;
}

.timeline-date {
  font-size: 0.9rem;
  color: var(--accent);
  font-weight: 500;
}

.timeline-content-wrapper {
  transition: max-height 0.4s var(--ease);
}

.timeline-content {
  padding: 0 2rem 2rem 2rem;
  color: #a0a0aa;
  font-size: 0.95rem;
}

.timeline-summary {
  margin-bottom: 1rem;
}

.timeline-content ul {
  margin-left: 1.2rem;
}

.timeline-content li {
  margin-bottom: 0.6rem;
}

/* Grid Filter */
.filter-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.filter-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 0.6rem 1.6rem;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s var(--ease);
}

.filter-btn:hover, .filter-btn.active {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(212, 175, 55, 0.05);
}

/* Works Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.4s var(--ease), background-color 0.4s var(--ease), border-color 0.4s var(--ease);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-8px);
  background-color: var(--surface-hover);
  border-color: #3a3a45;
}

.card-image-wrap {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease);
}

.card:hover .card-img {
  transform: scale(1.05);
}

.card-text-wrap {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.card-meta {
  font-size: 0.75rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}

.card-result-badge {
  font-size: 0.7rem;
  color: var(--accent);
  border: 1px solid var(--accent);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.card h3 {
  font-family: var(--font-display);
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
  font-weight: 400;
  color: var(--fg);
}

.card p {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex-grow: 1;
}

.card-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.read-more-btn {
  font-size: 0.85rem;
  color: var(--accent);
  font-weight: 500;
  transition: opacity 0.3s;
}

.read-more-btn:hover {
  opacity: 0.8;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.3s;
}

.link-btn:hover {
  color: var(--accent);
}

/* Footer */
footer {
  border-top: 1px solid var(--border);
  padding: 6rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, var(--bg) 0%, #0d0d12 100%);
}

.contact-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--fg);
}

.contact-desc {
  color: var(--muted);
  margin-bottom: 2.5rem;
  font-size: 0.95rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--fg);
  color: var(--bg);
  padding: 1rem 2.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s var(--ease), transform 0.3s var(--ease);
}

.btn-primary:hover {
  background-color: var(--accent);
  transform: scale(1.02);
}

.copy-feedback {
  display: block;
  margin-top: 1.5rem;
  font-size: 0.85rem;
  color: var(--accent);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s, transform 0.3s;
}

.copy-feedback.show {
  opacity: 1;
  transform: translateY(0);
}

/* Scroll reveal animations */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s var(--ease), transform 0.8s var(--ease);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Accordion Transition */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.4s var(--ease), opacity 0.3s ease;
  overflow: hidden;
  max-height: 400px;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Transition Group Grid */
.grid-enter-active,
.grid-leave-active {
  transition: all 0.5s var(--ease);
}

.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.grid-leave-active {
  position: absolute;
}

/* Details Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(7, 7, 9, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: transparent;
  border: none;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.3s;
  z-index: 10;
}

.modal-close:hover {
  color: var(--accent);
}

.modal-body-scroll {
  overflow-y: auto;
  padding: 3rem;
  display: flex;
  flex-direction: column;
}

.modal-header-info {
  margin-bottom: 2rem;
}

.modal-category {
  font-size: 0.8rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 400;
  color: var(--fg);
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.modal-summary {
  font-size: 1rem;
  color: #b0b0b8;
  line-height: 1.7;
}

.modal-links {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-link-btn {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.modal-link-btn:hover {
  background: var(--accent);
  color: var(--bg);
}

.modal-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 2rem;
}

.modal-text-content {
  font-size: 1rem;
  color: #d4d4d8;
  line-height: 1.8;
}

/* Markdown styling inside modal */
.modal-text-content :deep(h1),
.modal-text-content :deep(h2),
.modal-text-content :deep(h3) {
  font-family: var(--font-display);
  color: var(--fg);
  font-weight: 400;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.modal-text-content :deep(h1) { font-size: 1.8rem; }
.modal-text-content :deep(h2) { font-size: 1.5rem; }
.modal-text-content :deep(h3) { font-size: 1.25rem; }

.modal-text-content :deep(p) {
  margin-bottom: 1.25rem;
}

.modal-text-content :deep(ul) {
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
  list-style-type: square;
}

.modal-text-content :deep(li) {
  margin-bottom: 0.5rem;
  color: #a1a1aa;
}

.modal-text-content :deep(strong) {
  color: var(--accent);
  font-weight: 600;
}

/* Modal Fade Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s var(--ease);
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.4s var(--ease), opacity 0.4s var(--ease);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}

.modal-fade-leave-to .modal-content {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}

/* Drawer Fade Transition */
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.3s;
}

.drawer-fade-enter-active .mobile-drawer-content,
.drawer-fade-leave-active .mobile-drawer-content {
  transition: transform 0.3s var(--ease), opacity 0.3s;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-fade-enter-from .mobile-drawer-content {
  transform: translateY(-20px);
  opacity: 0;
}

.drawer-fade-leave-to .mobile-drawer-content {
  transform: translateY(-20px);
  opacity: 0;
}

/* H5 Responsive */
@media (max-width: 768px) {
  .nav {
    padding: 1rem 1.5rem;
  }
  
  .nav.scrolled {
    padding: 1rem 1.5rem;
  }

  .nav-links {
    display: none;
  }

  .menu-btn {
    display: block;
  }

  .business-card {
    padding: 2.5rem;
    cursor: default;
  }

  .card-title {
    font-size: 2.4rem;
  }

  .container {
    padding: 6rem 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.5rem;
  }

  .timeline-date {
    text-align: left;
  }

  .timeline-content {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .modal-backdrop {
    padding: 1rem;
  }

  .modal-content {
    max-height: 90vh;
  }

  .modal-body-scroll {
    padding: 2rem 1.5rem;
  }

  .modal-title {
    font-size: 1.8rem;
  }
}
</style>
