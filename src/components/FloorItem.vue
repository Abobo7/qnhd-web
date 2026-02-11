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
      <button class="action-btn" @click.stop="$emit('reply', floor)">
        <span class="icon">reply</span>
        回复
      </button>
      <button v-if="canDelete(floor)" class="action-btn" @click.stop="$emit('delete', floor)">
        <span class="icon">delete</span>
        删除
      </button>
    </div>

    <!-- Sub floors -->
    <div v-if="subReplyTotal > 0" class="sub-floors">
      <div
        v-for="sub in displaySubReplies"
        :key="sub.id"
        class="sub-floor"
      >
        <span class="sub-author">{{ sub.nickname || '匿名' }}</span>
        <span v-if="sub.reply_to_name" class="sub-reply"> 回复 {{ sub.reply_to_name }}</span>
        <span class="sub-content" v-html="renderContent(sub.content)"></span>
        <button class="sub-reply-btn" @click.stop="$emit('reply', sub)">回复</button>
        <button
          v-if="canDelete(sub)"
          class="sub-reply-btn"
          style="color:#E53935;"
          @click.stop="$emit('delete', sub)"
        >删除</button>
      </div>
      <button
        v-if="!showAllSub && canExpandSubReplies"
        class="sub-more"
        @click.stop="expandSubReplies"
      >
        查看全部 {{ subReplyTotal }} 条回复
      </button>
      <button
        v-if="showAllSub && subReplyHasMore && !subReplyLoading"
        class="sub-more"
        @click.stop="loadSubReplies()"
      >
        加载更多回复
      </button>
      <div v-if="showAllSub && subReplyLoading" class="sub-loading">加载中...</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { floorsApi } from '../api/floors'
import { imageOriginUrl } from '../utils/image'
import { getAvatarStr as _getAvatarStr, getLetterAvatar, getAvatarColor, avatarUrl } from '../composables/useAvatar'
import { formatRelativeTime as formatTime, renderContent } from '../composables/useFormat'

const props = defineProps({
  floor: { type: Object, required: true },
  hideAvatar: { type: Boolean, default: false },
  currentUserId: { type: [Number, String], default: null },
})
defineEmits(['reply', 'like', 'preview', 'delete'])

const showAllSub = ref(false)
const imgErr = ref(false)
const subReplyList = ref([])
const subReplyPage = ref(1)
const subReplyHasMore = ref(false)
const subReplyLoading = ref(false)
const subReplyLoaded = ref(false)
const SUB_REPLY_PAGE_SIZE = 10

const subReplyTotal = computed(() => {
  return Number(props.floor?.sub_floor_cnt || props.floor?.sub_floors?.length || 0)
})

const hasReliableSubReplyTotal = computed(() => Number(props.floor?.sub_floor_cnt || 0) > 0)
const localSubReplyCount = computed(() => Number(props.floor?.sub_floors?.length || 0))
const canExpandSubReplies = computed(() => {
  if (subReplyTotal.value > 3 || subReplyTotal.value > localSubReplyCount.value) return true
  return !hasReliableSubReplyTotal.value && localSubReplyCount.value >= 3
})

const displaySubReplies = computed(() => {
  const localReplies = props.floor?.sub_floors || []
  if (!showAllSub.value) return localReplies.slice(0, 3)
  return subReplyLoaded.value ? subReplyList.value : localReplies
})

// Wrap composable to inject hideAvatar prop
function getAvatarStr(floor) {
  return _getAvatarStr(floor, { hideAvatar: props.hideAvatar })
}

function resetSubReplyState() {
  showAllSub.value = false
  subReplyList.value = []
  subReplyPage.value = 1
  subReplyLoading.value = false
  subReplyLoaded.value = false
  const localCount = Number(props.floor?.sub_floors?.length || 0)
  subReplyHasMore.value = hasReliableSubReplyTotal.value
    ? localCount < subReplyTotal.value
    : localCount >= SUB_REPLY_PAGE_SIZE
}

watch(() => props.floor, resetSubReplyState, { immediate: true })

function extractReplyList(res) {
  const data = res?.data || {}
  if (Array.isArray(data.list)) return data.list
  if (Array.isArray(data.replys)) return data.replys
  if (Array.isArray(data.data?.list)) return data.data.list
  if (Array.isArray(data.data?.replys)) return data.data.replys
  if (Array.isArray(data.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

async function expandSubReplies() {
  showAllSub.value = true
  if (subReplyLoaded.value || subReplyLoading.value) return
  await loadSubReplies(true)
}

async function loadSubReplies(reset = false) {
  if (subReplyLoading.value || !props.floor?.id) return
  if (reset) {
    subReplyPage.value = 1
    subReplyList.value = []
  }
  subReplyLoading.value = true
  try {
    const res = await floorsApi.getFloorReplies(props.floor.id, subReplyPage.value)
    const pageList = extractReplyList(res)
    const merged = reset ? pageList : [...subReplyList.value, ...pageList]
    const seen = new Set()
    subReplyList.value = merged.filter((item) => {
      const key = item?.id || `${item?.uid || ''}_${item?.created_at || ''}_${item?.content || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    subReplyLoaded.value = true
    const receivedFullPage = pageList.length >= SUB_REPLY_PAGE_SIZE
    subReplyHasMore.value = hasReliableSubReplyTotal.value
      ? receivedFullPage && subReplyList.value.length < subReplyTotal.value
      : receivedFullPage
    if (subReplyHasMore.value) subReplyPage.value += 1
  } catch (e) {
    console.warn('加载子回复失败', e)
    subReplyLoaded.value = false
  } finally {
    subReplyLoading.value = false
  }
}

function canDelete(item) {
  if (!item) return false
  const myId = Number(props.currentUserId || 0)
  if (!myId) return false
  return Number(item.uid || 0) === myId
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
.sub-loading {
  margin-top: 6px;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
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

