<template>
  <div class="detail-page page-container">
    <div class="content-container">
      <!-- Back button -->
      <button class="btn btn-ghost back-btn" @click="$router.back()">
        <span class="icon">arrow_back</span>
        返回
      </button>

      <!-- Post content -->
      <article v-if="post" class="post-detail card">
        <div class="post-header">
          <div class="post-author">
            <div class="avatar">{{ (post.nickname || '匿名')[0] }}</div>
            <div class="author-info">
              <span class="author-name">{{ post.nickname || '匿名用户' }}</span>
              <span class="post-time">{{ formatTime(post.created_at) }}</span>
            </div>
          </div>
          <div v-if="post.tag" class="badge">{{ post.tag.name }}</div>
        </div>

        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-content" v-html="renderContent(post.content)"></div>

        <!-- Images -->
        <div v-if="post.image_urls?.length" class="post-images">
          <img
            v-for="(url, i) in post.image_urls"
            :key="i"
            :src="imageOriginUrl(url)"
            :alt="'图片 ' + (i+1)"
            class="post-image"
            @click="previewImage(url)"
          />
        </div>

        <!-- Actions -->
        <div class="post-actions">
          <button :class="['action-btn', { active: post.is_like }]" @click="toggleLike">
            <span class="icon">{{ post.is_like ? 'thumb_up' : 'thumb_up_off_alt' }}</span>
            <span>{{ post.like_count || '' }}</span>
          </button>
          <button :class="['action-btn', { active: post.is_fav }]" @click="toggleFavorite">
            <span class="icon">{{ post.is_fav ? 'bookmark' : 'bookmark_border' }}</span>
            <span>{{ post.fav_count || '' }}</span>
          </button>
          <span class="action-btn" style="cursor:default;">
            <span class="icon">visibility</span>
            <span>{{ post.visit_count || 0 }}</span>
          </span>
          <span class="action-btn" style="cursor:default;">
            <span class="icon">chat_bubble_outline</span>
            <span>{{ post.comment_count || 0 }}</span>
          </span>
        </div>
      </article>

      <!-- Loading skeleton -->
      <div v-else-if="loadingPost" class="card post-skeleton-detail">
        <div class="skeleton" style="width:40%;height:18px;margin-bottom:16px;"></div>
        <div class="skeleton" style="width:70%;height:24px;margin-bottom:12px;"></div>
        <div class="skeleton" style="width:100%;height:80px;"></div>
      </div>

      <!-- Comments section -->
      <section class="comments-section">
        <div class="comments-header">
          <h2 class="comments-title">
            评论 <span v-if="totalComments">({{ totalComments }})</span>
          </h2>
          <div class="comments-sort">
            <button
              :class="['btn btn-ghost', { active: sortOrder === 0 }]"
              @click="changeSortOrder(0)"
            >最新</button>
            <button
              :class="['btn btn-ghost', { active: sortOrder === 1 }]"
              @click="changeSortOrder(1)"
            >最热</button>
          </div>
        </div>

        <!-- Comment list -->
        <div class="comment-list">
          <FloorItem
            v-for="floor in floors"
            :key="floor.id"
            :floor="floor"
            @reply="openReply(floor)"
            @like="toggleFloorLike(floor)"
          />

          <div v-if="loadingFloors" class="load-more"><div class="spinner"></div></div>

          <button
            v-if="!loadingFloors && hasMoreFloors"
            class="btn btn-secondary load-more-btn"
            @click="loadMoreFloors"
          >
            加载更多评论
          </button>

          <div v-if="!loadingFloors && floors.length === 0" class="empty-state" style="padding:40px 0;">
            <span class="icon" style="font-size:36px;color:var(--text-tertiary);">chat</span>
            <p style="color:var(--text-tertiary);">暂无评论，快来抢沙发！</p>
          </div>
        </div>
      </section>

      <!-- Comment input -->
      <div class="comment-input-bar card-glass">
        <div class="comment-input-wrapper">
          <div v-if="replyTo" class="reply-hint">
            回复 {{ replyTo.nickname || '匿名' }}
            <button class="btn-icon" style="width:24px;height:24px;" @click="cancelReply">
              <span class="icon" style="font-size:16px;">close</span>
            </button>
          </div>
          <div class="comment-input-row">
            <textarea
              v-model="commentText"
              class="comment-textarea"
              placeholder="写下你的评论..."
              rows="1"
              @input="autoResize"
              ref="textareaRef"
            ></textarea>
            <button
              class="btn btn-primary send-btn"
              :disabled="!commentText.trim() || sending"
              @click="sendComment"
            >
              <span v-if="sending" class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
              <span v-else class="icon">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image preview overlay -->
    <Teleport to="body">
      <div v-if="previewUrl" class="image-overlay" @click="previewUrl = null">
        <img :src="imageOriginUrl(previewUrl)" class="preview-image" />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { postsApi } from '../api/posts'
import { floorsApi } from '../api/floors'
import { imageOriginUrl } from '../utils/image'
import FloorItem from '../components/FloorItem.vue'

const route = useRoute()
const toast = inject('toast')

const post = ref(null)
const loadingPost = ref(true)
const floors = ref([])
const loadingFloors = ref(false)
const floorPage = ref(1)
const hasMoreFloors = ref(true)
const totalComments = ref(0)
const sortOrder = ref(0)

const commentText = ref('')
const replyTo = ref(null)
const sending = ref(false)
const textareaRef = ref(null)
const previewUrl = ref(null)

const postId = parseInt(route.params.id)

onMounted(async () => {
  await loadPost()
  await loadFloors(true)
  postsApi.visitPost(postId).catch(() => {})
})

async function loadPost() {
  loadingPost.value = true
  try {
    const res = await postsApi.getPostById(postId)
    post.value = res.data?.post || null
  } catch (e) {
    toast?.('加载帖子失败', 'error')
  } finally {
    loadingPost.value = false
  }
}

async function loadFloors(reset = false) {
  if (loadingFloors.value) return
  if (reset) {
    floorPage.value = 1
    floors.value = []
    hasMoreFloors.value = true
  }
  loadingFloors.value = true
  try {
    const res = await floorsApi.getFloors({
      postId,
      page: floorPage.value,
      order: sortOrder.value,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0
    floors.value.push(...list)
    totalComments.value = total
    hasMoreFloors.value = floors.value.length < total
  } catch (e) {
    toast?.('加载评论失败', 'error')
  } finally {
    loadingFloors.value = false
  }
}

function loadMoreFloors() {
  floorPage.value++
  loadFloors()
}

function changeSortOrder(order) {
  sortOrder.value = order
  loadFloors(true)
}

async function toggleLike() {
  if (!post.value) return
  try {
    await postsApi.likePost(postId, post.value.is_like)
    post.value.is_like = !post.value.is_like
    post.value.like_count += post.value.is_like ? 1 : -1
  } catch (e) {
    toast?.('操作失败', 'error')
  }
}

async function toggleFavorite() {
  if (!post.value) return
  try {
    await postsApi.favoritePost(postId, post.value.is_fav)
    post.value.is_fav = !post.value.is_fav
    post.value.fav_count += post.value.is_fav ? 1 : -1
  } catch (e) {
    toast?.('操作失败', 'error')
  }
}

async function toggleFloorLike(floor) {
  try {
    await floorsApi.likeFloor(floor.id, floor.is_like)
    floor.is_like = !floor.is_like
    floor.like_count += floor.is_like ? 1 : -1
  } catch (e) {
    toast?.('操作失败', 'error')
  }
}

function openReply(floor) {
  replyTo.value = floor
  nextTick(() => textareaRef.value?.focus())
}

function cancelReply() {
  replyTo.value = null
}

async function sendComment() {
  if (!commentText.value.trim() || sending.value) return
  sending.value = true
  try {
    if (replyTo.value) {
      await floorsApi.replyFloor(replyTo.value.id, commentText.value.trim())
    } else {
      await floorsApi.sendFloor(postId, commentText.value.trim())
    }
    commentText.value = ''
    replyTo.value = null
    toast?.('发送成功！', 'success')
    await loadFloors(true)
    if (post.value) post.value.comment_count++
  } catch (e) {
    toast?.(e.message || '发送失败', 'error')
  } finally {
    sending.value = false
  }
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
  if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
  if (diff < 604800) return Math.floor(diff / 86400) + '天前'
  return d.toLocaleDateString('zh-CN')
}

function renderContent(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

function previewImage(url) {
  previewUrl.value = url
}
</script>

<style scoped>
.back-btn {
  margin-bottom: 12px;
}

/* Post detail */
.post-detail {
  padding: 24px;
}
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.post-author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-sm);
  font-weight: 600;
}
.author-info {
  display: flex;
  flex-direction: column;
}
.author-name {
  font-weight: 600;
  font-size: var(--text-sm);
}
.post-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.4;
}
.post-content {
  font-size: var(--text-base);
  line-height: 1.75;
  color: var(--text-secondary);
  margin-bottom: 16px;
  word-break: break-word;
}
.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}
.post-image {
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform var(--transition-fast);
  aspect-ratio: 1;
  object-fit: cover;
  width: 100%;
}
.post-image:hover { transform: scale(1.02); }

/* Actions */
.post-actions {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-btn:hover {
  background: var(--bg-input);
  color: var(--text-primary);
}
.action-btn.active {
  color: var(--accent-primary);
  background: rgba(108, 92, 231, 0.1);
}

/* Comments */
.comments-section {
  margin-top: 24px;
}
.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.comments-title {
  font-size: var(--text-lg);
  font-weight: 600;
}
.comments-sort {
  display: flex;
  gap: 4px;
}
.comments-sort .btn.active {
  color: var(--accent-primary);
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 100px;
}
.load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.load-more-btn {
  width: 100%;
}

/* Comment input */
.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  z-index: 100;
}
.comment-input-wrapper {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
.reply-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  color: var(--accent-primary);
  margin-bottom: 8px;
}
.comment-input-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.comment-textarea {
  flex: 1;
  padding: 10px 16px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.5;
  resize: none;
  overflow: hidden;
  min-height: 40px;
  max-height: 120px;
  transition: border-color var(--transition-fast);
}
.comment-textarea:focus {
  border-color: var(--accent-primary);
}
.comment-textarea::placeholder {
  color: var(--text-tertiary);
}
.send-btn {
  padding: 10px 16px;
  height: 42px;
  flex-shrink: 0;
}

/* Image overlay */
.image-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  cursor: pointer;
}
.preview-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: var(--radius-md);
}

.post-skeleton-detail {
  min-height: 200px;
  padding: 24px;
}

@media (max-width: 768px) {
  .post-detail { padding: 16px; }
  .post-title { font-size: var(--text-lg); }
  .post-images {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  .post-actions { flex-wrap: wrap; }
}
</style>
