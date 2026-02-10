<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Bottom navigation (show when logged in) -->
    <nav v-if="showNav" class="bottom-nav">
      <router-link to="/" class="nav-item" active-class="active" :class="{ active: $route.path === '/' }">
        <span class="icon">home</span>
        <span class="nav-label">首页</span>
      </router-link>
      <router-link to="/create" class="nav-item" active-class="active">
        <span class="icon">edit_square</span>
        <span class="nav-label">发帖</span>
      </router-link>
      <router-link to="/profile" class="nav-item" active-class="active">
        <span class="icon">person</span>
        <span class="nav-label">我的</span>
      </router-link>
    </nav>

    <!-- Toast container -->
    <div class="toast-container">
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['toast', 'toast-' + t.type]"
      >{{ t.msg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const showNav = computed(() => {
  return authStore.isLoggedIn && route.path !== '/login'
})

// Toast system
const toasts = ref([])
let toastId = 0

function toast(msg, type = 'info') {
  const id = toastId++
  toasts.value.push({ id, msg, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 2500)
}

provide('toast', toast)
</script>

<style>
/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bottom navigation */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.04);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 20px;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}
.nav-item .icon {
  font-size: 24px;
}
.nav-label {
  font-size: 11px;
}
.nav-item.active {
  color: var(--primary);
}
.nav-item.active .icon {
  font-weight: 600;
}
</style>
