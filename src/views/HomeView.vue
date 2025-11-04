<template>
  <div class="home">
    <div class="wrap">
      <header class="head">
        <h1>Bem-vindo 👋</h1>
        <p class="head">Escolha um modo para começar</p>
      </header>

      <section class="grid">
        <RouterLink class="card study" :to="{ name: 'Study' }">
          <div class="icon">📚</div>
          <h2>Modo Estudo</h2>
          <p>Trilhas, materiais e chat de estudo.</p>
          <span class="go">Ir para Estudo →</span>
        </RouterLink>

        <RouterLink class="card challenge" :to="{ name: 'Challenge' }">
          <div class="icon">🏆</div>
          <h2>Modo Desafio</h2>
          <p>Questões, desafios e gamificação.</p>
          <span class="go">Ir para Desafio →</span>
        </RouterLink>

        <RouterLink class="card performance" :to="{ name: 'Performance' }">
          <div class="icon">📈</div>
          <h2>Performance</h2>
          <p>Métricas do seu desempenho.</p>
          <span class="go">Ver Performance →</span>
        </RouterLink>

        <!-- Só mostra se for admin -->
        <RouterLink v-if="isAdmin" class="card admin" :to="{ name: 'Admin' }">
          <div class="icon">🛠️</div>
          <h2>Administração</h2>
          <p>Gestão de conteúdos e usuários.</p>
          <span class="go">Abrir Administração →</span>
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getCurrentUser } from '@/services/auth.js'

const localUser = ref(null)

async function loadUser() {
  try {
    localUser.value = await getCurrentUser(true)
  } catch {
    localUser.value = null
  }
}

// flag de admin tolerante a boolean, number e string
const isAdmin = computed(() => {
  const v = localUser.value?.is_admin
  return v === true || v === 1 || v === '1' || v === 'true'
})

onMounted(loadUser)
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(#081d41, #0b3c71);
  background-size: 400% 400%;
  animation: gradientAnimation 15s ease infinite;
  padding: 32px 20px;
  box-sizing: border-box;
  display: grid;
  place-items: center;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.wrap { width: 100%; max-width: 1100px; }

.head { text-align: center; color: #ffffff; margin-bottom: 20px; }
.head h1 { margin: 0 0 6px; }
.head p { opacity: .9; margin: 0; }

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1100px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid { grid-template-columns: 1fr; }
}

.card {
  display: grid;
  gap: 8px;
  background: #f7f4ee;
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 18px;
  text-decoration: none;
  color: #111827;
  box-shadow: 0 6px 24px rgba(0,0,0,.08);
  transition: transform .08s ease, box-shadow .2s, background .2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(0,0,0,.12);
  background: rgb(186, 192, 199);
}

.icon { font-size: 28px; }
h2 { margin: 0; }
p { margin: 0; color: #374151; }
.go { margin-top: 6px; font-weight: 700; color: #111827; }

.card.study { border-left: 6px solid #2555a0; }
.card.challenge { border-left: 6px solid #1c8a8c; }
.card.performance { border-left: 6px solid #2154a5; }
.card.admin { border-left: 6px solid #2d5f70; }
</style>
