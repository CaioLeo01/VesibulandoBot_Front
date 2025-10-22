<template>
  <div class="landing">
    <SiteHeader />

    <main class="landing-main">
      <section class="hero">
        <div class="wrap">
          <h1>Seu copiloto de estudos para o vestibular</h1>
          <p>
            Organize seus estudos, tire dúvidas em tempo real e acompanhe sua performance.
            Tudo em um só lugar.
          </p>
          <div class="cta">
            <RouterLink class="btn primary" :to="{ name: 'Register' }">Começar agora</RouterLink>
            <RouterLink class="btn secondary" :to="{ name: 'Login' }">Já tenho conta</RouterLink>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="grid">
          <article class="card">
            <h3>Modo Estudo</h3>
            <p>Chat focado em aprendizado com sugestões e materiais.</p>
          </article>
          <article class="card">
            <h3>Modo Desafio</h3>
            <p>Exercícios, quizzes e prática guiada.</p>
          </article>
          <article class="card">
            <h3>Performance</h3>
            <p>Métricas para visualizar sua evolução.</p>
          </article>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
// LandingView.vue
import { onMounted } from 'vue'
onMounted(() => {
  import('../views/LoginView.vue')
  import('../views/RegisterView.vue')
  import('../views/HomeView.vue')
})

</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: linear-gradient(180deg, #082544 0%, #0e3358 40%, #13406b 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
}

.landing-main {
  flex: 1 0 auto;
}

.hero {
  padding: 64px 20px 32px;
  display: grid;
  place-items: center;
  text-align: center;
}
.wrap { max-width: 900px; }
h1 { margin: 0 0 14px; font-size: 40px; }
p  { margin: 0 auto 18px; opacity: .95; max-width: 720px; }

.cta { display: flex; gap: 12px; justify-content: center; margin-top: 8px; }
.btn { text-decoration: none; border-radius: 10px; padding: 10px 16px; font-weight: 800; }
.btn.primary { background: #16a34a; color: #fff; }
.btn.secondary { background: #0b2a4a; color: #fff; border:1px solid #2b6aa2; }

.features {
  padding: 32px 20px 64px;
}
.grid {
  max-width: 1100px; margin: 0 auto;
  display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr);
}
.card {
  background: #ffffff10;
  border: 1px solid #ffffff22;
  border-radius: 16px;
  padding: 18px;
  backdrop-filter: blur(6px);
}
.card h3 { color: #fff; margin: 0 0 8px; }
.card p  { color: #e5eef7; margin: 0; }

@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
  h1 { font-size: 32px; }
}
</style>

