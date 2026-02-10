import { api, picApi } from './axios'

export const userApi = {
    getUserInfo() {
        return api.get('user')
    },

    changeNickname(name) {
        const formData = new FormData()
        formData.append('name', name)
        return api.post('user/name', formData)
    },

    getMessageCount() {
        return api.get('message/count')
    },

    getNotices() {
        return api.get('message/notices/department')
    },

    getUserSetting() {
        return api.get('setting')
    },

    uploadImages(files) {
        const formData = new FormData()
        files.forEach((file) => {
            formData.append('images', file, `${Date.now()}.jpg`)
        })
        return picApi.post('upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    report({ id, floorId, isQuestion, reason }) {
        const formData = new FormData()
        formData.append('id', id)
        if (floorId) formData.append('floor_id', floorId)
        formData.append('is_question', isQuestion ? 1 : 0)
        formData.append('reason', reason)
        return api.post('report', formData)
    },
}
