<template>
  <div class="profile-page page-container">
    <!-- User info card -->
    <div class="user-card card">
      <div class="user-info-row">
        <img
          v-if="userAvatar && !userAvatarError"
          :src="userAvatar"
          class="avatar-lg avatar-img"
          @error="userAvatarError = true"
        />
        <div v-else class="avatar-lg" :style="{ background: userAvatarBg }">{{ userAvatarLetter }}</div>
        <div class="user-detail">
          <h2 class="username">{{ userInfo?.nickname || '用户' }}</h2>
          <div v-if="userInfo?.level_info" class="level-info">
            <span class="badge-level" style="font-size:11px;padding:2px 6px;">
              LV{{ userInfo.level_info.level }}
            </span>
            <span class="level-name">{{ userInfo.level_info.level_name }}</span>
          </div>
        </div>
      </div>

      <!-- Level progress -->
      <div v-if="userInfo?.level_info" class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: levelPercent + '%' }"
        ></div>
      </div>
      <p v-if="userInfo?.level_info" class="progress-text">
        {{ userInfo.level_point || 0 }} / {{ userInfo.level_info.next_level_point || 100 }} 经验
      </p>
    </div>

    <!-- Tabs -->
    <div class="profile-tabs">
      <button
        :class="['tab-btn', { active: activeTab === 'posts' }]"
        @click="activeTab = 'posts'; loadTabData()"
      >我的帖子</button>
      <button
        :class="['tab-btn', { active: activeTab === 'favs' }]"
        @click="activeTab = 'favs'; loadTabData()"
      >收藏</button>
      <button
        :class="['tab-btn', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'; loadTabData()"
      >浏览历史</button>
    </div>

    <!-- Tab content -->
    <div class="tab-content">
      <PostCard
        v-for="post in tabPosts"
        :key="post.id"
        :post="post"
        @click="$router.push('/post/' + post.id)"
      />

      <div v-if="tabLoading" class="load-indicator"><div class="spinner"></div></div>

      <div v-if="!tabLoading && tabPosts.length === 0" class="empty-state">
        <span class="icon" style="font-size:40px;">folder_open</span>
        <p>暂无内容</p>
      </div>
    </div>

    <!-- Logout button -->
    <button class="btn logout-btn" @click="logout">
      <span class="icon">logout</span>
      退出登录
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { postsApi } from '../api/posts'
import { avatarUrl, getAvatarColor } from '../utils/image'
import PostCard from '../components/PostCard.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('posts')
const tabPosts = ref([])
const tabLoading = ref(false)

const userInfo = computed(() => authStore.userInfo)

const levelPercent = computed(() => {
  const info = userInfo.value?.level_info
  if (!info) return 0
  const cur = userInfo.value.level_point - (info.cur_level_point || 0)
  const range = (info.next_level_point || 100) - (info.cur_level_point || 0)
  return range > 0 ? Math.min((cur / range) * 100, 100) : 0
})

const userAvatarError = ref(false)

const userAvatar = computed(() => {
  if (userAvatarError.value) return ''
  const av = userInfo.value?.avatar
  if (!av || av === '') return ''
  return avatarUrl(av)
})

const userAvatarBg = computed(() => getAvatarColor(userInfo.value?.uid || 0))

const userAvatarLetter = computed(() => {
  const name = userInfo.value?.nickname || '我'
  const cleaned = name.replace(/[\d\*\s]/g, '').replace(/[^\u4e00-\u9fa5]/g, '')
  return cleaned ? cleaned[0] : name[0]
})

onMounted(() => {
  if (!authStore.userInfo) {
    authStore.fetchUserInfo()
  }
  loadTabData()
})

async function loadTabData() {
  tabPosts.value = []
  tabLoading.value = true
  try {
    let res
    if (activeTab.value === 'posts') {
      res = await postsApi.getMyPosts({ page: 1 })
    } else if (activeTab.value === 'favs') {
      res = await postsApi.getFavoritePosts(1)
    } else {
      res = await postsApi.getHistoryPosts(1)
    }
    tabPosts.value = res.data?.list || []
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    tabLoading.value = false
  }
}

function logout() {
  authStore.logout()
  router.replace('/login')
}
</script>

<style scoped>
/* User card */
.user-card {
  padding: 24px;
  margin-bottom: 20px;
}
.user-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #90CAF9, #42A5F5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
  font-weight: 600;
  flex-shrink: 0;
}
.avatar-img {
  object-fit: cover;
}
.user-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.username {
  font-size: var(--text-xl);
  font-weight: 700;
}
.level-info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.level-name {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* Progress bar */
.progress-bar {
  height: 6px;
  background: var(--bg-input);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  border-radius: 3px;
  transition: width 0.5s ease;
}
.progress-text {
  font-size: var(--text-xs);
  color: var(--text-hint);
  text-align: right;
}

/* Profile tabs */
.profile-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--divider);
}
.tab-btn {
  padding: 10px 20px;
  font-size: var(--text-base);
  color: var(--text-tertiary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all var(--transition-fast);
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* Tab content */
.tab-content {
  margin-bottom: 24px;
}

.load-indicator {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* Logout */
.logout-btn {
  width: 100%;
  padding: 12px;
  color: #E53935;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
}
.logout-btn:hover {
  background: rgba(229, 57, 53, 0.05);
  border-color: #E53935;
}
</style>
