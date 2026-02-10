<template>
  <div class="detail-page page-container">
    <!-- Back button -->
    <button class="back-btn" @click="$router.back()">
      <span class="icon">arrow_back</span>
      返回
    </button>

    <!-- Post content -->
    <article v-if="post" class="post-detail card">
      <div class="post-header">
        <div class="post-author">
          <img
            v-if="getPostAvatar(post) && !postAvatarError"
            :src="getPostAvatar(post)"
            class="avatar-circle avatar-img"
            @error="postAvatarError = true"
          />
          <div v-else class="avatar-circle" :style="{ background: getPostAvatarColor(post) }">{{ getPostLetterAvatar(post) }}</div>
          <div class="author-detail">
            <div class="author-row">
              <span class="author-name">{{ post.nickname || '匿名用户' }}</span>
              <span v-if="post.user_info?.level" class="badge-level">LV{{ post.user_info.level }}</span>
            </div>
            <span class="post-time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>
        <span class="post-id">#MP{{ post.id }}</span>
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
        <button
          v-if="canDelete"
          class="action-btn"
          :disabled="deleting"
          @click="deletePost"
        >
          <span class="icon">delete</span>
          <span>{{ deleting ? '删除中...' : '删除' }}</span>
        </button>
      </div>
    </article>

    <!-- Official replies -->
    <section v-if="loadingOfficial || officialReplies.length" class="official-section card">
      <div class="official-header">
        <h3 class="official-title">校务回复</h3>
      </div>
      <div v-if="loadingOfficial" class="load-indicator"><div class="spinner"></div></div>
      <div v-else>
        <div
          v-for="reply in officialReplies"
          :key="reply.id || reply.created_at"
          class="official-item"
        >
          <div class="official-meta">
            <span class="official-name">{{ getOfficialName(reply) }}</span>
            <span class="official-time">{{ formatTime(reply.created_at) }}</span>
          </div>
          <div class="official-content" v-html="renderContent(reply.content)"></div>
          <div v-if="reply.image_url" class="official-images">
            <img
              :src="imageOriginUrl(reply.image_url)"
              class="official-image"
              @click="previewImage(reply.image_url)"
            />
          </div>
        </div>
        <div v-if="!officialReplies.length" class="empty-state" style="padding:12px 0;">
          <span class="icon" style="font-size:24px;color:var(--text-hint);">info</span>
          <p style="color:var(--text-tertiary);">暂无校务回复</p>
        </div>
      </div>
    </section>

    <!-- Loading skeleton -->
    <div v-else-if="loadingPost" class="card" style="min-height:200px;padding:24px;">
      <div class="skeleton" style="width:40%;height:18px;margin-bottom:16px;"></div>
      <div class="skeleton" style="width:70%;height:24px;margin-bottom:12px;"></div>
      <div class="skeleton" style="width:100%;height:80px;"></div>
    </div>

    <!-- Comments section -->
    <section class="comments-section">
      <div class="comments-header">
        <h2 class="comments-title">
          评论 <span v-if="totalComments" style="color:var(--text-tertiary);">({{ totalComments }})</span>
        </h2>
        <div class="comments-sort">
          <button
            :class="['sort-btn', { active: sortOrder === 0 }]"
            @click="changeSortOrder(0)"
          >最新</button>
          <button
            :class="['sort-btn', { active: sortOrder === 1 }]"
            @click="changeSortOrder(1)"
          >最热</button>
        </div>
      </div>

      <div class="comment-list">
        <FloorItem
          v-for="floor in floors"
          :key="floor.id"
          :floor="floor"
          @reply="openReply(floor)"
          @like="toggleFloorLike(floor)"
          @preview="previewImage"
        />

        <div v-if="loadingFloors" class="load-indicator"><div class="spinner"></div></div>

        <div v-if="!loadingFloors && hasMoreFloors" class="load-indicator" style="color:var(--text-tertiary);">
          下拉自动加载更多...
        </div>

        <div v-if="!loadingFloors && floors.length === 0" class="empty-state" style="padding:40px 0;">
          <span class="icon" style="font-size:36px;color:var(--text-hint);">chat</span>
          <p style="color:var(--text-tertiary);">暂无评论，快来抢沙发！</p>
        </div>
      </div>
    </section>

    <!-- Comment input -->
    <div class="comment-input-bar">
      <div class="comment-input-wrapper">
        <div v-if="replyTo" class="reply-hint">
          回复 {{ replyTo.nickname || '匿名' }}
          <button class="btn-icon" style="width:20px;height:20px;" @click="cancelReply">
            <span class="icon" style="font-size:14px;">close</span>
          </button>
        </div>
        <div class="comment-input-row">
          <textarea
            v-model="commentText"
            class="comment-textarea"
            placeholder="写下你的评论..."
            rows="1"
            @input="autoResize"
            @paste="onPasteComment"
            ref="textareaRef"
          ></textarea>
          <label class="btn-icon attach-btn" :class="{ disabled: uploadingImages }">
            <input
              type="file"
              accept="image/*"
              multiple
              style="display:none;"
              :disabled="uploadingImages"
              @change="onSelectCommentImages"
            />
            <span v-if="uploadingImages" class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
            <span v-else class="icon">image</span>
          </label>
          <button
            class="btn btn-primary send-btn"
            :disabled="!commentText.trim() || sending"
            @click="sendComment"
          >
            <span v-if="sending" class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
            <span v-else class="icon">send</span>
          </button>
        </div>
        <div v-if="commentImages.length" class="comment-images">
          <div class="comment-thumb" v-for="(url, idx) in commentImages" :key="url + idx">
            <img :src="imageOriginUrl(url)" alt="已上传图片" />
            <button class="thumb-remove" @click="removeCommentImage(idx)">
              <span class="icon" style="font-size:12px;">close</span>
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
import { ref, computed, onMounted, inject, nextTick, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi } from '../api/posts'
import { floorsApi } from '../api/floors'
import { userApi } from '../api/user'
import { imageOriginUrl, avatarUrl, getAvatarColor } from '../utils/image'
import FloorItem from '../components/FloorItem.vue'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const toast = inject('toast')
const authStore = useAuthStore()

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
const commentImages = ref([])
const uploadingImages = ref(false)
const deleting = ref(false)
const commentScrollHandler = ref(null)
const officialReplies = ref([])
const loadingOfficial = ref(false)

const postId = computed(() => {
  const val = Number(route.params.id)
  return Number.isFinite(val) && val > 0 ? val : 0
})

const canDelete = computed(() => {
  if (!post.value) return false
  // Prefer backend provided flag if present
  if (post.value.is_owner !== undefined) return !!post.value.is_owner
  const userId = authStore.userInfo?.id || authStore.userInfo?.uid
  return userId && post.value.uid === userId
})
const postAvatarError = ref(false)

function getPostAvatar(p) {
  if (!p || p.type === 1) return ''
  const av = p.user_info?.avatar || p.avatar
  if (!av || av === '') return ''
  return avatarUrl(av)
}

function getPostAvatarColor(p) {
  return getAvatarColor(p?.uid || 0)
}

function getPostLetterAvatar(p) {
  const name = p?.nickname || '匿'
  const cleaned = name.replace(/[\d\*\s]/g, '').replace(/[^\u4e00-\u9fa5]/g, '')
  return cleaned ? cleaned[0] : name[0]
}

onMounted(async () => {
  if (!authStore.userInfo) {
    authStore.fetchUserInfo().catch(() => {})
  }
  await initData()
  attachScroll()
})

watch(
  () => route.params.id,
  async () => {
    await initData()
  }
)

onUnmounted(() => {
  detachScroll()
})

async function initData() {
  if (!postId.value) {
    toast?.('帖子不存在', 'error')
    return
  }
  await loadPost()
  await loadOfficialReplies()
  await loadFloors(true)
  postsApi.visitPost(postId.value).catch(() => {})
}

async function loadPost() {
  loadingPost.value = true
  try {
    const res = await postsApi.getPostById(postId.value)
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
      postId: postId.value,
      page: floorPage.value,
      order: sortOrder.value,
    })
    const list = res.data?.list || []
    const total = res.data?.total || 0
    floors.value.push(...list)
    totalComments.value = total
    hasMoreFloors.value = list.length >= 10
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

function attachScroll() {
  const handler = () => {
    if (loadingFloors.value || !hasMoreFloors.value) return
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    if (scrollTop + clientHeight >= scrollHeight - 280) {
      loadMoreFloors()
    }
  }
  commentScrollHandler.value = handler
  window.addEventListener('scroll', handler, { passive: true })
}

function detachScroll() {
  if (commentScrollHandler.value) {
    window.removeEventListener('scroll', commentScrollHandler.value)
    commentScrollHandler.value = null
  }
}

async function loadOfficialReplies() {
  loadingOfficial.value = true
  try {
    const res = await floorsApi.getOfficialReplies(postId.value)
    const list = res.data?.list || res.data?.replys || res.data || []
    // Attach department from post when missing
    officialReplies.value = list.map(r => {
      if (!r.department && post.value?.department) {
        return { ...r, department: post.value.department }
      }
      return r
    })
  } catch (e) {
    console.warn('加载官方回复失败', e)
  } finally {
    loadingOfficial.value = false
  }
}

async function toggleLike() {
  if (!post.value) return
  try {
    await postsApi.likePost(postId.value, post.value.is_like)
    post.value.is_like = !post.value.is_like
    post.value.like_count += post.value.is_like ? 1 : -1
  } catch (e) {
    toast?.('操作失败', 'error')
  }
}

async function toggleFavorite() {
  if (!post.value) return
  try {
    await postsApi.favoritePost(postId.value, post.value.is_fav)
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
      await floorsApi.replyFloor(replyTo.value.id, commentText.value.trim(), commentImages.value)
    } else {
      await floorsApi.sendFloor(postId.value, commentText.value.trim(), commentImages.value)
    }
    commentText.value = ''
    replyTo.value = null
    commentImages.value = []
    toast?.('发送成功！', 'success')
    await loadFloors(true)
    if (post.value) post.value.comment_count++
  } catch (e) {
    toast?.(e.message || '发送失败', 'error')
  } finally {
    sending.value = false
  }
}

async function uploadCommentFiles(files) {
  if (!files.length) return
  uploadingImages.value = true
  try {
    const res = await userApi.uploadImages(files)
    const urls =
      res.data?.urls ||
      res.data?.list ||
      res.data?.images ||
      res.data?.data?.urls ||
      res.data?.data?.list ||
      res.data?.data?.images ||
      []
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('未获取到图片地址')
    }
    commentImages.value.push(...urls)
    toast?.('图片上传成功', 'success')
  } catch (e) {
    toast?.(e.message || '图片上传失败', 'error')
  } finally {
    uploadingImages.value = false
  }
}

async function onSelectCommentImages(event) {
  const files = Array.from(event.target.files || [])
  if (!files.length) return
  await uploadCommentFiles(files)
  event.target.value = ''
}

async function onPasteComment(e) {
  const items = Array.from(e.clipboardData?.items || [])
  const files = items
    .filter(it => it.kind === 'file' && it.type.startsWith('image/'))
    .map(it => it.getAsFile())
    .filter(Boolean)
  if (!files.length) return
  e.preventDefault()
  await uploadCommentFiles(files)
}

function removeCommentImage(idx) {
  commentImages.value.splice(idx, 1)
}

async function deletePost() {
  if (!post.value || deleting.value) return
  const ok = window.confirm('确定要删除这条帖子吗？')
  if (!ok) return
  deleting.value = true
  try {
    await postsApi.deletePost(postId.value)
    toast?.('删除成功', 'success')
    router.replace('/')
  } catch (e) {
    toast?.(e.message || '删除失败', 'error')
  } finally {
    deleting.value = false
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
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}`
}

function renderContent(text) {
  if (!text) return ''
  return text.replace(/\n/g, '<br/>')
}

function previewImage(url) {
  previewUrl.value = url
}

function getOfficialName(reply) {
  // Prefer department name (from reply or post), fallback to nickname, then generic
  return reply?.department?.name || post.value?.department?.name || reply?.nickname || '校务回复'
}
</script>

<style scoped>
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-bottom: 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}
.back-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

/* Post detail */
.post-detail { padding: 20px; }
.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #90CAF9, #42A5F5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 15px;
  font-weight: 600;
}
.avatar-img { object-fit: cover; }
.author-detail { display: flex; flex-direction: column; gap: 2px; }
.author-row { display: flex; align-items: center; gap: 6px; }
.author-name { font-weight: 600; font-size: var(--text-base); }
.post-time { font-size: var(--text-xs); color: var(--text-tertiary); }
.post-id { font-size: var(--text-xs); color: var(--text-hint); }
.post-title {
  font-size: var(--text-xl);
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.4;
}
.post-content {
  font-size: var(--text-base);
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 16px;
  word-break: break-word;
}
.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--divider);
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-btn:hover { background: var(--bg-hover); color: var(--text-secondary); }
.action-btn.active { color: var(--primary); }

/* Comments */
.comments-section { margin-top: 20px; }
.comments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.comments-title {
  font-size: var(--text-lg);
  font-weight: 600;
}
.comments-sort { display: flex; gap: 12px; }
.sort-btn {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
}
.sort-btn.active { color: var(--primary); font-weight: 600; }

.comment-list {
  margin-bottom: 100px;
}

.load-indicator {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.load-more-btn { width: 100%; }

/* Official replies */
.official-section {
  margin: 16px 0;
  padding: 16px;
}
.official-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.official-title {
  font-size: var(--text-md);
  font-weight: 600;
}
.official-item + .official-item {
  border-top: 1px solid var(--divider);
  margin-top: 12px;
  padding-top: 12px;
}
.official-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.official-name {
  font-weight: 600;
  color: var(--primary);
}
.official-content {
  margin-top: 6px;
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--text-secondary);
}
.official-images {
  margin-top: 8px;
}
.official-image {
  max-width: 220px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

/* Comment input */
.comment-input-bar {
  position: fixed;
  bottom: var(--bottom-nav-height);
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  z-index: 100;
}
.comment-input-wrapper {
  max-width: var(--content-max-width);
  margin: 0 auto;
}
.reply-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  color: var(--primary);
  margin-bottom: 6px;
}
.comment-input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.attach-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  display: grid;
  place-items: center;
  border: none;
  background: var(--bg-input);
  cursor: pointer;
  color: var(--text-secondary);
}
.attach-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.comment-textarea {
  flex: 1;
  padding: 8px 14px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: 1.5;
  resize: none;
  overflow: hidden;
  min-height: 38px;
  max-height: 120px;
  transition: border-color var(--transition-fast);
}
.comment-textarea:focus { border-color: var(--primary); }
.comment-textarea::placeholder { color: var(--text-hint); }
.send-btn {
  padding: 8px 14px;
  height: 38px;
  flex-shrink: 0;
}
.comment-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.comment-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
}
.comment-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0,0,0,0.55);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
}

/* Image overlay */
.image-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
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

@media (max-width: 768px) {
  .post-detail { padding: 16px; }
  .post-title { font-size: var(--text-lg); }
  .post-images { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
  .post-actions { flex-wrap: wrap; }
}
</style>
