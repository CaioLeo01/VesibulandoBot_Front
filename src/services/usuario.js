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
 * 🔹 (Opcional) Busca usuário por ID
 * GET /api/v1/usuario/:id
 * (Se você decidir implementar esse endpoint no backend)
 */
export async function getUsuarioPorId(id) {
  const res = await fetch(`${BASE_URL}/usuario/${id}`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(`Erro ao buscar usuário ${id}: ${res.status}`)
  return await res.json()
}
