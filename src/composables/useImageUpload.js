/**
 * Composable for image upload functionality.
 * Eliminates duplicated upload logic between PostDetailView and CreatePostView.
 */
import { ref } from 'vue'
import { userApi } from '../api/user'

/**
 * Extract uploaded image URLs from the API response.
 * Handles multiple possible response formats from the backend.
 */
export function extractUploadedUrls(res) {
    const urls =
        res.data?.urls ||
        res.data?.list ||
        res.data?.images ||
        res.data?.data?.urls ||
        res.data?.data?.list ||
        res.data?.data?.images ||
        []
    return Array.isArray(urls) ? urls : []
}

/**
 * Composable for managing image uploads.
 *
 * @param {Function} toast - toast notification function (injected from App.vue)
 * @returns {{ images, uploading, uploadFiles, onSelectFiles, onPasteFiles, removeImage, clearImages }}
 */
export function useImageUpload(toast) {
    const images = ref([])
    const uploading = ref(false)

    async function uploadFiles(files) {
        if (!files.length) return
        uploading.value = true
        try {
            const res = await userApi.uploadImages(files)
            const urls = extractUploadedUrls(res)
            if (urls.length === 0) {
                throw new Error('未获取到图片地址')
            }
            images.value.push(...urls)
            toast?.('图片上传成功', 'success')
        } catch (e) {
            toast?.(e.message || '图片上传失败', 'error')
        } finally {
            uploading.value = false
        }
    }

    async function onSelectFiles(event) {
        const files = Array.from(event.target.files || [])
        if (!files.length) return
        await uploadFiles(files)
        event.target.value = ''
    }

    async function onPasteFiles(e) {
        const items = Array.from(e.clipboardData?.items || [])
        const files = items
            .filter(it => it.kind === 'file' && it.type.startsWith('image/'))
            .map(it => it.getAsFile())
            .filter(Boolean)
        if (!files.length) return
        e.preventDefault()
        await uploadFiles(files)
    }

    function removeImage(idx) {
        images.value.splice(idx, 1)
    }

    function clearImages() {
        images.value = []
    }

    return { images, uploading, uploadFiles, onSelectFiles, onPasteFiles, removeImage, clearImages }
}
