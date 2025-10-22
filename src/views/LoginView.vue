<template>
  <div class="auth">
    <SiteHeader />
    <div class="login-view">
      <div class="card">
        <h1>Entrar</h1>

        <LoginForm
          :loading="loading"
          :error="error"
          @submit="onSubmit"
        />
      </div>
    </div>
    <SiteFooter />
  </div>

</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../services/auth.js'
import LoginForm from '../components/forms/LoginForm.vue'
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')

async function onSubmit({ email, password }) {
  loading.value = true
  error.value = ''
  try {
    await login({ email, password })
    const redirect = route.query.redirect || { name: 'Home' }
    router.push(redirect)
  } catch (err) {
    error.value = err?.message || 'Falha no login'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth {
  min-height: 100vh;
  background: #0e3358;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.login-view {
  flex: 1;
  display: grid;
  place-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.card {
  width: 100%;
  max-width: 420px;
  background: #fff; color: #111;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 8px 30px rgba(0,0,0,.2);
}
h1 {
  margin: 0 0 16px;
  text-align: center;
  color: #222;
}

</style>
