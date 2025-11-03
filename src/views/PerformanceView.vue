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
              <h2>Desempenho</h2>
              <p class="header-sub">
                Acompanhe seu desempenho e veja sua evolução nos simulados através de gráficos e resultados visuais.
              </p>
            </div>
          </header>
          <br>
          <button class="btn btn-config" @click="openFiltro">Filtros</button>
        </section>

        <!-- Grid principal -->
        <section class="grid-panels">
          <aside class="panel panel-summary">
            <h3>Desempenho</h3>
              <div class="chart-container">
                <canvas id="chartDesempenho" height="260"></canvas>
              </div>
          </aside>
        </section>

        <!-- RODAPÉ -->
        <footer class="page-footer">
        </footer>
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

    <!-- MODAL DE Filtro -->
    <filtroAdminModal
      v-model="showFiltroModal"
      :initial="config"
      :simulados="simuladosRaw"
      @apply="applyFiltro"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import filtroAdminModal from '@/components/admin/filtroAdminModal.vue'
import { logout as doLogout } from '@/services/auth.js'
import { getUsuarioLogado } from '@/services/usuario.js'
import { listarResultadosPorUsuario, listarSimulados } from '@/services/simulado.js'
import logoUrl from '../assets/Icone.ico'
import { Chart, LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const logo = logoUrl
const user = ref(null)
const resultados = ref([])
let chartInstance = null

const simuladosRaw = ref([]) 

const config = reactive({
  cod_simulado: null,
  cod_materia: null
})

const simuladoById = computed(() => {
  const m = new Map()
  for (const s of simuladosRaw.value) m.set(s.cod_simulado, s)
  return m
})

const resultadosFiltrados = computed(() => {
  return resultados.value.filter(r => {
    if (config.cod_simulado != null && r.cod_simulado !== config.cod_simulado) return false
    if (config.cod_materia != null) {
      const s = simuladoById.value.get(r.cod_simulado)
      const cods = s?.cod_materias || []
      if (!cods.includes(config.cod_materia)) return false
    }
    return true
  })
})

function openSidebar() {
  sidebarOpen.value = true
}

function closeSidebar() {
  sidebarOpen.value = false
}

function handleMobileLogout() {
  closeSidebar()
  onLogout()
}

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Legend)

function notaPercentual(r) {
  if (typeof r.nota_final === 'number') return r.nota_final
  const total = (r.qtd_acertos ?? 0) + (r.qtd_erros ?? 0)
  return total > 0 ? Math.round((r.qtd_acertos / total) * 100) : 0
}

function labelDoPonto(r) {
  try {
    return new Date(r.dt_finalizacao).toLocaleDateString('pt-BR')
  } catch {
    return `Simulado ${r.cod_simulado}`
  }
}

function renderChart() {
  const ctx = document.getElementById('chartDesempenho')
  if (!ctx) return
  if (chartInstance) {
    chartInstance.destroy()
  }
  const base = resultadosFiltrados.value
  const labels = base.map(labelDoPonto)
  const dataPts = base.map(notaPercentual)

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Acertos (%)',
        data: dataPts,
        fill: true,
        tension: 0.4,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        borderWidth: 3
      }]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: { labels: { color: '#fff', font: { size: 14, weight: 'bold' } } },
        tooltip: { backgroundColor: 'rgba(0,0,0,0.7)', titleColor: '#fff', bodyColor: '#fff' }
      },
      scales: {
        x: { ticks: { color: '#fff', font: { size: 12 } }, grid: { color: 'rgba(255,255,255,0.15)' } },
        y: {
          ticks: {
            color: '#fff',
            font: { size: 12 },
            callback: (v) => `${v}%`
          },
          grid: { color: 'rgba(255,255,255,0.1)' },
          min: 0,
          max: 100
        }
      }
    }
  })
}

onMounted(async () => {
  try {
    user.value = await getUsuarioLogado()
    const data = await listarResultadosPorUsuario(user.value.cod_usuario)
    resultados.value = Array.isArray(data)
      ? [...data].sort((a, b) => new Date(a.dt_finalizacao) - new Date(b.dt_finalizacao))
      : []
    const sims = await listarSimulados()
    simuladosRaw.value = Array.isArray(sims) ? sims : []
  } catch (e) {
    console.error('Falha ao carregar resultados do usuário logado', e)
    resultados.value = []
    simuladosRaw.value = []
  } finally {
    renderChart()
  }
})

watch(resultadosFiltrados, () => {
  renderChart()
})

const showFiltroModal = ref(false)
function openFiltro() { showFiltroModal.value = true }
async function applyFiltro(payload) {
  config.cod_simulado = payload.cod_simulado ?? null
  config.cod_materia  = payload.cod_materia  ?? null
  renderChart()
  showFiltroModal.value = false
}

async function onLogout() {
  try {
    await doLogout()
  } finally {
    router.replace({ name: 'Login', query: { logout: '1' } })
  }
}
</script>

<style scoped>
/* ===== Paleta ===== */
:root, :host {
  --c-primary:#1E3A5F;
  --c-accent:#4ADE80;
  --c-bg:#0E2A3E;
  --c-surface:#FFFFFF;
  --c-text:#1F2937;
  --c-high:#FBBF24;
  --bd-soft:rgba(30,58,95,.12);
  --bd-strong:rgba(30,58,95,.18);
  --shadow:0 10px 30px rgba(30,58,95,.10);

  --c-green:#16A34A;
  --c-green-hover:#15803D;
  --c-gold:#D4AF37;
  --c-gold-soft:#FFF7DB;

  --confirm-text:#064E3B; /* texto do botão Confirmar */
}

/* ===== Layout base ===== */
.challenge{
  min-height:100vh;
  height:100vh;
  background:#0d2a3f;
  background-size:400% 400%;
  animation:gradientAnimation 15s ease infinite;
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

.container{ display:grid; grid-template-columns:minmax(240px,280px) 1fr; gap:16px; max-width:1300px; margin:0 auto; flex:1; width:100%; min-height:0; overflow:hidden; }
.sidebar-slot{ height:100%; min-height:0; overflow:hidden; display:flex; flex-direction:column; }
.sidebar-slot > *{ flex:1; min-height:0; height:100%; }
.center{ display:grid; grid-auto-rows:auto auto 1fr auto; min-width:0; } /* rodapé vira última linha */

.header{ padding:12px 16px 0 16px; }
.header h1{ color:#fff; margin:0; font-size:28px; line-height:1.2; }
.header-sub{ font-size: 12px; margin: 0; color:#cfe8ff; }
.panel{ background:var(--c-surface); border:1px solid var(--bd-soft); border-radius:16px; box-shadow:var(--shadow); }
.panel-config {
  padding: 12px;
  margin-top: 8px;
}
.panel-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px;color: #F1F5F9; }
.panel-top h2 { font-size: 18px; margin: 0 0 2px 0; }
.panel-sub{ margin:4px 0 0 0; color:#999b9e; }

/* ===== Botões ===== */
.btn{ --bg:#F1F5F9; --fg:var(--c-text); --bd:var(--bd-strong);
  background:var(--bg); color:var(--fg); border:1px solid var(--bd);
  padding:10px 14px; border-radius:999px; font-weight:700; cursor:pointer; }

.btn-config{
  background-color:#00aa3e; color:#fff; border:none;
  margin-left: 3px;
  margin-top: 4px;
  padding: 10px 14px; border-radius:999px; font-weight:800;
  box-shadow:0 8px 20px rgba(22,163,74,.25); transition:all .2s ease;
}
.btn-config:active{ transform:translateY(0); }

/* ===== Grid ===== */
.grid-panels{ display:grid; gap: 12px; margin-top: 8px; min-width:0; padding: 0 12px 12px; }
.panel-summary{ padding: 10px; color:#000; background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); }
.panel-summary h3{ margin:0 0 8px 0; color:#fff; }
.panel-question{ padding:16px; }
.panel-title{ display:flex; align-items:center; margin-bottom:8px; }
.panel-title .timer{ margin-left:auto; }
.summary-table {
  width: 100%;
  border-radius:8px;
  margin-top: 16px;
}

.summary-table tr {
  background-color: #f9fafb; /* Cor de fundo clara para todas as linhas */
}

.summary-table tr:nth-child(even) {
  background-color: #f9fafb; /* Cor de fundo para linhas pares */
}

.summary-table td {
  color: #333;
}

.summary-table th,
.summary-table td {
  padding: 12px;
  text-align: left;
  border: 1px solid var(--bd-soft);
}

/* ===== Rodapé da página ===== */
.page-footer{
  margin-top:auto; /* empurra ao rodapé do container */
  display:flex;
  justify-content:flex-end;
  padding:0 16px 16px; /* afastar das bordas do container */
}
.btn-finish{
  background:#1f2937; color:#fff; border:none;
  height:32px; padding:0 12px; border-radius:6px; font-weight:600;
  box-shadow:0 6px 18px rgba(0,0,0,.15);
  display:inline-flex; align-items:center; line-height:1; font-size:19px;
  font-family:"Times New Roman", Times, serif; text-transform:none; letter-spacing:.2px;
}
.btn-finish:hover{ background:#111827; }
.btn-finish:disabled{ opacity:.6; cursor:not-allowed; }

@media (max-width:1100px){ .container{ grid-template-columns:240px 1fr; } }
@media (max-width:900px){
  .challenge{ padding:12px; height:auto; min-height:100vh; overflow:visible; }
  .challenge-top{
    align-items:center; max-width:none; margin-bottom:12px;
    display:grid; grid-template-columns:auto 1fr auto; /* left: menu, right: brand */
    width:100%;
  }
  .menu-toggle{ display:inline-flex; }
  /* On mobile: brand to the right edge, menu left */
  .challenge-top .brand{ grid-column:3; justify-self:end; }
  .challenge-top .menu-toggle{ grid-column:1; justify-self:start; }

  .container{
    display:flex;
    flex-direction:column;
    gap:12px;
    max-width:none;
    width:100%;
    height:auto;
    min-height:0;
    overflow:visible;
  }
  .sidebar-slot{ display:none; }
  .grid-panels{ 
    grid-template-columns:1fr; 
    display:flex; 
    flex-direction:column; 
    height:auto; 
    min-height:0; 
    overflow:visible; 
  }
  /* Order: summary first, then question */
  .panel-summary{ order:1; min-height:auto; overflow:visible; }
  .panel-question{ order:2; min-height:auto; }
  .question-card{ flex:initial; min-height:auto; overflow:visible; }
  .center{ height:auto; }
}

@media (max-width:480px){
  .challenge{ padding:8px; }
  .challenge-top{ margin-bottom:8px; }
  .brand{ font-size:16px; }
  .brand img{ width:32px; height:32px; }
  .container{ gap:8px; height:auto; overflow:visible; }
}

/* Overrides para caber 100% da viewport no desktop */
.center{ display:grid; grid-template-rows:auto auto 1fr auto; min-width:0; min-height:0; height:100%; background:#1a3850; border:1px solid rgba(255,255,255,.12); border-radius:16px; overflow:hidden; }
.grid-panels{ height:100%; min-height:0; overflow:hidden; }
.panel-question{ display:flex; flex-direction:column; min-height:0; }
.question-card{ flex:1; min-height:0; overflow:auto; }
.panel-summary{ min-height:0; overflow:auto; }
* { box-sizing:border-box; }
html, body { overflow-x:hidden; }

@keyframes gradientAnimation{
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}

/* === Gráfico === */
.chart-container {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 320px;
  height: 320px;
  margin: 24px auto;
  background: rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  overflow: hidden;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
