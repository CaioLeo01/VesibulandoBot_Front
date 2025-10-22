<template>
  <aside class="sidebar">
    <div class="brand">
      <i class="fa-solid fa-graduation-cap logo"></i>
      <div class="title">VestibulandoBot</div>
    </div>

    <div class="user" @click="goToProfile" title="Ver perfil" style="cursor: pointer;">
      <div class="avatar">{{ initials }}</div>
      <div class="name">{{ displayName || 'Usuário' }}</div>
      <div class="email">{{ user?.email }}</div>
    </div>



    <nav class="nav">
      <RouterLink class="link" :to="{ name: 'Study' }">Modo Estudo</RouterLink>
      <RouterLink class="link" :to="{ name: 'Challenge' }">Modo Desafio</RouterLink>
      <RouterLink class="link" :to="{ name: 'Performance' }">Performance</RouterLink>
      <RouterLink class="link" :to="{ name: 'Admin' }">Administração</RouterLink>
    </nav>

    <button class="logout" :disabled="logoutLoading" @click="onLogout">
      {{ logoutLoading ? 'Saindo...' : 'Sair' }}
    </button>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getCurrentUser, logout } from '../../services/auth.js' // ajuste o caminho se necessário

// Prop opcional (se o pai já passar o usuário)
const props = defineProps({
  user: { type: Object, default: null }
})

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

// Nome exibido: prioriza `nome` (back), depois `name`, senão prefixo do e-mail
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

// Iniciais
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

function goToProfile() {
  onNavigate()
  router.push({ name: 'Profile' })
}


async function onLogout() {
  if (logoutLoading.value) return
  logoutLoading.value = true
  try {
    await logout()                    // POST /auth/logout
    window.dispatchEvent(new Event('auth:changed')) // avisa o app (opcional)
  } catch (e) {
    // mesmo se falhar, seguimos o fluxo de segurança
  } finally {
    logoutLoading.value = false
  }
  router.replace({ name: 'Login' })
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
.logo { font-size: 28px; color: #ffffff; }
.title { font-weight: 800; letter-spacing: .3px; color: #ffffff; }

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
.name { font-weight: 700; }
.email { font-size: 12px; color: #6b7280; }

.nav { display: grid; gap: 12px; }

.link {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #111827;
  padding: 14px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s, color 0.3s, transform 0.1s;
}
.link:hover { background-color: #079685; color: #fff; }
.link:active { transform: scale(0.97); }
.link.router-link-exact-active {
  background-color: #079685;
  color: #fff;
  font-weight: bold;
}

.logout {
  background: #ef4444;
  color: #fff;
  border: 0;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s, opacity .2s;
}
.logout:disabled { opacity: .6; cursor: not-allowed; }
.logout:hover:not(:disabled) { background-color: #ff0000; }
</style>
