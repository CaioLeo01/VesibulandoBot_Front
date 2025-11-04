import { apiFetch } from './api.js'

export async function sendMessageToBot(text) {
  const payload = await apiFetch('/chat/message', {
    method: 'POST',
    body: { message: text },
  })

  const reply = payload?.message
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('Resposta invalida do servidor.')
  }

  return reply
}
