import { api } from './axios'

export const postsApi = {
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
        formData.append('post_id', postId)
        formData.append('op', isLike ? 0 : 1)
        return api.post('post/like', formData)
    },

    dislikePost(postId, isDisliked) {
        const formData = new FormData()
        formData.append('post_id', postId)
        formData.append('op', isDisliked ? 0 : 1)
        return api.post('post/dis', formData)
    },

    favoritePost(postId, isFav) {
        const formData = new FormData()
        formData.append('post_id', postId)
        formData.append('op', isFav ? 0 : 1)
        return api.post('post/fav', formData)
    },

    sendPost({ type, title, content, departmentId, tagId, campus, images }) {
        const formData = new FormData()
        formData.append('type', type)
        formData.append('title', title)
        formData.append('content', content)
        if (departmentId) formData.append('department_id', departmentId)
        if (tagId) formData.append('tag_id', tagId)
        formData.append('campus', campus || 0)
        if (images?.length) {
            images.forEach(url => formData.append('image_urls', url))
        }
        return api.post('post', formData)
    },

    deletePost(id) {
        const formData = new FormData()
        formData.append('id', id)
        return api.post('post/delete', formData)
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
        return api.get('posts/user', { params: { page, page_size: pageSize } })
    },

    getFavoritePosts(page = 1, pageSize = 10) {
        return api.get('posts/fav', { params: { page, page_size: pageSize } })
    },

    getHistoryPosts(page = 1, pageSize = 10) {
        return api.get('posts/history', { params: { page, page_size: pageSize } })
    },
}
