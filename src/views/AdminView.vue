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
              <h2>Admin Dashboard</h2>
              <p class="header-sub">
                Visualize os alunos, desempenho e questões. Gerencie o conteúdo do sistema.
              </p>
            </div>
          </header>
          <br>
          <button class="btn btn-config" @click="openChallengeConfig">
            Configurar Desafio
          </button>
          <button class="btn btn-config" @click="openPergunta">
            Adicionar nova Pergunta
          </button>
        </section>

        <!-- Tabela de alunos -->
        <section class="panel panel-summary alunos-section">
          <header class="table-header">
            <h3>Desempenho dos Alunos</h3>
            <p class="header-sub">Visualize seus alunos e seus resultados mais recentes</p>
          </header>

          <div class="table-wrapper">
            <table class="alunos-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>N° de Acertos</th>
                  <th>% de Acertos</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="loading">
                  <td colspan="4" class="loading">Carregando...</td>
                </tr>
                <tr v-else-if="error">
                  <td colspan="4" class="error">{{ error }}</td>
                </tr>
                <tr v-else-if="!alunos.length">
                  <td colspan="4" class="empty">Nenhum aluno encontrado</td>
                </tr>
                <tr v-for="aluno in alunos" :key="aluno.cod_usuario">
                  <td>{{ aluno.cod_usuario }}</td>
                  <td>{{ aluno.nome_usuario }}</td>
                  <td>{{ aluno.qtd_acertos ?? '-' }}</td>
                  <td>{{ aluno.percentual_acertos ? aluno.percentual_acertos + '%' : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Rodapé -->
        <footer class="page-footer"></footer>
      </div>
    </div>

    <!-- Mobile sidebar -->
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

    <!-- MODAL DE CONFIGURAÇÃO DO DESAFIO -->
    <ChallengeConfigModal
      v-model="showChallengeConfigModal"
      @apply="applyChallengeConfig"
    />

    <!-- MODAL DE PERGUNTA -->
    <adicionarNovaPergunta
      v-model="showPerguntaModal"
      :initial="config"
      :simulados="simulados"
      @apply="applyPergunta"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ChallengeConfigModal from '@/components/challenge/ChallengeConfigModal.vue'
import adicionarNovaPergunta from '@/components/admin/adicionarNovaPergunta.vue'
import { logout as doLogout } from '@/services/auth.js'
import { getUsuarioLogado, getAlunosProfessor } from '@/services/usuario.js'
import logoUrl from '../assets/Icone.ico'

const router = useRouter()
const sidebarOpen = ref(false)
const logo = logoUrl

/* ==========================================================
   🔹 ESTADO
========================================================== */
const alunos = ref([])
const loading = ref(true)
const error = ref(null)
const showChallengeConfigModal = ref(false)
const showPerguntaModal = ref(false)

/* ==========================================================
   🔹 FUNÇÕES
========================================================== */
function openSidebar() { sidebarOpen.value = true }
function closeSidebar() { sidebarOpen.value = false }
function openChallengeConfig() { showChallengeConfigModal.value = true }
function openPergunta() { showPerguntaModal.value = true }

async function onLogout() {
  try {
    await doLogout()
  } finally {
    router.replace({ name: 'Login', query: { logout: '1' } })
  }
}

async function carregarAlunosDoProfessor() {
  try {
    loading.value = true
    error.value = null
    const usuario = await getUsuarioLogado()
    if (usuario?.cod_usuario) {
      const lista = await getAlunosProfessor(usuario.cod_usuario)
      alunos.value = lista
    } else {
      error.value = 'Usuário logado inválido'
    }
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao carregar dados dos alunos.'
  } finally {
    loading.value = false
  }
}

function applyChallengeConfig(payload) {
  console.log('Configuração aplicada:', payload)
  showChallengeConfigModal.value = false
}

function applyPergunta(payload) {
  console.log('Nova pergunta adicionada:', payload)
  showPerguntaModal.value = false
}

/* ==========================================================
   🔹 LIFECYCLE
========================================================== */
onMounted(() => carregarAlunosDoProfessor())
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
.challenge {
  min-height: 100vh;
  background: #0d2a3f;
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.challenge-top {
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

.container {
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr;
  gap: 16px;
  max-width: 1300px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
}

.sidebar-slot {
  display: flex;
  flex-direction: column;
}

.center {
  display: grid;
  grid-auto-rows: auto auto 1fr auto;
  background: #1a3850;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  overflow: hidden;
}

/* ===== Painel superior ===== */
.panel {
  background: var(--c-surface);
  border: 1px solid var(--bd-soft);
  border-radius: 16px;
  box-shadow: var(--shadow);
}

.panel-config {
  padding: 16px;
  margin-top: 12px;
}

.panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  color: #F1F5F9;
}

.panel-top h2 {
  margin: 0;
  color: var(--c-text);
}

.header-sub {
  margin: 4px 0 0 0;
  color: #cfe8ff;
}

/* ===== Botões ===== */
.btn-config {
  background-color: #00aa3e;
  color: #fff;
  border: none;
  margin-left: 3px;
  padding: 12px 18px;
  border-radius: 999px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(22, 163, 74, .25);
  transition: all .2s ease;
}
.btn-config:hover {
  background-color: #00471a;
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(22, 163, 74, .3);
}

/* ===== Tabela de alunos ===== */
.alunos-section {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  margin: 16px;
}

.table-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.table-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.table-header .header-sub {
  margin-top: 4px;
  color: #cfe8ff;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.alunos-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.alunos-table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  color: #cfe8ff;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.alunos-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(6px);
}

.alunos-table tr:nth-child(even) td {
  background: rgba(255, 255, 255, 0.03);
}

.alunos-table .loading,
.alunos-table .error,
.alunos-table .empty {
  text-align: center;
  color: #cfe8ff;
  font-style: italic;
  padding: 20px 0;
}

.alunos-table tr:hover td {
  background: rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease;
}

/* ===== Rodapé ===== */
.page-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 16px;
}

/* ===== Sidebar móvel ===== */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-enter-active, .slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}

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
  .challenge {
    padding: 12px;
    height: auto;
  }
  .menu-toggle {
    display: inline-flex;
  }
  .container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .sidebar-slot {
    display: none;
  }
  .alunos-section {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .challenge {
    padding: 8px;
  }
  .brand {
    font-size: 16px;
  }
  .brand img {
    width: 32px;
    height: 32px;
  }
}

/* ===== Fundo animado ===== */
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
