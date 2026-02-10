<template>
  <div class="home-page">
    <!-- Search bar -->
    <div class="search-bar">
      <span class="icon search-icon">search</span>
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="#搜索帖子"
        @keydown.enter="doSearch"
      />
      <button v-if="searchKeyword" class="btn-icon" @click="clearSearch">
        <span class="icon" style="font-size:18px;">close</span>
      </button>
    </div>

    <!-- Tab bar -->
    <div class="tab-bar-wrapper">
      <div class="tab-bar">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-item', { active: activeTab === tab.id }]"
          @click="switchTab(tab.id)"
        >
          {{ tab.shortname || tab.name }}
        </button>
      </div>
    </div>

    <!-- Sort row -->
    <div class="sort-row">
      <button
        :class="['sort-btn', { active: sortMode === 1 }]"
        @click="changeSortMode(1)"
      >默认排序</button>
      <button
        :class="['sort-btn', { active: sortMode === 0 }]"
        @click="changeSortMode(0)"
      >最新发帖</button>
    </div>

    <!-- Post list -->
    <div class="post-list">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @click="goToPost(post.id)"
      />

      <!-- Loading -->
      <div v-if="loading" class="load-indicator">
        <div class="spinner"></div>
      </div>

      <!-- Load more indicator -->
      <div v-if="!loading && hasMore" class="load-indicator">
        <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && posts.length === 0" class="empty-state">
        <span class="icon" style="font-size:48px;">inbox</span>
        <p>暂无帖子</p>
      </div>
    </div>

    <!-- FAB -->
    <router-link to="/create" class="fab">
      <span class="icon" style="font-size:28px;">add</span>
    </router-link>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useForumStore } from '../stores/forum'
import { postsApi } from '../api/posts'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const forumStore = useForumStore()

const tabs = ref([])
const activeTab = ref(2)
const FEATURED_TAB = { id: 0, name: '精华', shortname: '精华' }
const posts = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const searchKeyword = ref('')
const sortMode = ref(1) // Default to 1 (Default sort)
const PAGE_SIZE = 10

function onScroll() {
  if (loading.value || !hasMore.value) return
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight
  const clientHeight = document.documentElement.clientHeight
  if (scrollTop + clientHeight >= scrollHeight - 300) {
    loadMore()
  }
}

onMounted(async () => {
  await forumStore.fetchPostTypes()
  buildTabs()
  await loadPosts()
  window.addEventListener('scroll', onScroll, { passive: true })
})

function buildTabs() {
  const types = [...forumStore.postTypes]
  const hasFeatured = types.some(t => t.id === FEATURED_TAB.id)
  const finalTabs = hasFeatured ? types : [FEATURED_TAB, ...types]
  tabs.value = finalTabs
  if (finalTabs.length && !finalTabs.find(t => t.id === activeTab.value)) {
    activeTab.value = FEATURED_TAB.id
  }
}

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

async function loadPosts(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    posts.value = []
    hasMore.value = true
  }
  loading.value = true
  try {
    const isFeatured = activeTab.value === FEATURED_TAB.id
    const res = await postsApi.getPosts({
      type: activeTab.value,
      page: page.value,
      keyword: isFeatured ? '' : (searchKeyword.value || undefined),
      searchMode: isFeatured ? 1 : (searchKeyword.value ? 1 : sortMode.value),
      eTag: isFeatured ? 'recommend' : undefined,
    })
    const newPosts = res.data?.list || []
    posts.value.push(...newPosts)
    hasMore.value = newPosts.length >= PAGE_SIZE
  } catch (e) {
    console.error('加载帖子失败', e)
  } finally {
    loading.value = false
  }
}

function loadMore() {
  page.value++
  loadPosts()
}

function switchTab(tabId) {
  activeTab.value = tabId
  if (tabId === FEATURED_TAB.id) {
    searchKeyword.value = ''
    sortMode.value = 1
  }
  loadPosts(true)
}

function changeSortMode(mode) {
  sortMode.value = mode
  loadPosts(true)
}

function doSearch() {
  loadPosts(true)
}

function clearSearch() {
  searchKeyword.value = ''
  loadPosts(true)
}

function goToPost(id) {
  router.push(`/post/${id}`)
}
</script>

<style scoped>
.home-page {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-lg);
  padding-bottom: calc(var(--bottom-nav-height) + 20px);
}

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin: var(--space-lg) 0 var(--space-md);
  background: var(--bg-input);
  border-radius: var(--radius-full);
}
.search-icon { color: var(--text-hint); font-size: 20px; }
.search-input {
  flex: 1;
  font-size: var(--text-base);
  background: none;
  border: none;
  color: var(--text-primary);
}
.search-input::placeholder { color: var(--text-hint); }

/* Tabs */
.tab-bar-wrapper {
  margin-bottom: var(--space-md);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
}
.tab-bar-wrapper::-webkit-scrollbar { display: none; }
.tab-bar {
  display: flex;
  gap: 4px;
  white-space: nowrap;
  min-width: 100%;
  scroll-snap-type: x mandatory;
}
.tab-item {
  position: relative;
  padding: 10px 16px;
  font-size: var(--text-lg);
  font-weight: 400;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  scroll-snap-align: start;
}
.tab-item:hover { color: var(--text-primary); }
.tab-item.active {
  color: var(--primary);
  font-weight: 700;
  font-size: var(--text-xl);
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}

/* Sort */
.sort-row {
  display: flex;
  gap: 16px;
  margin-bottom: var(--space-md);
  padding-left: 4px;
}
.sort-btn {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 400;
}
.sort-btn.active {
  color: var(--primary);
  font-weight: 600;
}

/* Post list */
.post-list {
  display: flex;
  flex-direction: column;
}

/* Load indicator */
.load-indicator {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* FAB */
.fab {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + 20px);
  right: 24px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
  z-index: 100;
  transition: transform var(--transition-fast);
}
.fab:hover { transform: scale(1.08); }

@media (max-width: 768px) {
  .home-page { padding: 0 var(--space-md); }
}
</style>
