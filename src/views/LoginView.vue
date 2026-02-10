<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-card card-glass">
        <div class="login-header">
          <div class="login-logo">
            <span class="icon" style="font-size: 40px; color: var(--accent-primary);">forum</span>
          </div>
          <h1 class="login-title">青年湖底</h1>
          <p class="login-subtitle">天津大学校园论坛</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">学号 / 用户名</label>
            <input
              v-model="username"
              type="text"
              class="input"
              placeholder="请输入学号或用户名"
              autocomplete="username"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <div class="password-wrapper">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input"
                placeholder="请输入密码"
                autocomplete="current-password"
                required
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <span class="icon">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
            <span v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px;"></span>
            <span v-else>登 录</span>
          </button>

          <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const toast = inject('toast')

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.login(username.value, password.value)
    toast?.('登录成功！', 'success')
    router.push('/')
  } catch (e) {
    errorMsg.value = e.message || '登录失败，请检查用户名和密码'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(108, 92, 231, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(0, 206, 201, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(162, 155, 254, 0.08) 0%, transparent 50%),
    var(--bg-primary);
  z-index: -1;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  margin-bottom: 16px;
}

.login-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}

.login-subtitle {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.password-wrapper {
  position: relative;
}

.password-wrapper .input {
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  color: var(--text-tertiary);
  cursor: pointer;
  background: none;
  border: none;
}
.password-toggle:hover {
  color: var(--text-secondary);
}

.login-btn {
  width: 100%;
  padding: 14px;
  font-size: var(--text-base);
  font-weight: 600;
  margin-top: 8px;
}

.login-error {
  text-align: center;
  color: var(--accent-danger);
  font-size: var(--text-sm);
}
</style>
