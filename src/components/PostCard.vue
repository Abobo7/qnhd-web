<template>
  <article class="post-card card" @click="$emit('click')">
    <div class="post-card-header">
      <div class="post-card-author">
        <div class="avatar-sm">{{ (post.nickname || '匿')[0] }}</div>
        <span class="author-name">{{ post.nickname || '匿名用户' }}</span>
        <span class="dot">·</span>
        <span class="post-time">{{ formatTime(post.created_at) }}</span>
      </div>
      <span v-if="post.tag" class="badge">{{ post.tag.name }}</span>
    </div>

    <h3 class="post-card-title">{{ post.title }}</h3>
    <p class="post-card-content">{{ truncateContent(post.content) }}</p>

    <!-- Thumbnail images -->
    <div v-if="post.image_urls?.length" class="post-card-images">
      <img
        v-for="(url, i) in post.image_urls.slice(0, 3)"
        :key="i"
        :src="imageThumbUrl(url)"
        class="thumb-image"
        loading="lazy"
      />
      <div v-if="post.image_urls.length > 3" class="thumb-more">
        +{{ post.image_urls.length - 3 }}
      </div>
    </div>

    <div class="post-card-footer">
      <span class="stat">
        <span class="icon">thumb_up_off_alt</span>
        {{ post.like_count || 0 }}
      </span>
      <span class="stat">
        <span class="icon">chat_bubble_outline</span>
        {{ post.comment_count || 0 }}
      </span>
      <span class="stat">
        <span class="icon">visibility</span>
        {{ post.visit_count || 0 }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { imageThumbUrl } from '../utils/image'

defineProps({ post: { type: Object, required: true } })
defineEmits(['click'])

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

function truncateContent(text) {
  if (!text) return ''
  return text.length > 120 ? text.slice(0, 120) + '...' : text
}
</script>

<style scoped>
.post-card {
  cursor: pointer;
  transition: all var(--transition-normal);
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
  border-color: rgba(108, 92, 231, 0.2);
}

.post-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.post-card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
.avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  flex-shrink: 0;
}
.author-name { font-weight: 500; }
.dot { color: var(--text-tertiary); }
.post-time { color: var(--text-tertiary); font-size: var(--text-xs); }

.post-card-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-content {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-card-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.thumb-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}
.thumb-more {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--text-sm);
  font-weight: 600;
}

.post-card-footer {
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

@media (max-width: 768px) {
  .thumb-image, .thumb-more {
    width: 64px;
    height: 64px;
  }
}
</style>
