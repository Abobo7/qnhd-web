import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsApi } from '../api/posts'

export const useForumStore = defineStore('forum', () => {
    const postTypes = ref([])
    const departments = ref([])
    const hotTags = ref([])

    async function fetchPostTypes() {
        if (postTypes.value.length) return
        try {
            const res = await postsApi.getPostTypes()
            postTypes.value = res.data?.list || []
        } catch (e) {
            console.warn('获取分类失败', e)
        }
    }

    async function fetchDepartments() {
        if (departments.value.length) return
        try {
            const res = await postsApi.getDepartments()
            departments.value = res.data?.list || []
        } catch (e) {
            console.warn('获取部门失败', e)
        }
    }

    async function fetchHotTags() {
        try {
            const res = await postsApi.getHotTags()
            hotTags.value = res.data?.list || []
        } catch (e) {
            console.warn('获取热门标签失败', e)
        }
    }

    return { postTypes, departments, hotTags, fetchPostTypes, fetchDepartments, fetchHotTags }
})
