<template>
  <div class="floor-item">
    <div class="floor-header">
      <div class="floor-author">
        <img
          v-if="getAvatarStr(floor) && !imgErr"
          :src="avatarUrl(getAvatarStr(floor))"
          class="avatar-sm avatar-img"
          @error="imgErr = true"
        />
        <div v-else class="avatar-sm" :style="{ background: getAvatarColor(floor.uid || 0) }">{{ getLetterAvatar(floor.nickname) }}</div>
        <div class="author-detail">
          <div class="author-row">
            <span class="author-name">{{ floor.nickname || '匿名用户' }}</span>
            <span v-if="floor.is_owner" class="badge-owner">楼主</span>
          </div>
          <span class="floor-time">{{ formatTime(floor.created_at) }}</span>
        </div>
      </div>
    </div>

    <div v-if="floor.reply_to_name" class="reply-to">
      回复 <span class="reply-name">{{ floor.reply_to_name }}</span>
    </div>

    <div class="floor-content" v-html="renderContent(floor.content)"></div>

    <img
      v-if="floor.image_url"
      :src="imageOriginUrl(floor.image_url)"
      class="floor-image"
      loading="lazy"
      @click.stop="$emit('preview', floor.image_url)"
    />

    <div class="floor-footer">
      <button :class="['action-btn', { active: floor.is_like }]" @click.stop="$emit('like')">
        <span class="icon">{{ floor.is_like ? 'thumb_up' : 'thumb_up_off_alt' }}</span>
        <span v-if="floor.like_count">{{ floor.like_count }}</span>
      </button>
      <button class="action-btn" @click.stop="$emit('reply')">
        <span class="icon">reply</span>
        回复
      </button>
    </div>

    <!-- Sub floors -->
    <div v-if="floor.sub_floors?.length" class="sub-floors">
      <div
        v-for="sub in floor.sub_floors.slice(0, showAllSub ? undefined : 3)"
        :key="sub.id"
        class="sub-floor"
      >
        <span class="sub-author">{{ sub.nickname || '匿名' }}</span>
        <span v-if="sub.reply_to_name" class="sub-reply"> 回复 {{ sub.reply_to_name }}</span>
        <span class="sub-content">：{{ sub.content }}</span>
        <button class="sub-reply-btn" @click.stop="$emit('reply', sub)">回复</button>
      </div>
      <button
        v-if="floor.sub_floors.length > 3 && !showAllSub"
        class="sub-more"
        @click.stop="showAllSub = true"
      >
        查看全部 {{ floor.sub_floor_cnt || floor.sub_floors.length }} 条回复
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { imageOriginUrl, avatarUrl, getAvatarColor } from '../utils/image'

defineProps({ floor: { type: Object, required: true } })
defineEmits(['reply', 'like', 'preview'])

const showAllSub = ref(false)
const imgErr = ref(false)

function getAvatarStr(floor) {
  if (!floor) return ''
  // Floor object usually has avatar at top level
  if (floor.avatar && floor.avatar !== '') return floor.avatar
  if (floor.user_info?.avatar) return floor.user_info.avatar
  return ''
}

function getLetterAvatar(nickname) {
  const name = nickname || '匿'
  const cleaned = name.replace(/[\d\*\s]/g, '').replace(/[^\u4e00-\u9fa5]/g, '')
  return cleaned ? cleaned[0] : name[0]
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
</script>

<style scoped>
.floor-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--divider);
}

.floor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.floor-author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #B39DDB, #7E57C2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
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
.author-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.author-name {
  font-size: var(--text-sm);
  font-weight: 600;
}
.badge-owner {
  font-size: 10px;
  background: var(--primary-bg);
  color: var(--primary);
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-weight: 500;
}
.floor-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.reply-to {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: 4px;
  padding-left: 42px;
}
.reply-name { color: var(--primary); }

.floor-content {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 8px;
  padding-left: 42px;
  word-break: break-word;
}

.floor-image {
  max-width: 200px;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  margin-left: 42px;
  cursor: pointer;
}

.floor-footer {
  display: flex;
  gap: 4px;
  padding-left: 42px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.action-btn:hover {
  background: var(--bg-hover);
  color: var(--text-secondary);
}
.action-btn.active { color: var(--primary); }
.action-btn .icon { font-size: 16px; }

/* Sub floors */
.sub-floors {
  margin-top: 10px;
  margin-left: 42px;
  padding: 10px 12px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}
.sub-floor {
  font-size: var(--text-xs);
  line-height: 1.8;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.sub-author {
  font-weight: 600;
  color: var(--primary);
}
.sub-reply { color: var(--text-tertiary); }
.sub-content { color: var(--text-primary); }
.sub-more {
  display: block;
  margin-top: 6px;
  font-size: var(--text-xs);
  color: var(--primary);
  background: none;
  border: none;
  cursor: pointer;
}
.sub-more:hover { text-decoration: underline; }
.sub-reply-btn {
  border: none;
  background: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 11px;
  padding: 0 4px;
}
.sub-reply-btn:hover { text-decoration: underline; }
</style>
