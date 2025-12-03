// src/services/usuario.js
import { apiFetch } from './api.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * 🔹 Retorna o usuário logado (baseado na sessão Flask)
 * GET /api/v1/usuario/logado
 */
export async function getUsuarioLogado() {
  const res = await fetch(`${BASE_URL}/usuario/logado`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Erro ao obter usuário logado: ${res.status}`)
  return await res.json()
}

/**
 * 🔹 Lista todos os usuários (somente admin)
 * GET /api/v1/usuario
 */
export async function getTodosUsuarios() {
  const res = await fetch(`${BASE_URL}/usuario`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Erro ao listar usuários: ${res.status}`)
  return await res.json()
}

/**
 * 🔹 Retorna todos os alunos vinculados a um professor
 * GET /api/v1/usuario/professor/:cod_professor/alunos
 */
export async function getAlunosProfessor(codProfessor) {
  const res = await fetch(`${BASE_URL}/usuario/professor/${codProfessor}/alunos`, {
    method: 'GET',
    credentials: 'include',
  })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Erro ao buscar alunos: ${res.status}`)
  return await res.json()
}

/**
 * 🔹 Associa automaticamente alunos a um professor (2–6)
 * POST /api/v1/usuario/professor/:cod_professor/associar-alunos
 */
export async function associarAlunosProfessor(codProfessor) {
  const res = await fetch(`${BASE_URL}/usuario/professor/${codProfessor}/associar-alunos`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.erro || `Erro ao associar alunos: ${res.status}`)
  }

  return await res.json()
}

// Atualizar usuário
export async function putAtualizarUsuario(codUsuario, { nome, email }) {
  const res = await fetch(`${BASE_URL}/usuario/${codUsuario}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ nome, email }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.erro || `Erro ao atualizar usuário: ${res.status}`)
  return data?.usuario || data?.user || data?.data || data
}