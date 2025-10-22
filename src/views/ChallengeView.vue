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
        <!-- Painel: configurar -->
        <section class="panel panel-config">
          <header class="panel-top">
            <div>
              <h2>Configurar desafio</h2>
              <p class="header-sub">
                Simulados, foco e progresso contínuo. Mude as opções quando quiser.
              </p>
            </div>
            <button class="btn btn-config" @click="openConfig">Configurar desafio</button>
          </header>
        </section>

        <!-- Grid principal -->
        <section class="grid-panels">
          <!-- Painel questão -->
          <div class="panel panel-question">
            <div class="panel-title">
              <div class="timer" :style="{ color: timerColor }">
                <i class="dot" /> {{ timeDownMMSS }}
              </div>
            </div>

            <article class="question-card" v-if="currentQuestion && !finished">
              <h4 class="question-title">
                {{ questionIndex + 1 }}. {{ currentQuestion.enunciado }}
              </h4>

              <div class="options">
                <label
                  v-for="opt in ['A','B','C','D','E']"
                  :key="opt"
                  class="option"
                  :class="{ selected: selectedOption === opt }"
                >
                  <input type="radio" :value="opt" v-model="selectedOption" />
                  <span class="opt-key">{{ opt }}</span>
                  <span class="opt-text">
                    {{ currentQuestion[`alternativa_${opt.toLowerCase()}`] }}
                  </span>
                </label>
              </div>

              <div class="actions-row">
                <button class="btn btn-skip" @click="skipQuestion" :disabled="loading">Pular</button>
                <button class="btn btn-confirm" @click="confirmAnswer" :disabled="loading || !selectedOption">Confirmar</button>
                <button class="btn btn-finish" @click="finalizarSimulado" :disabled="loading">Finalizar</button>
              </div>
            </article>

            <article v-else class="question-card">
              <h4 class="question-title">
                {{ finished ? 'Simulado concluído!' : 'Selecione um simulado para começar.' }}
              </h4>
              <p v-if="finished">Seus resultados foram enviados com sucesso.</p>
            </article>
          </div>

          <!-- Painel resumo -->
          <aside class="panel panel-summary">
            <h3>Resumo do desafio</h3>
            <ul class="summary-list">
              <li><span>Simulado</span><b>{{ labelSimulado }}</b></li>
              <li><span>Matéria</span><b>{{ labelMateria }}</b></li>
              <li><span>Ano</span><b>{{ labelAno }}</b></li>
            </ul>
            <div class="summary-timer">
              <div class="clock">{{ timeUpHHMMSS }}</div>
            </div>
          </aside>
        </section>
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

    <!-- MODAL DE CONFIG -->
    <ChallengeConfigModal
      v-model="showModal"
      :initial="config"
      :simulados="simulados"
      @apply="applyConfig"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ChallengeConfigModal from '@/components/challenge/ChallengeConfigModal.vue'
import { listarSimulados, listarQuestoesSimulado, registrarResultadoSimulado } from '@/services/simulado.js'
import { logout as doLogout } from '@/services/auth.js'
import logoUrl from '../assets/Icone.ico'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const logo = logoUrl

function openSidebar() { sidebarOpen.value = true }
function closeSidebar() { sidebarOpen.value = false }
function handleMobileLogout() { closeSidebar(); onLogout() }

/* ---------- Estado ---------- */
const showModal = ref(false)
const isConfigured = ref(false)
const simulados = ref([])
const config = reactive({
  simulado: null,
  materia: null,
  simuladoLabel: '',
  materiaLabel: '',
  ano: null
})

/* ---------- Questões ---------- */
const questionList = ref([])
const questionIndex = ref(0)
const selectedOption = ref(null)
const loading = ref(false)
const finished = ref(false)
const currentQuestion = computed(() => questionList.value[questionIndex.value] || null)

/* ---------- Labels ---------- */
const labelSimulado = computed(() => config.simuladoLabel || '—')
const labelMateria = computed(() => config.materiaLabel || '—')
const labelAno = computed(() => config.ano || '—')

/* ---------- Timer ---------- */
const COUNTDOWN_START = 3 * 60
const secondsLeft = ref(COUNTDOWN_START)
const elapsedSeconds = ref(0)
let countdownTick = null
let elapsedTick = null

function formatMMSS(t){ const m=Math.floor(t/60).toString().padStart(2,'0'); const s=(t%60).toString().padStart(2,'0'); return `${m}:${s}` }
function formatHHMMSS(t){ const h=Math.floor(t/3600).toString().padStart(2,'0'); const m=Math.floor((t%3600)/60).toString().padStart(2,'0'); const s=(t%60).toString().padStart(2,'0'); return `${h}:${m}:${s}` }
const timeDownMMSS = computed(() => formatMMSS(secondsLeft.value))
const timeUpHHMMSS = computed(() => formatHHMMSS(elapsedSeconds.value))
const timerColor = computed(() => secondsLeft.value <= 50 ? '#ef4444' : secondsLeft.value <= 110 ? '#f59e0b' : '#22c55e')

function iniciarTimers(){
  pararTimers()
  secondsLeft.value = COUNTDOWN_START
  elapsedSeconds.value = 0
  countdownTick = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value--
  }, 1000)
  elapsedTick = setInterval(() => elapsedSeconds.value++, 1000)
}
function pararTimers(){
  if (countdownTick) clearInterval(countdownTick)
  if (elapsedTick) clearInterval(elapsedTick)
}
onBeforeUnmount(pararTimers)

/* ---------- Ações ---------- */
function openConfig() { showModal.value = true }

async function applyConfig(payload) {
  Object.assign(config, payload)
  isConfigured.value = true
  finished.value = false
  showModal.value = false

  // define ano do simulado
  const sim = simulados.value.find(s => s.cod_simulado === config.simulado)
  config.ano = sim ? new Date(sim.dt_criacao).getFullYear() : new Date().getFullYear()

  await carregarQuestoes()
  iniciarTimers()
}

/* ---------- Backend ---------- */
async function carregarQuestoes() {
  if (!config.simulado) return
  loading.value = true
  try {
    const res = await listarQuestoesSimulado(config.simulado)
    questionList.value = res || []
    questionIndex.value = 0
    selectedOption.value = null
  } finally {
    loading.value = false
  }
}

function confirmAnswer() {
  if (!currentQuestion.value || !selectedOption.value) return
  currentQuestion.value.userAnswer = selectedOption.value
  nextQuestion()
}

function skipQuestion() {
  if (!currentQuestion.value) return
  currentQuestion.value.userAnswer = null
  nextQuestion()
}

function nextQuestion() {
  selectedOption.value = null
  if (questionIndex.value + 1 < questionList.value.length) {
    questionIndex.value++
  } else {
    finalizarSimulado()
  }
}

/* ---------- Finalizar ---------- */
async function finalizarSimulado() {
  pararTimers()
  finished.value = true
  const acertos = questionList.value.filter(q => q.userAnswer === q.resposta_correta).length
  const erros = questionList.value.length - acertos
  // TODO: Quando getUsuario estiver pronto, substituir por o usuário logado
  await registrarResultadoSimulado(config.simulado, {
    cod_usuario: 1,
    qtd_acertos: acertos,
    qtd_erros: erros
  })
  alert(`Simulado finalizado!\nAcertos: ${acertos}\nErros: ${erros}`)
}

/* ---------- Logout ---------- */
async function onLogout() {
  try { await doLogout() }
  finally { pararTimers(); router.replace({ name: 'Login', query: { logout: '1' } }) }
}

watch(() => route.fullPath, () => sidebarOpen.value = false)
listarSimulados().then(data => simulados.value = data)
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
.header-sub{ margin:4px 0 0 0; color:#cfe8ff; }
.panel{ background:var(--c-surface); border:1px solid var(--bd-soft); border-radius:16px; box-shadow:var(--shadow); }
.panel-config{ padding:16px; margin-top:12px; }
.panel-top{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px;color: #F1F5F9; }
.panel-top h2{ margin:0; color:var(--c-text); }
.panel-sub{ margin:4px 0 0 0; color:#999b9e; }

/* ===== Botões ===== */
.btn{ --bg:#F1F5F9; --fg:var(--c-text); --bd:var(--bd-strong);
  background:var(--bg); color:var(--fg); border:1px solid var(--bd);
  padding:10px 14px; border-radius:999px; font-weight:700; cursor:pointer; }

.btn-config{
  background-color:#00aa3e; color:#fff; border:none;
  padding:12px 18px; border-radius:999px; font-weight:800;
  box-shadow:0 8px 20px rgba(22,163,74,.25); transition:all .2s ease;
}
.btn-config:hover{ background-color:#00471a; transform:translateY(-1px); box-shadow:0 10px 24px rgba(22,163,74,.30); }
.btn-config:active{ transform:translateY(0); }

/* ===== Grid ===== */
.grid-panels{ display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-top:16px; min-width:0; padding:0 16px; }
.panel-question{ padding:16px; }
.panel-title{ display:flex; align-items:center; margin-bottom:8px; }
.panel-title .timer{ margin-left:auto; }

/* ===== Timer ===== */
.timer{ font-weight:700; display:flex; align-items:center; gap:6px; }
.dot{ width:10px; height:10px; background:currentColor; border-radius:50%; display:inline-block; }

/* ===== Questão / opções ===== */
.question-card{ background:#79787869; border:1px solid var(--bd-soft); border-radius:12px; padding:16px; }
.question-title{ margin:0 0 12px 0; color:#111827; }

.options{ display:grid; gap:10px; }
.option{
  display:flex; align-items:center; gap:10px;
  border:1px solid var(--bd-soft); border-radius:10px;
  padding:12px 14px; background:#FFFFFF; cursor:pointer;
  transition:border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.option input{ display:none; }

.opt-key{
  width:32px; height:32px; border-radius:50%;
  display:grid; place-items:center; background:#e5e7eb;
  font-weight:800; color:#111827;
}
.option.selected{
  border-color:var(--c-gold);
  background:var(--c-gold-soft);
  box-shadow:0 0 0 3px rgba(212,175,55,.18);
}
.option.selected .opt-key{
  background:#FFF1BF; color:#c9a33a; border:2px solid var(--c-gold);
}
.opt-text{ color:#111827; }

/* Ações (apenas 2 botões) */
.actions-row{
  display:flex; gap:10px; justify-content:flex-end; margin-top:14px; flex-wrap:wrap;
}
.actions-row{ flex-shrink:0; }

/* ===== Resumo ===== */
.panel-summary{ padding:12px; color:#000; background:rgba(255,255,255,.06); border-color:rgba(255,255,255,.12); }
.panel-summary h3{ margin:0 0 8px 0; color:#fff; }
.summary-list{ list-style:none; margin:0; padding:0; display:grid; gap:6px; }
.summary-list li{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:8px 10px; background:rgba(255,255,255,.08); border-radius:8px; }
.summary-list li span{ color:#cfe8ff; }
.summary-list li b{ color:#fff; }

.summary-timer{ margin-top:10px; background:#fff; border-radius:10px; border:1px solid var(--bd-soft); display:grid; place-items:center; padding:12px; }
.clock{ font-size:28px; font-weight:800; color:#1E3A5F; }

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

/* === Dica (callout) === */
.panel-config .callout{
  margin-top:8px;
  background:#FFFBEB !important;
  border:1px solid rgba(251,191,36,.5) !important;
  border-radius:12px;
  padding:8px 10px;
  display:grid;
  grid-template-columns:auto 1fr;
  align-items:center;
  gap:8px;
}
.panel-config .callout .badge{
  background:#FBBF24 !important;
  color:#92400E !important;
  border-radius:999px;
  padding:4px 8px;
  font-weight:800; font-size:11px; display:inline-flex; align-items:center;
}
.panel-config .callout .callout-body{ color:#92400E !important; font-size:14px; line-height:1.35; }
.panel-config .callout .callout-body p{ margin:0; }

/* Botão Confirmar */
.btn-confirm{
  background: rgb(72, 199, 72);
  color: var(--confirm-text);
  border: 2px solid #006e06;
  box-shadow: 0 6px 18px rgba(45,212,191,.18);
  transition: background-color .2s ease, border-color .2s ease, transform .08s ease, box-shadow .2s ease;
}
.btn-confirm:hover{
  background: rgb(0, 138, 0);
  border-color: #006e06;
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(45,212,191,.25);
}
.btn-confirm:active{ transform: translateY(0); box-shadow: 0 4px 12px rgba(45,212,191,.25); }
.btn-confirm:focus-visible{ outline: 3px solid rgba(45,212,191,.45); outline-offset: 2px; }

/* Botão Pular (hover cinza) */
.btn-skip{
  transition: background-color .2s ease, border-color .2s ease, transform .08s ease, box-shadow .2s ease;
}
.btn-skip:hover{ background:#E5E7EB; border-color: rgba(30,58,95,.28); }
.btn-skip:active{ background:#D1D5DB; }

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

/* Mobile sidebar overlay/panel */
.fade-enter-active,.fade-leave-active{ transition:opacity 0.2s ease; }
.fade-enter-from,.fade-leave-to{ opacity:0; }
.slide-enter-active,.slide-leave-active{ transition:transform 0.25s ease; }
.slide-enter-from,.slide-leave-to{ transform:translateX(-100%); }
.mobile-sidebar-overlay{ position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:90; }
.mobile-sidebar-panel{
  position:fixed; top:0; bottom:0; left:0; width:min(300px,85vw);
  background:rgba(16,45,68,0.95); backdrop-filter:blur(10px); padding:12px; z-index:100;
  display:flex; flex-direction:column; box-shadow:6px 0 18px rgba(0,0,0,0.2);
}
.mobile-sidebar-header{ display:flex; justify-content:flex-end; margin-bottom:8px; flex-shrink:0; }
.mobile-sidebar-header .close{ appearance:none; border:none; background:transparent; color:#ffffff; font-size:22px; cursor:pointer; padding:6px; line-height:1; }
.mobile-sidebar-panel :deep(.sidebar){ flex:1; border-radius:12px; min-height:0; }

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
</style>
