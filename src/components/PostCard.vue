<template>
  <article class="post-card" @click="$emit('click')">
    <!-- Header: avatar + name + level + time ... post ID -->
    <div class="post-card-header">
      <div class="post-card-author">
        <img
          v-if="getAvatarStr(post) && !imgErr"
          :src="avatarUrl(getAvatarStr(post))"
          class="avatar-circle avatar-img"
          @error="imgErr = true"
        />
        <div v-else class="avatar-circle" :style="{ background: getAvatarColor(post.uid || 0) }">{{ getLetterAvatar(post.nickname) }}</div>
        <div class="author-detail">
          <div class="author-top-row">
            <span class="author-name">{{ post.nickname || '匿名用户' }}</span>
            <span v-if="post.user_info?.level" class="badge-level">LV{{ post.user_info.level }}</span>
          </div>
          <span class="post-time">{{ formatDateTime(post.created_at) }}</span>
        </div>
      </div>
      <span class="post-id">#MP{{ post.id }}</span>
    </div>

    <!-- Title with optional pinned badge -->
    <div class="post-card-title-row">
      <span v-if="isPinned(post)" class="badge-pin">置顶</span>
      <span v-if="post.tag" class="badge tag-badge">{{ post.tag.name }}</span>
      <h3 class="post-card-title">{{ post.title }}</h3>
    </div>

    <!-- Content -->
    <p class="post-card-content">{{ truncateContent(post.content) }}</p>

    <!-- Images -->
    <div v-if="post.image_urls?.length" class="post-card-images">
      <img
        v-for="(url, i) in post.image_urls.slice(0, 3)"
        :key="i"
        :src="imageThumbUrl(url)"
        class="thumb-image"
        loading="lazy"
      />
    </div>

    <!-- Footer stats -->
    <div class="post-card-footer">
      <div class="stats-left">
        <span class="stat">
          <span class="icon">chat_bubble_outline</span>
          {{ post.comment_count || 0 }}
        </span>
        <span class="stat">
          <span class="icon">thumb_up_off_alt</span>
          {{ post.like_count || 0 }}
        </span>
        <span class="stat">
          <span class="icon">thumb_down_off_alt</span>
          {{ post.dis_count || 0 }}
        </span>
      </div>
      <span class="stat visit-stat">{{ post.visit_count || 0 }}次浏览</span>
    </div>

    <!-- Divider -->
    <div class="card-divider"></div>
  </article>
</template>

<script setup>
import { ref } from 'vue'
import { imageThumbUrl, avatarUrl, getAvatarColor } from '../utils/image'

defineProps({ post: { type: Object, required: true } })
defineEmits(['click'])

const imgErr = ref(false)

function getAvatarStr(post) {
  if (!post || post.type === 1) return ''
  const ui = post.user_info
  if (ui && ui.avatar && ui.avatar !== '') return ui.avatar
  if (post.avatar && post.avatar !== '') return post.avatar
  return ''
}

function getLetterAvatar(nickname) {
  const name = nickname || '匿'
  const cleaned = name.replace(/[\d\*\s]/g, '').replace(/[^\u4e00-\u9fa5]/g, '')
  return cleaned ? cleaned[0] : name[0]
}

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const sec = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${sec}`
}

function truncateContent(text) {
  if (!text) return ''
  return text.length > 150 ? text.slice(0, 150) + '...' : text
}

function isPinned(post) {
  // Backend typically uses e_tag === 'top' or is_top flag
  if (!post) return false
  if (post.is_top) return true
  return post.e_tag === 'top' || post.eTag === 'top'
}
</script>

<style scoped>
.post-card {
  cursor: pointer;
  padding: 16px 4px;
  transition: background var(--transition-fast);
}
.post-card:hover {
  background: var(--bg-hover);
  border-radius: var(--radius-md);
}

/* Header */
.post-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}
.post-card-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #90CAF9, #42A5F5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.avatar-img {
  object-fit: cover;
}
.author-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.author-top-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.author-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}
.post-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.post-id {
  font-size: var(--text-xs);
  color: var(--text-hint);
  font-weight: 500;
}

/* Title */
.post-card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.post-card-title {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.4;
}
.tag-badge {
  font-size: 11px;
  padding: 1px 6px;
}

/* Content */
.post-card-content {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 10px;
  word-break: break-word;
}

/* Images */
.post-card-images {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.thumb-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

/* Footer */
.post-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.stats-left {
  display: flex;
  gap: 16px;
}
.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.stat .icon { font-size: 16px; }
.visit-stat {
  font-size: var(--text-xs);
  color: var(--text-hint);
}

/* Divider */
.card-divider {
  height: 1px;
  background: var(--divider);
}

@media (max-width: 768px) {
  .thumb-image {
    width: 64px;
    height: 64px;
  }
}
</style>
