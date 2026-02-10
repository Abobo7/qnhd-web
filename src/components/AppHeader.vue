<template>
  <header class="app-header card-glass">
    <div class="header-content">
      <router-link to="/" class="header-logo">
        <span class="icon" style="font-size: 24px; color: var(--accent-primary);">forum</span>
        <span class="logo-text">青年湖底</span>
      </router-link>

      <nav class="header-nav">
        <router-link to="/" class="nav-item" active-class="active">
          <span class="icon">home</span>
          <span class="nav-label">首页</span>
        </router-link>
        <router-link to="/create" class="nav-item" active-class="active">
          <span class="icon">add_circle_outline</span>
          <span class="nav-label">发帖</span>
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          <span class="icon">person</span>
          <span class="nav-label">我的</span>
        </router-link>
      </nav>

      <div class="header-actions">
        <button class="btn-icon" @click="toggleTheme" :title="theme === 'dark' ? '切换亮色' : '切换暗色'">
          <span class="icon">{{ theme === 'dark' ? 'light_mode' : 'dark_mode' }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { inject } from 'vue'

const { theme, toggleTheme } = inject('theme')
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 1000;
  padding: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--glass-border);
}

.header-content {
  max-width: var(--page-max-width);
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-text {
  font-size: var(--text-lg);
  font-weight: 700;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}
.nav-item:hover {
  color: var(--text-primary);
  background: var(--bg-input);
}
.nav-item.active {
  color: var(--accent-primary);
  background: rgba(108, 92, 231, 0.1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .nav-label { display: none; }
  .nav-item { padding: 8px 12px; }
  .logo-text { display: none; }
  .header-content { padding: 0 12px; }
}
</style>
