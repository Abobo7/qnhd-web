import { api } from './axios'

export const postsApi = {
    createPost(payload) {
        // Backward compat for callers expecting createPost
        return postsApi.sendPost(payload)
    },

    getPosts({ type = 2, page = 1, keyword, tagId, departmentId, searchMode, eTag } = {}) {
        return api.get('posts', {
            params: {
                type,
                search_mode: searchMode ?? (keyword ? 1 : 0),
                etag: eTag || '',
                content: keyword || '',
                tag_id: tagId || '',
                department_id: departmentId || '',
                page_size: 10,
                page,
            },
        })
    },

    getPostById(id) {
        return api.get('post', { params: { id } })
    },

    visitPost(postId) {
        const formData = new FormData()
        formData.append('post_id', postId)
        return api.post('post/visit', formData)
    },

    likePost(postId, isLike) {
        const formData = new FormData()
        formData.append('post_id', String(postId))
        formData.append('op', isLike ? '0' : '1')
        return api.post('post/like', formData, {
            headers: { 'Content-Type': undefined }
        })
    },

    dislikePost(postId, isDisliked) {
        const formData = new FormData()
        formData.append('post_id', String(postId))
        formData.append('op', isDisliked ? '0' : '1')
        return api.post('post/dis', formData, {
            headers: { 'Content-Type': undefined }
        })
    },

    favoritePost(postId, isFav) {
        const formData = new FormData()
        formData.append('post_id', String(postId))
        formData.append('op', isFav ? '0' : '1')
        return api.post('post/fav', formData, {
            headers: { 'Content-Type': undefined }
        })
    },

    sendPost({ type, title, content, departmentId, tagId, tag, campus, images, masked }) {
        const formData = new FormData()
        formData.append('type', type)
        formData.append('title', title)
        formData.append('content', content)
        formData.append('department_id', departmentId ?? '')
        const resolvedTag = tagId ?? tag
        formData.append('tag_id', resolvedTag ?? '')
        formData.append('campus', campus ?? 0)
        formData.append('masked', Array.isArray(masked) ? masked.join(',') : (masked ?? ''))
        if (images?.length) {
            // Backend expects the filename (as returned by upload), not full URL
            images.map(extractImageName).forEach(name => formData.append('images', name))
        }
        return api.post('post', formData, {
            headers: { 'Content-Type': undefined }
        })
    },

    deletePost(id) {
        return api.get('post/delete', {
            params: {
                post_id: id
            }
        })
    },

    getPostTypes() {
        return api.get('posttypes')
    },

    getHotTags() {
        return api.get('tags/hot')
    },

    getRecTag() {
        return api.get('tag/recommend')
    },

    searchTags(name) {
        return api.get('tags', { params: { name } })
    },

    getBanners() {
        return api.get('banners')
    },

    getDepartments() {
        return api.get('departments')
    },

    getMyPosts(page = 1, pageSize = 10) {
        const { pageNum, size } = normalizePageParams(page, pageSize)
        return api.get('posts/user', { params: { page: pageNum, page_size: size } })
    },

    getFavoritePosts(page = 1, pageSize = 10) {
        const { pageNum, size } = normalizePageParams(page, pageSize)
        return api.get('posts/fav', { params: { page: pageNum, page_size: size } })
    },

    getHistoryPosts(page = 1, pageSize = 10) {
        const { pageNum, size } = normalizePageParams(page, pageSize)
        return api.get('posts/history', { params: { page: pageNum, page_size: size } })
    },
}

function normalizePageParams(page, pageSize) {
    if (page && typeof page === 'object') {
        return {
            pageNum: page.page || 1,
            size: page.pageSize || page.page_size || 10,
        }
    }
    return {
        pageNum: page || 1,
        size: pageSize || 10,
    }
}

function extractImageName(url) {
    if (!url) return ''
    // If already a bare filename
    if (!url.includes('/')) return url
    try {
        // Handle full URL
        const u = new URL(url, 'http://placeholder/')
        const name = u.pathname.split('/').filter(Boolean).pop() || ''
        return name
    } catch (e) {
        // Fallback for relative paths like /qnhdpic/download/origin/xxx.png
        const parts = url.split('/')
        return parts.filter(Boolean).pop() || url
    }
}
