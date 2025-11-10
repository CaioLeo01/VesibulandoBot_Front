<template>
  <div class="study">
    <header class="study-top">
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
      <div class="sidebar-slot">
        <AppSidebar @logout="onLogout" />
      </div>

      <div class="chat-slot">
        <ChatWindow
          :messages="messages"
          :sending="sending"
          @send="handleSend"
        />
      </div>

      <div class="quick-slot">
        <QuickQuestions @pick="handleQuickPick" />
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="sidebarOpen"
        class="mobile-sidebar-overlay"
        @click="closeSidebar"
      ></div>
    </transition>

    <transition name="slide">
      <div
        v-if="sidebarOpen"
        class="mobile-sidebar-panel"
        @click.stop
      >
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
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCurrentUser, logout } from '../services/auth.js'
import { sendMessageToBot } from '../services/chat.js'

import AppSidebar from '../components/layout/AppSidebar.vue'
import ChatWindow from '../components/chat/ChatWindow.vue'
import QuickQuestions from '../components/quick/QuickQuestions.vue'
import logoUrl from '../assets/Icone.ico'

const router = useRouter()
const route = useRoute()
const user = ref(null)
const messages = ref([]) // { from: 'bot'|'user', text: string, at: number }
const sending = ref(false)
const sidebarOpen = ref(false)
const logo = logoUrl

// 🔹 Respostas simuladas das perguntas rápidas
const autoAnswers = {
  'Explique fotossintese em 3 passos.': '1️⃣ As plantas absorvem luz solar e dióxido de carbono. 2️⃣ Transformam a energia luminosa em química. 3️⃣ Produzem glicose e liberam oxigênio 🌿.',
  'Como calcular a media ponderada?': 'Some o produto de cada valor pelo seu peso e divida pela soma dos pesos: (v₁·p₁ + v₂·p₂ + ...)/(p₁ + p₂ + ...).',
  'Qual a diferenca entre mitose e meiose?': 'Mitose gera 2 células idênticas (crescimento e reparo). Meiose gera 4 células diferentes com metade do DNA (reprodução).',
  'Dicas para redacao nota 1000.': '📝 Tenha tese clara, argumente com repertório sociocultural, mantenha coesão e conclua com proposta de intervenção concreta.',
  'Resumo da Revolucao Francesa.': 'Começou em 1789 contra os privilégios da nobreza. Leis igualitárias, queda da monarquia e avanço dos direitos civis 🇫🇷.',
  'Como converter km/h para m/s?': 'Basta dividir o valor em km/h por 3,6. Ex: 72 km/h ÷ 3,6 = 20 m/s ⚙️.'
}

onMounted(async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    router.push({ name: 'Login' })
    return
  }

  user.value = currentUser
  const displayName = currentUser.name || 'estudante'
  messages.value.push({
    from: 'bot',
    text: 'Olá, ' + displayName + '! Bem-vindo ao Modo Estudo. O que quer revisar hoje?',
    at: Date.now(),
  })
})

watch(() => route.fullPath, () => {
  sidebarOpen.value = false
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

function formatUserText(text) {
  return (text || '').trim()
}

async function handleSend(text) {
  const clean = formatUserText(text)
  if (!clean) return

  messages.value.push({ from: 'user', text: clean, at: Date.now() })
  sending.value = true

  try {
    // 🔸 Durante o desenvolvimento, ainda sem IA
    const reply = await sendMessageToBot(clean)
    messages.value.push({ from: 'bot', text: reply, at: Date.now() })
  } catch (error) {
    console.error('Erro ao enviar mensagem', error)
    messages.value.push({
      from: 'bot',
      text: 'Não consegui responder agora. Tente novamente em instantes.',
      at: Date.now(),
    })
  } finally {
    sending.value = false
  }
}

// 🔹 Clique nas perguntas rápidas com resposta automática
function handleQuickPick(text) {
  const clean = formatUserText(text)
  if (!clean) return

  // Exibe a pergunta do usuário
  messages.value.push({ from: 'user', text: clean, at: Date.now() })

  // Resposta automática, se existir no dicionário
  const answer = autoAnswers[clean]
  if (answer) {
    setTimeout(() => {
      messages.value.push({
        from: 'bot',
        text: answer,
        at: Date.now(),
      })
    }, 500) // leve delay para parecer natural
  } else {
    // fallback
    messages.value.push({
      from: 'bot',
      text: 'Ainda estou aprendendo essa resposta. 😊',
      at: Date.now(),
    })
  }
}

async function onLogout() {
  try {
    await logout()
  } finally {
    router.replace({ name: 'Login', query: { logout: '1' } })
  }
}
</script>

<style scoped>
.study {
  min-height: 100vh;
  height: 100vh;
  background: #0d2a3f; /* match Challenge background */
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.study-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* center brand in col 2 */
  align-items: center;
  gap: 12px;
  max-width: 1400px;
  margin: 0 auto 16px;
  width: 100%;
  flex-shrink: 0;
  z-index: 10;
}

/* Placement: center brand on desktop, menu at left */
.study-top .menu-toggle { grid-column: 1; justify-self: start; }
.study-top .brand { grid-column: 2; justify-self: center; }

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
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.container {
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr minmax(240px, 280px);
  gap: 16px;
  max-width: 1400px;
  margin: 0 auto;
  flex: 1;
  width: 100%;
  min-height: 0;
  height: calc(100vh - 32px - 52px - 16px);
  overflow: hidden;
}

.sidebar-slot,
.chat-slot,
.quick-slot {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-slot > *,
.chat-slot > *,
.quick-slot > * {
  flex: 1;
  min-height: 0;
  height: 100%;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
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
  top: 0;
  bottom: 0;
  left: 0;
  width: min(300px, 85vw);
  background: rgba(16, 45, 68, 0.95);
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
  flex-shrink: 0;
}

.mobile-sidebar-header .close {
  appearance: none;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  padding: 6px;
  line-height: 1;
}

.mobile-sidebar-panel :deep(.sidebar) {
  flex: 1;
  border-radius: 12px;
  min-height: 0;
}

/* Breakpoints responsivos */
@media (max-width: 1200px) {
  .container { 
    grid-template-columns: minmax(220px, 260px) 1fr minmax(220px, 260px);
    gap: 12px;
  }
}

@media (max-width: 1000px) {
  .container { 
    grid-template-columns: 200px 1fr 200px;
    gap: 10px;
  }
}

@media (max-width: 900px) {
  .study {
    padding: 12px;
    height: 100vh;
    overflow: hidden;
  }

  .study-top {
    align-items: center;
    max-width: none;
    margin-bottom: 12px;
    grid-template-columns: auto 1fr auto; /* left: menu, right: brand */
  }

  .menu-toggle {
    display: inline-flex;
  }

  /* On mobile: brand to the right edge, menu left */
  .study-top .brand { grid-column: 3; justify-self: end; }
  .study-top .menu-toggle { grid-column: 1; justify-self: start; }

  .container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: none;
    width: 100%;
    height: calc(100vh - 24px - 52px - 12px);
    min-height: 0;
  }

  .chat-slot {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .sidebar-slot,
  .quick-slot {
    display: none;
  }
}

@media (max-width: 480px) {
  .study {
    padding: 8px;
  }
  
  .study-top {
    margin-bottom: 8px;
  }
  
  .brand {
    font-size: 16px;
  }
  
  .brand img {
    width: 32px;
    height: 32px;
  }
  
  .container {
    gap: 8px;
    height: calc(100vh - 16px - 48px - 8px);
  }
}

/* Correção para evitar scroll horizontal */
* {
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
}
</style>
