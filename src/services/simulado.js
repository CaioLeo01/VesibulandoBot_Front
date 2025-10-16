import { apiFetch } from './api.js'

const baseUrl = '/simulados'

export async function listarSimulados() {
  return apiFetch(`${baseUrl}/`, { method: 'GET' })
}

export async function buscarSimulado(cod_simulado) {
  return apiFetch(`${baseUrl}/${cod_simulado}`, { method: 'GET' })
}

export async function criarSimulado(dados) {
  return apiFetch(`${baseUrl}/`, {
    method: 'POST',
    body: dados,
  })
}

export async function atualizarSimulado(cod_simulado, dados) {
  return apiFetch(`${baseUrl}/${cod_simulado}`, {
    method: 'PUT',
    body: dados,
  })
}

export async function deletarSimulado(cod_simulado) {
  return apiFetch(`${baseUrl}/${cod_simulado}`, { method: 'DELETE' })
}

export async function listarQuestoesSimulado(cod_simulado) {
  return apiFetch(`${baseUrl}/${cod_simulado}/questoes`, { method: 'GET' })
}

export async function adicionarQuestaoSimulado(cod_simulado, dados) {
  return apiFetch(`${baseUrl}/${cod_simulado}/questoes`, {
    method: 'POST',
    body: dados,
  })
}

export async function listarResultadosSimulado(cod_simulado) {
  return apiFetch(`${baseUrl}/${cod_simulado}/resultados`, { method: 'GET' })
}

export async function registrarResultadoSimulado(cod_simulado, dados) {
  return apiFetch(`${baseUrl}/${cod_simulado}/resultados`, {
    method: 'POST',
    body: dados,
  })
}
