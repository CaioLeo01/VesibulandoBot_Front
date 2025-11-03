<template>
  <aside class="sidebar">
    <div class="brand">
      <i class="fa-solid fa-graduation-cap logo"></i>
      <div class="title">VestibulandoBot</div>
    </div>

    <div class="user" @click="goToProfile" title="Ver perfil" style="cursor: pointer;">
      <div class="avatar">{{ initials }}</div>
      <div class="name">{{ displayName || 'Usuario' }}</div>
      <div class="email">{{ user?.email }}</div>
    </div>



    <nav class="nav">
      <RouterLink class="link" :to="{ name: 'Study' }" @click="onNavigate">
        <i class="fa-solid fa-book-open"></i>
        <span>Modo Estudo</span>
      </RouterLink>
      <RouterLink class="link" :to="{ name: 'Challenge' }" @click="onNavigate">
        <i class="fa-solid fa-trophy"></i>
        <span>Modo Desafio</span>
      </RouterLink>
      <RouterLink class="link" :to="{ name: 'Performance' }" @click="onNavigate">
        <i class="fa-solid fa-chart-line"></i>
        <span>Performance</span>
      </RouterLink>
      <RouterLink v-if="isAdmin" class="link" :to="{ name: 'Admin' }" @click="onNavigate">
        <i class="fa-solid fa-cog"></i>
        <span>Administração</span>
      </RouterLink>
    </nav>

    <button class="logout" :disabled="logoutLoading" @click="onLogout">
      <i class="fa-solid fa-sign-out-alt"></i>
      <span>{{ logoutLoading ? 'Saindo...' : 'Sair' }}</span>
    </button>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getCurrentUser, logout } from '../../services/auth.js'

const props = defineProps({
  user: { type: Object, default: null }
})

const isAdmin = computed(() => {
  const v = user.value?.is_admin
  return v === true || v === 1 || v === '1' || v === 'true'
})

const emit = defineEmits(['logout', 'navigate'])

const router = useRouter()
const localUser = ref(null)
const logoutLoading = ref(false)

async function loadUser(force = false) {
  try {
    localUser.value = await getCurrentUser(force)
  } catch {
    localUser.value = null
  }
}

function handleExternalAuthChange() {
  loadUser(true)
}

onMounted(() => {
  if (!props.user) loadUser()
  window.addEventListener('storage', handleExternalAuthChange)
  window.addEventListener('auth:changed', handleExternalAuthChange)
})
onBeforeUnmount(() => {
  window.removeEventListener('storage', handleExternalAuthChange)
  window.removeEventListener('auth:changed', handleExternalAuthChange)
})

const user = computed(() => props.user ?? localUser.value)

const displayName = computed(() => {
  const u = user.value
  if (!u) return ''
  if (u.nome && u.nome.trim()) return u.nome.trim()
  if (u.name && u.name.trim()) return u.name.trim()
  if (u.email) {
    const nick = String(u.email).split('@')[0] || ''
    return nick ? nick.charAt(0).toUpperCase() + nick.slice(1) : ''
  }
  return ''
})

const initials = computed(() => {
  if (displayName.value) {
    const parts = displayName.value.split(/[.\s_-]+/).filter(Boolean)
    const ini = parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
    return ini || 'VB'
  }
  if (user.value?.email) return String(user.value.email)[0]?.toUpperCase() || 'VB'
  return 'VB'
})

function onNavigate() {
  emit('navigate')
}

async function onLogout() {
  if (logoutLoading.value) return
  logoutLoading.value = true
  try {
    await logout()
    window.dispatchEvent(new Event('auth:changed'))
    emit('logout')
  } catch (e) {
    // segue fluxo mesmo em erro
    emit('logout')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<style scoped>
.sidebar {
  background: #1a3850;
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,.08);
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 16px;
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo { 
  font-size: 28px; 
  color: #ffffff; 
}
.title { 
  font-weight: 800; 
  letter-spacing: .3px; 
  color: #ffffff; 
}

.user {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
  text-align: center;
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #079685;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  margin: 0 auto;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(7, 150, 133, 0.3);
}
.name { 
  font-weight: 700; 
  font-size: 14px;
  word-wrap: break-word;
}
.email { 
  font-size: 12px; 
  color: #6b7280; 
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.nav { 
  display: grid; 
  gap: 12px; 
}

.link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f3f4f6;
  color: #111827;
  padding: 14px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 14px;
}

.link i {
  font-size: 16px;
  flex-shrink: 0;
}

.link span {
  text-align: center;
}

.link:hover { 
  background-color: #079685; 
  color: #fff; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(7, 150, 133, 0.2);
}

.link:active { 
  transform: scale(0.97); 
}

.link.router-link-exact-active {
  background-color: #079685;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(7, 150, 133, 0.3);
}

.logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #ef4444;
  color: #fff;
  border: 0;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
}

.logout i {
  font-size: 16px;
  flex-shrink: 0;
}

.logout:disabled { 
  opacity: .6; 
  cursor: not-allowed; 
}

.logout:hover:not(:disabled) { 
  background-color: #dc2626; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout:active:not(:disabled) {
  transform: scale(0.97);
}

/* Responsividade */
@media (max-width: 900px) {
  .sidebar {
    max-height: calc(100dvh - 24px);
    padding: 12px;
    gap: 12px;
  }

  .brand {
    gap: 8px;
  }

  .logo {
    font-size: 24px;
  }

  .title {
    font-size: 16px;
  }

  .user {
    padding: 10px;
    gap: 4px;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .name {
    font-size: 13px;
  }

  .email {
    font-size: 11px;
  }

  .nav {
    gap: 8px;
  }

  .link {
    padding: 12px 14px;
    font-size: 13px;
    gap: 10px;
  }

  .link i {
    font-size: 14px;
  }

  .logout {
    padding: 10px 14px;
    font-size: 13px;
    gap: 6px;
  }

  .logout i {
    font-size: 14px;
  }
}

@media (max-width: 600px) {
  .sidebar {
    padding: 10px;
    gap: 10px;
    border-radius: 12px;
  }

  .logo {
    font-size: 22px;
  }

  .title {
    font-size: 15px;
  }

  .user {
    padding: 8px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .name {
    font-size: 12px;
  }

  .email {
    font-size: 10px;
  }

  .link {
    padding: 10px 12px;
    font-size: 12px;
    gap: 8px;
  }

  .link i {
    font-size: 13px;
  }

  .logout {
    padding: 9px 12px;
    font-size: 12px;
  }

  .logout i {
    font-size: 13px;
  }
}

/* Ajustes para texto longo */
@media (max-width: 280px) {
  .link span {
    font-size: 11px;
  }

  .name,
  .email {
    font-size: 10px;
  }

  .title {
    font-size: 13px;
  }
}
</style>