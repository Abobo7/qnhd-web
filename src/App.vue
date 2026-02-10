<template>
  <div id="qnhd-app" :data-theme="theme">
    <AppHeader v-if="isLoggedIn" />
    <div class="toast-container">
      <TransitionGroup name="page">
        <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed, ref, provide } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

// Theme
const theme = ref(localStorage.getItem('theme') || 'dark')
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
}
provide('theme', { theme, toggleTheme })

// Toast system
const toasts = ref([])
let toastId = 0
const showToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}
provide('toast', showToast)
</script>

<style scoped>
#qnhd-app {
  min-height: 100vh;
}
</style>
