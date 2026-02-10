import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1/f/',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
})

const picApi = axios.create({
    baseURL: '/pic-api/',
    timeout: 15000,
})

// Request interceptor - attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lake_token')
    if (token) {
        config.headers['token'] = token
    }
    return config
})

picApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('lake_token')
    if (token) {
        config.headers['token'] = token
    }
    return config
})

// Response interceptor - handle API response format
api.interceptors.response.use(
    (response) => {
        const code = response.data?.code
        if (code === 200) {
            return response.data
        }
        const errorMsg = response.data?.data?.error || response.data?.msg || '请求失败'
        return Promise.reject(new Error(errorMsg))
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('lake_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

picApi.interceptors.response.use(
    (response) => {
        const code = response.data?.code
        if (code === 200) return response.data
        return Promise.reject(new Error(response.data?.msg || '上传失败'))
    },
    (error) => Promise.reject(error)
)

export { api, picApi }
