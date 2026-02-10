<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="icon login-logo" style="font-size:40px;color:var(--primary);">forum</span>
        <h1 class="login-title">青年湖底</h1>
        <p class="login-subtitle">天津大学校园论坛</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label class="form-label">学号 / 用户名</label>
          <input
            v-model="username"
            class="form-input"
            placeholder="请输入学号"
            @keydown.enter="$refs.pwdInput?.focus()"
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="password-wrapper">
            <input
              ref="pwdInput"
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              @keydown.enter="login"
            />
            <button class="pwd-toggle" @click="showPwd = !showPwd">
              <span class="icon">{{ showPwd ? 'visibility' : 'visibility_off' }}</span>
            </button>
          </div>
        </div>

        <button
          class="btn btn-primary login-btn"
          :disabled="!username || !password || loading"
          @click="login"
        >
          <div v-if="loading" class="spinner" style="width:18px;height:18px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></div>
          <span v-else>登录</span>
        </button>

        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')

async function login() {
  if (!username.value || !password.value || loading.value) return
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.replace('/')
  } catch (e) {
    error.value = e.message || '登录失败，请检查用户名和密码'
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
  background: var(--bg-page);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 40px 32px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--primary);
  margin: 8px 0 4px;
}
.login-subtitle {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
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
  font-weight: 500;
  color: var(--text-secondary);
}

.password-wrapper {
  position: relative;
}
.password-wrapper .form-input {
  padding-right: 40px;
}
.pwd-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-hint);
  cursor: pointer;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: var(--text-md);
  font-weight: 600;
  border-radius: var(--radius-md);
  margin-top: 4px;
}

.error-text {
  color: #E53935;
  font-size: var(--text-sm);
  text-align: center;
}
</style>
