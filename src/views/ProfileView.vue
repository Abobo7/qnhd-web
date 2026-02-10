<template>
  <div class="profile-page page-container">
    <div class="content-container">
      <!-- User info -->
      <div class="profile-card card-glass">
        <div class="profile-header">
          <div class="profile-avatar">{{ (userInfo?.nickname || '?')[0] }}</div>
          <div class="profile-info">
            <h2 class="profile-name">{{ userInfo?.nickname || '加载中...' }}</h2>
            <span class="profile-level badge">Lv.{{ userInfo?.level_info?.level || 0 }} {{ userInfo?.level_info?.level_name || '' }}</span>
          </div>
          <button class="btn btn-secondary" @click="handleLogout">退出登录</button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button
          v-for="tab in profileTabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          <span class="icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Post list -->
      <div class="post-list">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
          @click="$router.push(`/post/${post.id}`)"
        />

        <div v-if="loading" class="load-more"><div class="spinner"></div></div>

        <button v-if="!loading && hasMore" class="btn btn-secondary" style="width:100%;" @click="loadMore">
          加载更多
        </button>

        <div v-if="!loading && posts.length === 0" class="empty-state" style="padding:60px 0;">
          <span class="icon" style="font-size:48px;color:var(--text-tertiary);">
            {{ activeTab === 'my' ? 'article' : activeTab === 'fav' ? 'bookmark' : 'history' }}
          </span>
          <p style="color:var(--text-tertiary);">暂无内容</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { postsApi } from '../api/posts'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')

const userInfo = ref(null)
const activeTab = ref('my')
const posts = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

const profileTabs = [
  { key: 'my', label: '我的帖子', icon: 'article' },
  { key: 'fav', label: '我的收藏', icon: 'bookmark' },
  { key: 'history', label: '浏览历史', icon: 'history' },
]

onMounted(async () => {
  await authStore.fetchUserInfo()
  userInfo.value = authStore.userInfo
  await loadPosts(true)
})

async function loadPosts(reset = false) {
  if (loading.value) return
  if (reset) { page.value = 1; posts.value = []; hasMore.value = true; }
  loading.value = true
  try {
    let res
    if (activeTab.value === 'my') {
      res = await postsApi.getMyPosts(page.value)
    } else if (activeTab.value === 'fav') {
      res = await postsApi.getFavoritePosts(page.value)
    } else {
      res = await postsApi.getHistoryPosts(page.value)
    }
    const list = res.data?.list || []
    posts.value.push(...list)
    hasMore.value = list.length >= 10
  } catch (e) {
    toast?.('加载失败', 'error')
  } finally {
    loading.value = false
  }
}

function switchTab(key) {
  activeTab.value = key
  loadPosts(true)
}

function loadMore() {
  page.value++
  loadPosts()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-card { padding: 24px; margin-bottom: 20px; }
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-xl);
  font-weight: 700;
  flex-shrink: 0;
}
.profile-info { flex: 1; }
.profile-name {
  font-size: var(--text-lg);
  font-weight: 700;
  margin-bottom: 4px;
}
.profile-level {
  font-size: var(--text-xs);
}

.profile-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.tab-item:hover { color: var(--text-primary); background: var(--bg-input); }
.tab-item.active {
  color: white;
  background: var(--accent-gradient);
  box-shadow: var(--shadow-glow);
}
.tab-item .icon { font-size: 18px; }

.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
