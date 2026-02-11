<template>
  <div class="create-page page-container">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <span class="icon">arrow_back</span>
      </button>
      <h1 class="page-title">发布新帖</h1>
      <div style="width:36px;"></div>
    </div>

    <div class="create-form card">
      <!-- Post type -->
      <div class="form-group">
        <label class="form-label">帖子分类</label>
        <div class="type-row">
          <button
            v-for="t in postTypes"
            :key="t.id"
            :class="['type-chip', { active: selectedType === t.id }]"
            @click="selectedType = t.id"
          >{{ t.shortname || t.name }}</button>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="form-label">标题</label>
        <input
          v-model="title"
          class="form-input"
          placeholder="请输入标题"
          maxlength="50"
        />
        <span class="char-count">{{ title.length }}/50</span>
      </div>

      <!-- Content -->
      <div class="form-group">
        <label class="form-label">内容</label>
        <textarea
          v-model="content"
          class="form-input content-textarea"
          placeholder="请输入内容..."
          maxlength="2000"
          @paste="onPasteImages"
        ></textarea>
        <span class="char-count">{{ content.length }}/2000</span>
      </div>

      <!-- Tag -->
      <div class="form-group">
        <label class="form-label">标签（可选）</label>
        <input
          v-model="tag"
          class="form-input"
          placeholder="添加标签"
          maxlength="20"
        />
      </div>

      <!-- Images -->
      <div class="form-group">
        <label class="form-label">图片（可选，最多上传多张）</label>
        <div class="upload-row">
          <label class="btn btn-ghost" style="cursor:pointer;">
            <input
              type="file"
              accept="image/*"
              multiple
              style="display:none;"
              :disabled="uploading"
              @change="onSelectImages"
            />
            <span v-if="uploading" class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
            <span v-else>选择图片</span>
          </label>
          <div class="thumbs" v-if="images.length">
            <div class="thumb" v-for="(url, idx) in images" :key="url + idx">
              <img :src="imageOriginUrl(url)" alt="已上传图片" @click="previewImage(url)" />
              <button type="button" @click="removeImage(idx)">
                <span class="icon" style="font-size:12px;">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        class="btn btn-primary submit-btn"
        :disabled="!canSubmit || submitting"
        @click="submitPost"
      >
        <div v-if="submitting" class="spinner" style="width:18px;height:18px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></div>
        <span v-else>发布</span>
      </button>
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
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useForumStore } from '../stores/forum'
import { postsApi } from '../api/posts'
import { imageOriginUrl } from '../utils/image'
import { useImageUpload } from '../composables/useImageUpload'

const router = useRouter()
const forumStore = useForumStore()
const toast = inject('toast')

const postTypes = ref([])
const selectedType = ref(2)
const title = ref('')
const content = ref('')
const tag = ref('')
const submitting = ref(false)
const previewUrl = ref(null)

// Image upload composable
const {
  images,
  uploading,
  onSelectFiles: onSelectImages,
  onPasteFiles: onPasteImages,
  removeImage,
} = useImageUpload(toast)

const canSubmit = computed(() => title.value.trim() && content.value.trim())

onMounted(async () => {
  if (!forumStore.postTypes.length) {
    await forumStore.fetchPostTypes()
  }
  postTypes.value = forumStore.postTypes
})

async function submitPost() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  try {
    await postsApi.createPost({
      type: selectedType.value,
      title: title.value.trim(),
      content: content.value.trim(),
      tag: tag.value.trim() || undefined,
      images: images.value,
    })
    toast?.('发布成功！', 'success')
    router.replace('/')
  } catch (e) {
    toast?.(e.message || '发布失败', 'error')
  } finally {
    submitting.value = false
  }
}

// Image upload is now handled by the useImageUpload composable

function previewImage(url) {
  previewUrl.value = url
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page-title {
  font-size: var(--text-lg);
  font-weight: 600;
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
}
.back-btn:hover { background: var(--bg-hover); }

.create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.type-chip {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: var(--bg-input);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}
.type-chip:hover { border-color: var(--border-color); }
.type-chip.active {
  background: var(--primary-bg);
  color: var(--primary);
  border-color: var(--primary);
  font-weight: 500;
}

.content-textarea {
  min-height: 160px;
  resize: vertical;
  line-height: 1.7;
}

.upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.thumbs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb button {
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

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: var(--text-hint);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  font-size: var(--text-md);
  font-weight: 600;
  border-radius: var(--radius-md);
}
</style>
