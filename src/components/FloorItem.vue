<template>
  <div class="floor-item card">
    <div class="floor-header">
      <div class="floor-author">
        <div class="avatar-sm">{{ (floor.nickname || '匿')[0] }}</div>
        <span class="author-name">{{ floor.nickname || '匿名用户' }}</span>
        <span v-if="floor.is_owner" class="owner-badge">楼主</span>
      </div>
      <span class="floor-time">{{ formatTime(floor.created_at) }}</span>
    </div>

    <div v-if="floor.reply_to_name" class="reply-to">
      回复 <span class="reply-name">{{ floor.reply_to_name }}</span>
    </div>

    <div class="floor-content" v-html="renderContent(floor.content)"></div>

    <img v-if="floor.image_url" :src="imageOriginUrl(floor.image_url)" class="floor-image" loading="lazy" />

    <div class="floor-footer">
      <button :class="['action-sm', { active: floor.is_like }]" @click.stop="$emit('like')">
        <span class="icon">{{ floor.is_like ? 'thumb_up' : 'thumb_up_off_alt' }}</span>
        <span v-if="floor.like_count">{{ floor.like_count }}</span>
      </button>
      <button class="action-sm" @click.stop="$emit('reply')">
        <span class="icon">reply</span>
        回复
      </button>
    </div>

    <!-- Sub floors -->
    <div v-if="floor.sub_floors?.length" class="sub-floors">
      <div v-for="sub in floor.sub_floors.slice(0, showAllSub ? undefined : 3)" :key="sub.id" class="sub-floor">
        <span class="sub-author">{{ sub.nickname || '匿名' }}</span>
        <span v-if="sub.reply_to_name" class="sub-reply"> 回复 {{ sub.reply_to_name }}</span>
        <span class="sub-content">：{{ sub.content }}</span>
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
import { imageOriginUrl } from '../utils/image'

defineProps({ floor: { type: Object, required: true } })
defineEmits(['reply', 'like'])

const showAllSub = ref(false)

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
  padding: 16px 20px;
}

.floor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.floor-author {
  display: flex;
  align-items: center;
  gap: 8px;
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
}
.author-name {
  font-size: var(--text-sm);
  font-weight: 500;
}
.owner-badge {
  font-size: var(--text-xs);
  background: rgba(108, 92, 231, 0.15);
  color: var(--accent-primary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.floor-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.reply-to {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-bottom: 6px;
}
.reply-name { color: var(--accent-primary); }

.floor-content {
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--text-primary);
  margin-bottom: 10px;
  word-break: break-word;
}

.floor-image {
  max-width: 200px;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.floor-footer {
  display: flex;
  gap: 8px;
}
.action-sm {
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
.action-sm:hover {
  background: var(--bg-input);
  color: var(--text-secondary);
}
.action-sm.active { color: var(--accent-primary); }
.action-sm .icon { font-size: 16px; }

/* Sub floors */
.sub-floors {
  margin-top: 12px;
  padding: 12px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}
.sub-floor {
  font-size: var(--text-xs);
  line-height: 1.8;
  color: var(--text-secondary);
}
.sub-author {
  font-weight: 600;
  color: var(--accent-primary);
}
.sub-reply { color: var(--text-tertiary); }
.sub-content { color: var(--text-primary); }
.sub-more {
  display: block;
  margin-top: 8px;
  font-size: var(--text-xs);
  color: var(--accent-primary);
  background: none;
  border: none;
  cursor: pointer;
}
.sub-more:hover { text-decoration: underline; }
</style>
