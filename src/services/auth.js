// src/services/auth.js
import { apiFetch } from './api.js'

let _sessionLoaded = false
let _user = null

export async function getCurrentUser(force = false) {
  if (!_sessionLoaded || force) {
    try { _user = await apiFetch('/auth/me') } catch { _user = null }
    _sessionLoaded = true
  }
  return _user
}

/**
 * Cadastro por e-mail/senha.
 * @param {Object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} [params.confirm]  // usado só para validação local (opcional)
 * @param {string} [params.name]     // opcional; mapeia para "nome" no back
 */
export async function register({ email, password, confirm, name }) {
  // Validação local opcional — remova se já faz no componente
  if (confirm !== undefined && password !== confirm) {
    throw new Error('As senhas não conferem.')
  }

  const body = { email, senha: password }  // Backend ainda usa 'senha'
  if (name) body.nome = name

  return apiFetch('/auth/register', {
    method: 'POST',
    body,
  })
}

export async function login({ email, password }) {
  const u = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email, senha: password },  // Backend ainda usa 'senha'
  })
  _user = u
  _sessionLoaded = true
  return u
}

export async function logout() {
  await apiFetch('/auth/logout', { method: 'POST' })
  _user = null
  _sessionLoaded = false
}

export async function setPassword({ password, confirm, currentPassword }) {
  return apiFetch('/auth/password/set', {
    method: 'POST',
    body: { 
      password,           // ✅ Mudança: usar 'password'
      confirm,            // ✅ Mudança: usar 'confirm'
      current_password: currentPassword  // ✅ Se precisar da senha atual
    },
  })
}