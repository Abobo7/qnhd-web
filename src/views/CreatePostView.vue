<template>
  <div class="create-page page-container">
    <div class="content-container">
      <button class="btn btn-ghost back-btn" @click="$router.back()">
        <span class="icon">arrow_back</span>
        返回
      </button>

      <div class="create-card card">
        <h1 class="create-title">发布新帖</h1>

        <form @submit.prevent="handleSubmit" class="create-form">
          <!-- Title -->
          <div class="form-group">
            <label class="form-label">标题</label>
            <input v-model="title" class="input" placeholder="请输入标题" maxlength="50" required />
            <span class="char-count">{{ title.length }}/50</span>
          </div>

          <!-- Content -->
          <div class="form-group">
            <label class="form-label">内容</label>
            <textarea v-model="content" class="textarea" placeholder="请输入帖子内容..." maxlength="2000" required></textarea>
            <span class="char-count">{{ content.length }}/2000</span>
          </div>

          <!-- Type -->
          <div class="form-group">
            <label class="form-label">分类</label>
            <div class="type-selector">
              <button
                v-for="t in postTypes"
                :key="t.id"
                type="button"
                :class="['btn', type === t.id ? 'btn-primary' : 'btn-secondary']"
                @click="type = t.id"
              >
                {{ t.shortname || t.name }}
              </button>
            </div>
          </div>

          <!-- Tag -->
          <div class="form-group">
            <label class="form-label">标签（可选）</label>
            <div class="tag-input-wrapper">
              <input v-model="tagSearch" class="input" placeholder="搜索或创建标签" @input="searchTag" />
              <div v-if="tagResults.length" class="tag-dropdown">
                <button
                  v-for="t in tagResults"
                  :key="t.id"
                  type="button"
                  class="tag-option"
                  @click="selectTag(t)"
                >
                  {{ t.name }}
                </button>
              </div>
            </div>
            <div v-if="selectedTag" class="selected-tag">
              <span class="badge">{{ selectedTag.name }}</span>
              <button type="button" class="btn-icon" style="width:24px;height:24px;" @click="selectedTag = null">
                <span class="icon" style="font-size:14px;">close</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary submit-btn" :disabled="submitting">
            <span v-if="submitting" class="spinner" style="width:18px;height:18px;border-width:2px;"></span>
            <span v-else>发布</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useForumStore } from '../stores/forum'
import { postsApi } from '../api/posts'

const router = useRouter()
const forumStore = useForumStore()
const toast = inject('toast')

const title = ref('')
const content = ref('')
const type = ref(2)
const postTypes = ref([])
const tagSearch = ref('')
const tagResults = ref([])
const selectedTag = ref(null)
const submitting = ref(false)

let searchTimeout = null

onMounted(async () => {
  await forumStore.fetchPostTypes()
  postTypes.value = forumStore.postTypes
  if (postTypes.value.length) type.value = postTypes.value[0].id
})

function searchTag() {
  clearTimeout(searchTimeout)
  if (!tagSearch.value.trim()) {
    tagResults.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    try {
      const res = await postsApi.searchTags(tagSearch.value.trim())
      tagResults.value = res.data?.list || []
    } catch (e) {
      tagResults.value = []
    }
  }, 300)
}

function selectTag(tag) {
  selectedTag.value = tag
  tagSearch.value = ''
  tagResults.value = []
}

async function handleSubmit() {
  if (!title.value.trim() || !content.value.trim()) {
    toast?.('请填写标题和内容', 'error')
    return
  }
  submitting.value = true
  try {
    await postsApi.sendPost({
      type: type.value,
      title: title.value.trim(),
      content: content.value.trim(),
      tagId: selectedTag.value?.id,
      campus: 0,
      images: [],
    })
    toast?.('发布成功！', 'success')
    router.push('/')
  } catch (e) {
    toast?.(e.message || '发布失败', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.back-btn { margin-bottom: 12px; }
.create-card { padding: 32px; }
.create-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: 28px;
}
.create-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}
.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}
.char-count {
  position: absolute;
  right: 0;
  top: 0;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-input-wrapper { position: relative; }
.tag-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}
.tag-option {
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.tag-option:hover { background: var(--bg-input); }
.selected-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}
.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: var(--text-base);
  font-weight: 600;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .create-card { padding: 20px; }
}
</style>
