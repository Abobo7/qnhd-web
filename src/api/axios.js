import axios from 'axios'

const api = axios.create({
    baseURL: '/api/v1/f/',
    timeout: 10000,
})

const picApi = axios.create({
    baseURL: '/pic-api/',
    timeout: 15000,
})

// Request interceptor - attach token and fix FormData headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('lake_token')
    if (token) {
        config.headers['token'] = token
    }
    // If sending FormData, let browser set multipart boundary
    if (config.data instanceof FormData) {
        // Clear any pre-set content-type to avoid breaking FormData parsing
        delete config.headers['Content-Type']
        if (config.headers.common) delete config.headers.common['Content-Type']
        if (config.headers.post) delete config.headers.post['Content-Type']
    } else if (!config.headers['Content-Type']) {
        // Default JSON content-type for plain body requests
        config.headers['Content-Type'] = 'application/json'
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
        // Some endpoints return 200 with data.error instead of code
        if (response.data?.data?.error) {
            return Promise.reject(new Error(response.data.data.error))
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
