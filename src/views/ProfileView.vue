<template>
  <div class="profile">
    <!-- Top bar (mobile) -->
    <header class="profile-top">
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
            <div class="profile-actions">
              <button class="btn btn-config" @click="editarPerfil">Editar Perfil</button>
            </div>
          </header>

          <div v-if="loading" class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Carregando...
          </div>

          <div v-else-if="error" class="error">
            <p>{{ error }}</p>
          </div>

          <div class="profile-content">
            <div class="profile-header">
              <div class="avatar-fallback">
                {{ user.nome?.charAt(0) || 'U' }}
              </div>
              <div class="profile-info">
                <h3>{{ user.nome || user.nome_usuario || 'Usuário' }}</h3>
                <p>{{ user.email || '—' }}</p>
              </div>
            </div>

            <h4 class="info-title">Informações da Conta</h4>

            <div class="profile-details">
              <div class="detail-box">
                <strong>Código</strong>
                <span>{{ user.cod_usuario ?? '—' }}</span>
              </div>
              <div class="detail-box">
                <strong>Nome</strong>
                <span>{{ user.nome || user.nome_usuario || '—' }}</span>
              </div>
              <div class="detail-box">
                <strong>E-mail</strong>
                <span>{{ user.email || '—' }}</span>
              </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { logout as doLogout } from '@/services/auth.js'
import logoUrl from '@/assets/Icone.ico'

const router = useRouter()
const logo = logoUrl

const user = ref({})
const loading = ref(true)
const error = ref(null)
const sidebarOpen = ref(false)

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const displayName = computed(() =>
  user.value.nome || user.value.nome_usuario || user.value.name || user.value.email || 'Usuário'
)

const initials = computed(() => {
  const nome = displayName.value?.trim()
  return nome ? nome[0].toUpperCase() : '?'
})

async function fetchUser() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/usuario/logado`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })

    if (!res.ok) {
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
  router.push({ name: 'EditarPerfil' }).catch(() => {})
}

onMounted(fetchUser)
</script>


<style scoped>
:root, :host {
  --c-primary: #1E3A5F;
  --c-accent: #4ADE80;
  --c-bg: #0E2A3E;
  --c-surface: #FFFFFF;
  --c-text: #1F2937;
  --bd-soft: rgba(30,58,95,.12);
  --shadow: 0 10px 30px rgba(30,58,95,.10);
}

/* ===== Layout principal ===== */
.profile {
  min-height: 100vh;
  background: linear-gradient(-45deg, #0E2A3E, #1E3A5F, #16304A, #0E2A3E);
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== Topo ===== */
.profile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1300px;
  margin: 0 auto 12px auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.4px;
  font-size: 18px;
}

.brand img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.menu-toggle {
  appearance: none;
  border: none;
  background: rgba(26, 56, 80, 0.9);
  color: #ffffff;
  font-weight: 600;
  padding: 10px 14px;
  border-radius: 10px;
  display: none;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* ===== Container ===== */
.container {
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr;
  gap: 16px;
  max-width: 1300px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  min-height: 0;
}

.sidebar-slot {
  display: flex;
  flex-direction: column;
}
.sidebar-slot > *{ flex:1; min-height:0; height:100%; }

.center {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a3850;
  border: 1px solid var(--bd-soft);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
}

/* ===== Cabeçalho do painel ===== */
.panel-top h2 {
  color: #ffffff;
  margin: 0;
}

.panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 600px) {
  .panel-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: 0px;
  }
}


.header-sub {
  margin-top: 6px;
  color: #cfe8ff;
}

/* ===== Cabeçalho do Perfil ===== */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 28px;
  margin-bottom: 24px;
}

.avatar-fallback {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #079685;
  color: #fff;
  font-weight: 800;
  font-size: 36px;
  display: grid;
  place-items: center;
  box-shadow: 0 4px 20px rgba(21, 87, 45, 0.3);
}

.profile-info h3 {
  color: #ffffff;
  margin: 0;
  font-size: 22px;
}

.profile-info p {
  color: #cfe8ff;
  margin-top: 4px;
}

/* ===== Informações ===== */
.info-title {
  color: #ffffff;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: left;
}

.profile-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.detail-box {
  flex: 1 1 calc(33.33% - 16px);
  background: #0d2a3f;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--bd-soft);
  box-shadow: 0 4px 10px rgba(21, 42, 70, 0.05);
}

.detail-box strong {
  color: #ffffff;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.detail-box span {
  color: #cfe8ff;
  font-size: 15px;
}

/* ===== Ações ===== */
.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-config {
  background-color: #22c55e;
  color: #fff;
  box-shadow: 0 8px 20px rgba(74, 222, 128, .25);
}

.btn-config:hover {
  background-color: #009236;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(74, 222, 128, .3);
}

.btn-logout {
  background: #ef4444;
  color: #fff;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.25);
}

.btn-logout:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.3);
}

/* ===== Mobile Sidebar ===== */
.mobile-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 90;
}
.mobile-sidebar-panel {
  position: fixed;
  top: 0; bottom: 0; left: 0;
  width: min(300px, 85vw);
  background: rgba(16,45,68,0.95);
  backdrop-filter: blur(10px);
  padding: 12px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 6px 0 18px rgba(0,0,0,0.2);
}
.mobile-sidebar-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.mobile-sidebar-header .close {
  appearance: none;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
}

/* ===== Responsividade ===== */
@media (max-width: 900px) {
  .container {
    display: flex;
    flex-direction: column;
  }

  .profile-details {
    flex-direction: column;
  }

  .detail-box {
    
    flex: 1 1 100%;
  }

  .profile-actions {
    justify-content: center;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .sidebar-slot {
    display: none;
  }
}


</style>

