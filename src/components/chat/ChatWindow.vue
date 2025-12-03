<template>
  <section class="chat">
    <header class="chat-header">
      <h2>APROVABOT</h2>

      <div class="header-right">
        <button class="export-btn" @click="exportConversation">
          Exportar
        </button>

        <span class="status" :class="status">
          <i v-if="status === 'digitando'" class="fa-solid fa-comment-dots"></i>
          {{ label }}
        </span>
      </div>
    </header>

    <div class="messages" ref="listEl">
      <div
        v-for="(m, i) in messages"
        :key="i"
        class="msg"
        :class="m.from"
      >
        <div class="bubble">
          <p class="text">{{ m.text }}</p>
          <span class="time">{{ formatTime(m.at) }}</span>
        </div>
      </div>
    </div>

    <form class="composer" @submit.prevent="submit">
      <input
        v-model.trim="draft"
        type="text"
        placeholder="Digite sua pergunta..."
        :disabled="sending"
        @input="onTyping"
      />
      <button type="submit" :disabled="sending || !draft">Enviar</button>
    </form>
  </section>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  sending: { type: Boolean, default: false }
})
const emit = defineEmits(['send'])

const draft = ref('')
const listEl = ref(null)
const status = ref('enviado')

function submit() {
  if (!draft.value) return
  emit('send', draft.value)
  draft.value = ''
  status.value = 'enviando'
}

function onTyping() {
  status.value = draft.value ? 'digitando' : 'enviado'
}

watch(() => props.sending, (val) => {
  if (val) {
    status.value = 'enviando'
  } else if (!draft.value) {
    status.value = 'enviado'
  }
})

watch(() => props.messages.length, async () => {
  await nextTick()
  autoScroll()
})

function autoScroll() {
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function two(n) { return n.toString().padStart(2, '0') }
function formatTime(ts) {
  const d = new Date(ts)
  return `${two(d.getHours())}:${two(d.getMinutes())}`
}

const label = computed(() => {
  switch (status.value) {
    case 'digitando': return 'Digitando'
    case 'enviando': return 'Enviando...'
    default: return 'Enviado'
  }
})

function exportConversation() {
  if (!props.messages.length) return alert('Nenhuma conversa para exportar.')
  const content = props.messages
    .map(m => (m.from === 'user' ? `🧑 Aluno: ${m.text}` : `🤖 IA: ${m.text}`))
    .join('\n\n')

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversa_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.chat {
  background: #e5eaf1;
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px 0;
  border-bottom: 1px solid #d1d5db;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-header h2 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

/* Botão de exportar no topo */
.export-btn {
  background: #1c3d56;
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #2d4a63;
  transform: translateY(-1px);
}

.status {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
}

.status.digitando { color: #2563eb; }
.status.enviando { color: #f59e0b; }
.status.enviado { color: #10b981; }

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.msg { display: flex; width: 100%; }
.msg.user { justify-content: flex-end; }
.msg.bot { justify-content: flex-start; }

.bubble {
  display: inline-block;
  background: #f3f4f6;
  border-radius: 16px;
  padding: 12px 16px;
  word-wrap: break-word;
  word-break: break-word;
  max-width: 75%;
  min-width: 60px;
}
.msg.user .bubble {
  background: #069483;
  color: white;
}

.text {
  margin: 0 0 6px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
}

.time {
  font-size: 11px;
  opacity: 0.7;
  display: block;
  text-align: right;
  margin-top: 4px;
}

.composer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #d1d5db;
  flex-shrink: 0;
}

.composer input {
  flex: 1;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.composer input:focus { border-color: #1c3d56; }
.composer input:disabled { background-color: #f9fafb; color: #6b7280; cursor: not-allowed; }

.composer button {
  background: #1c3d56;
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.composer button:hover:not(:disabled) { background: #2d4a63; transform: translateY(-1px); }
.composer button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

/* Scrollbar */
.messages::-webkit-scrollbar { width: 8px; }
.messages::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 4px; }
.messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
.messages::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.messages::-webkit-scrollbar-thumb:active { background: #64748b; }
.messages { scrollbar-width: thin; scrollbar-color: #cbd5e1 rgba(0, 0, 0, 0.05); }
</style>
