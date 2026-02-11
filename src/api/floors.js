import { api } from './axios'

export const floorsApi = {
    getFloors({ postId, page = 1, order = 0, onlyOwner = 0 }) {
        return api.get('floors', {
            params: {
                post_id: postId,
                page,
                page_size: 10,
                order,
                only_owner: onlyOwner,
            },
        })
    },

    getFloorById(floorId) {
        return api.get('floor', { params: { floor_id: floorId } })
    },

    getFloorReplies(floorId, page = 1) {
        return api.get('floor/replys', {
            params: { floor_id: floorId, page, page_size: 10, pageBase: 0 },
        })
    },

    getOfficialReplies(postId) {
        return api.get('post/replys', { params: { post_id: postId } })
    },

    sendFloor(postId, content, images = []) {
        const formData = new FormData()
        formData.append('post_id', Number(postId))
        formData.append('content', content)
        // Backend expects an images field even if empty; append empty entry when none
        if (images.length) {
            images.forEach(url => formData.append('images', url))
        } else {
            formData.append('images', '')
        }
        return api.post('floor', formData)
    },

    replyFloor(floorId, content, images = []) {
        const formData = new FormData()
        formData.append('reply_to_floor', Number(floorId))
        formData.append('content', content)
        if (images.length) {
            images.forEach(url => formData.append('images', url))
        } else {
            // Backend expects images field even if empty
            formData.append('images', '')
        }
        return api.post('floor/reply', formData)
    },

    likeFloor(floorId, isLike) {
        const formData = new FormData()
        formData.append('floor_id', floorId)
        formData.append('op', isLike ? 0 : 1)
        return api.post('floor/like', formData)
    },

    dislikeFloor(floorId, isDis) {
        const formData = new FormData()
        formData.append('floor_id', floorId)
        formData.append('op', isDis ? 0 : 1)
        return api.post('floor/dis', formData)
    },

    deleteFloor(floorId) {
        return api.get('floor/delete', { params: { floor_id: floorId } })
    },
}
