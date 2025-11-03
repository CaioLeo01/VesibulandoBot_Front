<template>
  <div class="challenge">
    <!-- Top bar (mobile) -->
    <header class="challenge-top">
      <button class="menu-toggle" type="button" @click="openSidebar">
        <i class="fa-solid fa-bars"></i>
        Menu
      </button>
      <div class="brand">
        <img :src="logo" alt="VestibulandoBot" />
        <span>VestibulandoBot</span>
      </div>
    </header>

    <div class="container">
      <!-- Sidebar -->
      <div class="sidebar-slot">
        <AppSidebar @logout="onLogout" />
      </div>

      <!-- Conteúdo -->
      <div class="center">
        <section class="panel panel-config">
          <header class="panel-top">
            <div>
              <h2>Meu Perfil</h2>
              <p class="header-sub">Visualize e gerencie suas informações pessoais.</p>
            </div>
          </header>

          <div v-if="loading" class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Carregando...
          </div>

          <div v-else-if="error" class="error">
            <p>{{ error }}</p>
          </div>

          <div v-else class="profile-content">
            <div class="profile-header">
              <img
                :src="user.avatar || defaultAvatar"
                alt="Avatar"
                class="profile-avatar"
              />
              <div class="profile-info">
                <h3>{{ user.nome || user.nome_usuario || user.name || user.email }}</h3>
                <p>{{ user.email }}</p>
              </div>
            </div>

            <div class="profile-details">
              <h4>Detalhes da Conta</h4>
              <ul>
                <li><strong>Código:</strong> {{ user.cod_usuario ?? '—' }}</li>
                <li><strong>Nome:</strong> {{ user.nome || user.nome_usuario || '—' }}</li>
                <li><strong>E-mail:</strong> {{ user.email || '—' }}</li>
              </ul>
            </div>

            <div class="profile-actions">
              <button class="btn btn-config" @click="editarPerfil">
                <i class="fa-solid fa-user-pen"></i> Editar Perfil
              </button>
              <button class="btn btn-logout" @click="onLogout">
                <i class="fa-solid fa-right-from-bracket"></i> Sair
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Mobile sidebar overlay / panel -->
    <transition name="fade">
      <div v-if="sidebarOpen" class="mobile-sidebar-overlay" @click="closeSidebar"></div>
    </transition>

    <transition name="slide">
      <div v-if="sidebarOpen" class="mobile-sidebar-panel" @click.stop>
        <div class="mobile-sidebar-header">
          <button class="close" type="button" @click="closeSidebar">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <AppSidebar @logout="handleMobileLogout" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { logout as doLogout } from '@/services/auth.js'
import logoUrl from '@/assets/Icone.ico'
import defaultAvatarUrl from '@/assets/default-avatar.png'

const router = useRouter()
const logo = logoUrl
const defaultAvatar = defaultAvatarUrl

const user = ref({})
const loading = ref(true)
const error = ref(null)
const sidebarOpen = ref(false)

// Ajuste a base da API conforme seu .env (sem barra dupla)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

/**
 * Busca o usuário logado.
 * Usa credentials: 'include' para enviar cookies de sessão (Flask-Login).
 * Se usar Bearer token em localStorage, altere para enviar Authorization header.
 */
async function fetchUser() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/usuario/logado`, {
      method: 'GET',
      credentials: 'include', // necessário se backend usa sessão por cookie
      headers: { 'Accept': 'application/json' }
    })

    if (!res.ok) {
      // tenta pegar mensagem do servidor, caso exista
      let msg = `HTTP ${res.status}`
      try {
        const body = await res.json()
        if (body && (body.error || body.erro || body.message)) {
          msg = body.error || body.erro || body.message
        }
      } catch {}
      throw new Error(`Falha ao buscar dados do usuário: ${msg}`)
    }

    const payload = await res.json()
    // O backend pode retornar { reply } ou o objeto do usuário direto.
    // Normalizamos: se payload.usuario / payload.user / payload.data existir, use.
    user.value =
      payload?.usuario ||
      payload?.user ||
      payload?.data ||
      (payload && Object.keys(payload).length ? payload : {})
  } catch (err) {
    console.error('fetchUser error', err)
    error.value = err.message || 'Erro ao carregar usuário'
  } finally {
    loading.value = false
  }
}

function openSidebar() { sidebarOpen.value = true }
function closeSidebar() { sidebarOpen.value = false }
function handleMobileLogout() { closeSidebar(); onLogout() }

async function onLogout() {
  try {
    await doLogout()
  } catch (e) {
    console.warn('logout failed', e)
  } finally {
    router.replace({ name: 'Login', query: { logout: '1' } })
  }
}

function editarPerfil() {
  // ajuste se tiver rota específica
  router.push({ name: 'EditarPerfil' }).catch(() => {})
}

onMounted(fetchUser)
</script>

<style scoped>
/* Mantive o padrão visual do Challenge (compactado aqui) */

/* Base/layout (copiado do padrão que você usa) */
.challenge{
  min-height:100vh;
  height:100vh;
  background:#0d2a3f;
  padding:24px;
  box-sizing:border-box;
  position:relative;
  display:flex;
  flex-direction:column;
  overflow:hidden;
}
.challenge-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  max-width:1300px;
  margin:0 auto 12px auto;
}
.brand{
  display:flex;
  align-items:center;
  gap:10px;
  color:#ffffff;
  font-weight:700;
  letter-spacing:0.4px;
  font-size:18px;
}
.brand img{ width:36px; height:36px; object-fit:contain; }
.menu-toggle{
  appearance:none; border:none; background:rgba(26,56,80,0.9); color:#ffffff;
  font-weight:600; padding:10px 14px; border-radius:10px; display:none; align-items:center;
  gap:8px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.1); backdrop-filter:blur(10px);
}

/* container / sidebar */
.container{ display:grid; grid-template-columns:minmax(240px,280px) 1fr; gap:16px; max-width:1300px; margin:0 auto; flex:1; width:100%; min-height:0; overflow:hidden; }
.sidebar-slot{ height:100%; min-height:0; overflow:hidden; display:flex; flex-direction:column; }
.sidebar-slot > *{ flex:1; min-height:0; height:100%; }
.center{ display:grid; grid-auto-rows:auto auto 1fr auto; min-width:0; }

/* panels */
.panel{ background:#fff; border-radius:16px; box-shadow:0 10px 30px rgba(30,58,95,.10); padding:0; }
.panel-config{ padding:16px; margin-top:12px; }
.panel-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; color:#1f2937; }
.panel-top h2{ margin:0; color:#1e3a5f; }
.header-sub{ margin:4px 0 0 0; color:#6b7280; }

/* Profile specifics */
.profile-header {
  display:flex;
  gap:20px;
  align-items:center;
  margin-bottom:20px;
}
.profile-avatar {
  width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #00aa3e;
}
.profile-info h3 { margin:0; color:#1e3a5f; font-size:20px; }
.profile-info p { margin:4px 0 0 0; color:#6b7280; }

.profile-details { margin-top:12px; }
.profile-details h4 { color:#1e3a5f; margin-bottom:8px; }
.profile-details ul { list-style:none; padding:0; margin:0; }
.profile-details li { margin-bottom:8px; color:#374151; }

.profile-actions { margin-top:18px; display:flex; gap:10px; }
.btn { padding:10px 14px; border-radius:999px; font-weight:700; cursor:pointer; border:1px solid rgba(0,0,0,0.06); background:#f3f4f6; }
.btn-config { background:#00aa3e; color:#fff; border:none; padding:10px 18px; }
.btn-config:hover { background:#00471a; }
.btn-logout { background:#ef4444; color:#fff; border:none; padding:10px 18px; }
.btn-logout:hover { background:#dc2626; }

/* loading / error */
.loading, .error { padding:24px; text-align:center; color:#fff }
.error p { color:#f87171; }

/* mobile responsiveness */
@media (max-width:900px) {
  .menu-toggle{ display:inline-flex; }
  .container{ display:flex; flex-direction:column; gap:12px; max-width:none; width:100%; }
  .sidebar-slot{ display:none; }
}
</style>
