import { apiFetch } from './api.js'

const baseUrl = '/questoes'

export async function listarQuestoes() {
    return apiFetch(`${baseUrl}/`, { method: 'GET' })
}

export async function buscarQuestao(cod_questao) {
    return apiFetch(`${baseUrl}/${cod_questao}`, { method: 'GET' })
}

export async function criarQuestao(dados) {
    return apiFetch(`${baseUrl}/`, {
        method: 'POST',
        body: dados,
    })
}

export async function atualizarQuestao(cod_questao, dados) {
    return apiFetch(`${baseUrl}/${cod_questao}`, {
        method: 'PUT',
        body: dados,
    })
}

export async function deletarQuestao(cod_questao) {
    return apiFetch(`${baseUrl}/${cod_questao}`, { method: 'DELETE' })
}

export async function listarQuestoesPorMateria(cod_materia) {
    return apiFetch(`${baseUrl}/materia/${cod_materia}`, { method: 'GET' })
}

export async function importarEnem(anos, materias) {
    return apiFetch(`${baseUrl}/importar-enem`, {
        method: 'POST',
        body: { anos, materias }
    })
}
