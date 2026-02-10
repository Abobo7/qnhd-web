<template>
  <div class="home-page page-container">
    <div class="home-layout">
      <!-- Main content -->
      <main class="home-main">
        <!-- Search bar -->
        <div class="search-bar card-glass">
          <span class="icon search-icon">search</span>
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索帖子..."
            @keydown.enter="doSearch"
          />
          <button v-if="searchKeyword" class="btn-icon" @click="clearSearch">
            <span class="icon">close</span>
          </button>
        </div>

        <!-- Tab bar -->
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

        <!-- Post list -->
        <div class="post-list">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @click="goToPost(post.id)"
          />

          <!-- Loading skeleton -->
          <template v-if="loading">
            <div v-for="i in 3" :key="'sk'+i" class="card post-skeleton">
              <div class="skeleton" style="width: 60%; height: 20px; margin-bottom: 12px;"></div>
              <div class="skeleton" style="width: 100%; height: 14px; margin-bottom: 8px;"></div>
              <div class="skeleton" style="width: 80%; height: 14px;"></div>
            </div>
          </template>

          <!-- Load more -->
          <div v-if="!loading && hasMore" class="load-more">
            <div class="spinner"></div>
          </div>

          <!-- Empty state -->
          <div v-if="!loading && posts.length === 0" class="empty-state">
            <span class="icon" style="font-size: 48px; color: var(--text-tertiary);">inbox</span>
            <p>暂无帖子</p>
          </div>
        </div>
      </main>

      <!-- Sidebar (desktop only) -->
      <aside class="home-sidebar">
        <!-- Hot tags -->
        <div class="sidebar-section card">
          <h3 class="sidebar-title">
            <span class="icon">local_fire_department</span>
            热门标签
          </h3>
          <div class="tag-list">
            <button
              v-for="tag in hotTags"
              :key="tag.id"
              class="badge tag-badge"
              @click="searchByTag(tag)"
            >
              # {{ tag.name }}
            </button>
          </div>
        </div>

        <!-- Quick create -->
        <router-link to="/create" class="btn btn-primary create-btn">
          <span class="icon">edit</span>
          发布新帖
        </router-link>
      </aside>
    </div>

    <!-- FAB (mobile) -->
    <router-link to="/create" class="fab">
      <span class="icon">add</span>
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
const posts = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const searchKeyword = ref('')
const hotTags = ref([])
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
  tabs.value = forumStore.postTypes
  if (tabs.value.length && !tabs.value.find(t => t.id === activeTab.value)) {
    activeTab.value = tabs.value[0].id
  }
  await forumStore.fetchHotTags()
  hotTags.value = forumStore.hotTags
  await loadPosts()
  // Add scroll listener AFTER first load to prevent premature trigger
  window.addEventListener('scroll', onScroll, { passive: true })
})

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
    const res = await postsApi.getPosts({
      type: activeTab.value,
      page: page.value,
      keyword: searchKeyword.value || undefined,
      searchMode: searchKeyword.value ? 1 : undefined
    })
    const newPosts = res.data?.list || []
    posts.value.push(...newPosts)
    // API total is per-page — use list length to determine if more pages exist
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
  loadPosts(true)
}

function doSearch() {
  loadPosts(true)
}

function clearSearch() {
  searchKeyword.value = ''
  loadPosts(true)
}

function searchByTag(tag) {
  searchKeyword.value = tag.name
  loadPosts(true)
}

function goToPost(id) {
  router.push(`/post/${id}`)
}
</script>

<style scoped>
.home-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  align-items: start;
}

.home-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}
.search-icon { color: var(--text-tertiary); }
.search-input {
  flex: 1;
  font-size: var(--text-base);
  background: none;
  border: none;
  color: var(--text-primary);
}
.search-input::placeholder { color: var(--text-tertiary); }

/* Tabs */
.tab-bar {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
}
.tab-bar::-webkit-scrollbar { display: none; }
.tab-item {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  transition: all var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
}
.tab-item:hover { color: var(--text-primary); background: var(--bg-input); }
.tab-item.active {
  color: white;
  background: var(--accent-gradient);
  box-shadow: var(--shadow-glow);
}

/* Post list */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-skeleton { min-height: 100px; }

/* Load more */
.load-more {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: var(--text-tertiary);
}

/* Sidebar */
.home-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar-section { padding: 20px; }
.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
}
.sidebar-title .icon { font-size: 18px; color: var(--accent-danger); }
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-badge {
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}
.tag-badge:hover {
  background: rgba(108, 92, 231, 0.25);
  transform: translateY(-1px);
}

.create-btn {
  width: 100%;
  padding: 14px;
  font-size: var(--text-base);
}

/* FAB */
.fab {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  z-index: 100;
  transition: transform var(--transition-fast);
}
.fab:hover { transform: scale(1.1); }
.fab .icon { font-size: 28px; }

@media (max-width: 900px) {
  .home-layout {
    grid-template-columns: 1fr;
  }
  .home-sidebar { display: none; }
  .fab { display: flex; }
}
</style>
