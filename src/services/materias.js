import { apiFetch } from './api.js'

const baseUrl = '/materias'

export async function listarMaterias() {
  return apiFetch(`${baseUrl}/`, { method: 'GET' })
}

export async function buscarMateria(cod_materia) {
  return apiFetch(`${baseUrl}/${cod_materia}`, { method: 'GET' })
}

export async function criarMateria(nome_materia) {
  return apiFetch(`${baseUrl}/`, {
    method: 'POST',
    body: { nome_materia },
  })
}

export async function atualizarMateria(cod_materia, nome_materia) {
  return apiFetch(`${baseUrl}/${cod_materia}`, {
    method: 'PUT',
    body: { nome_materia },
  })
}

export async function deletarMateria(cod_materia) {
  return apiFetch(`${baseUrl}/${cod_materia}`, { method: 'DELETE' })
}
