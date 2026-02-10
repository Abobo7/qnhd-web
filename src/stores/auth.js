import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import { userApi } from '../api/user'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('lake_token') || '')
    const userInfo = ref(null)

    const isLoggedIn = computed(() => !!token.value)

    async function login(user, password) {
        const res = await authApi.loginByPassword(user, password)
        const newToken = res.data?.token
        if (newToken) {
            token.value = newToken
            localStorage.setItem('lake_token', newToken)
            await fetchUserInfo()
            return true
        }
        throw new Error('登录失败，未获取到 token')
    }

    async function fetchUserInfo() {
        try {
            const res = await userApi.getUserInfo()
            userInfo.value = res.data?.user || null
        } catch (e) {
            console.warn('获取用户信息失败', e)
        }
    }

    function logout() {
        token.value = ''
        userInfo.value = null
        localStorage.removeItem('lake_token')
    }

    // Auto-fetch user info if already logged in
    if (token.value) {
        fetchUserInfo()
    }

    return { token, userInfo, isLoggedIn, login, fetchUserInfo, logout }
})
