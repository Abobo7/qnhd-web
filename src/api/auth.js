import { api } from './axios'

export const authApi = {
    loginByPassword(user, password) {
        return api.get('auth/passwd', { params: { user, password } })
    },

    getTokenByToken(token) {
        return api.get('auth/token', { params: { token } })
    },
}
