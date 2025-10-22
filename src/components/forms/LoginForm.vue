<template>
  <form class="login-form" @submit.prevent="emitSubmit">
    <div class="field">
      <label for="email">E-mail</label>
      <input
        id="email"
        type="email"
        v-model.trim="email"
        placeholder="seu@email.com"
        autocomplete="username"
        required
      />
    </div>

    <div class="field">
      <label for="password">Senha</label>
      <input
        id="password"
        type="password"
        v-model="password"
        placeholder="sua senha"
        autocomplete="current-password"
        required
      />
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="submit" type="submit" :disabled="loading">
      <span v-if="!loading">Entrar</span>
      <span v-else>Entrando...</span>
    </button>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
const emit = defineEmits(['submit'])

const email = ref('')
const password = ref('')

function emitSubmit() {
  if (!email.value || !password.value) return
  emit('submit', { email: email.value, password: password.value })
}

// Opcional: limpar senha se houve erro anterior e o usuário mexer
watch(() => props.error, (e) => {
  if (e) password.value = ''
})
</script>

<style scoped>
.login-form {
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
label {
  font-size: 13px;
  color: #444;
}
input {
  padding: 10px 12px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color .2s;
  background: #fff;
}
input:focus {
  border-color: #16a34a;
}
.error {
  margin: 4px 0 0;
  color: #b91c1c;
  font-size: 13px;
}
.submit {
  margin-top: 8px;
  background: #16a34a;
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform .02s ease;
}
.submit:disabled {
  opacity: .7;
  cursor: not-allowed;
}
.submit:active { transform: translateY(1px); }
</style>
