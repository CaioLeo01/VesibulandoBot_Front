import { apiFetch } from './api.js'

export async function sendMessageToBot(text) {
  const payload = await apiFetch('/chat/perguntar', {
    method: 'POST',
    body: { pergunta: text },
  })

  const reply = payload?.resposta
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('Resposta invalida do servidor.')
  }

  return reply
}
