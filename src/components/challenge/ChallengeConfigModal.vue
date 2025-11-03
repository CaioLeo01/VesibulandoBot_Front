<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true">
        <!-- Cabeçalho -->
        <header class="modal-header">
          <h2>Cadastrar Simulado</h2>
          <button class="icon-btn" @click="close" aria-label="Fechar">✕</button>
        </header>

        <!-- Corpo -->
        <section class="modal-body">
          <!-- Título -->
          <div class="field">
            <label for="titulo">Título</label>
            <input
              id="titulo"
              v-model="local.titulo"
              placeholder="Ex: Simulado ENEM 2025"
              class="input"
            />
          </div>

          <!-- Descrição -->
          <div class="field">
            <label for="descricao">Descrição</label>
            <textarea
              id="descricao"
              v-model="local.descricao"
              rows="3"
              placeholder="Breve descrição..."
              class="input"
            ></textarea>
          </div>

          <!-- Matérias -->
          <div class="field">
            <label>Matéria(s)</label>
            <div class="materias-list">
              <label
                v-for="m in materias"
                :key="m.cod_materia"
                class="checkbox-line"
              >
                <input
                  type="checkbox"
                  :value="m.cod_materia"
                  v-model="local.materiasSelecionadas"
                  @change="carregarQuestoes"
                />
                <span>{{ m.nome_materia }}</span>
              </label>
            </div>
            <small class="hint">Selecione uma ou mais matérias</small>
          </div>

          <!-- Questões -->
          <div v-if="questoesFiltradas.length" class="field">
            <label>Selecione até 40 questões</label>
            <div class="questoes-list">
              <label
                v-for="q in questoesFiltradas"
                :key="q.cod_questao"
                class="checkbox-line"
              >
                <input
                  type="checkbox"
                  :value="q.cod_questao"
                  v-model="local.questoesSelecionadas"
                  :disabled="isLimiteAtingido && !local.questoesSelecionadas.includes(q.cod_questao)"
                />
                <span>{{ q.tx_questao }}</span>
              </label>
            </div>
            <p class="hint">
              {{ local.questoesSelecionadas.length }}/40 selecionadas
            </p>
          </div>
        </section>

        <!-- Rodapé -->
        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="close">Cancelar</button>
          <button
            class="btn btn-accent"
            :disabled="!podeSalvar"
            @click="salvar"
          >
            Salvar Simulado
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { listarMaterias } from '@/services/materias.js'
import { listarQuestoesPorMateria } from '@/services/questao.js'
import { criarSimulado, adicionarQuestaoSimulado } from '@/services/simulado.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'salvo'])

const materias = ref([])
const questoes = ref([])
const carregando = ref(false)

const local = reactive({
  titulo: '',
  descricao: '',
  materiasSelecionadas: [],
  questoesSelecionadas: [],
})

const questoesFiltradas = computed(() => {
  if (!local.materiasSelecionadas.length) return []
  return questoes.value.filter(q =>
    local.materiasSelecionadas.includes(q.cod_materia)
  )
})

const isLimiteAtingido = computed(() => local.questoesSelecionadas.length >= 40)
const podeSalvar = computed(() =>
  local.titulo.trim() &&
  local.descricao.trim() &&
  local.materiasSelecionadas.length > 0 &&
  local.questoesSelecionadas.length > 0 &&
  local.questoesSelecionadas.length <= 40
)

/* === Métodos === */
async function carregarMaterias() {
  try {
    carregando.value = true
    materias.value = await listarMaterias()
  } catch (e) {
    console.error('❌ Erro ao carregar matérias:', e)
  } finally {
    carregando.value = false
  }
}

async function carregarQuestoes() {
  try {
    questoes.value = []
    for (const cod of local.materiasSelecionadas) {
      const lista = await listarQuestoesPorMateria(cod)
      if (Array.isArray(lista)) questoes.value.push(...lista)
    }
  } catch (e) {
    console.error('❌ Erro ao carregar questões:', e)
  }
}

async function salvar() {
  try {
    carregando.value = true

    // 🔹 Envia `cod_materias` (plural) conforme o backend novo
    const sim = await criarSimulado({
      titulo: local.titulo,
      descricao: local.descricao,
      ativo: true,
      cod_materias: local.materiasSelecionadas
    })

    const idSimulado = sim?.cod_simulado
    if (!idSimulado) {
      alert('Erro ao criar simulado. Verifique o console.')
      return
    }

    // 🔹 Adiciona as questões ao simulado
    for (const cod_questao of local.questoesSelecionadas) {
      await adicionarQuestaoSimulado(idSimulado, { cod_questao })
    }

    emit('salvo', sim)
    close()
  } catch (e) {
    console.error('❌ Erro ao salvar simulado:', e)
    alert('Erro ao salvar simulado. Veja o console para detalhes.')
  } finally {
    carregando.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, open => {
  if (open) carregarMaterias()
  else {
    Object.assign(local, {
      titulo: '',
      descricao: '',
      materiasSelecionadas: [],
      questoesSelecionadas: [],
    })
    questoes.value = []
  }
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 1000;
}
.modal {
  background: #1e3a5f;
  border: 1px solid #1e3a5f;
  width: clamp(380px, 95vw, 850px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.modal-header h2 {
  color: #fff;
  font-size: 22px;
  margin: 0;
}
.icon-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}
.modal-body {
  padding: 24px 24px;
  display: grid;
  gap: 16px;
}
.field {
  color: #fff;
  display: grid;
  gap: 8px;
}
.input,
textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  padding: 10px 14px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
}
textarea {
  resize: none;
}
.hint {
  color: #cfe8ff;
  font-size: 12px;
}
.materias-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
  padding: 10px;
  border-radius: 10px;
}
.questoes-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 10px;
  border-radius: 10px;
}
.checkbox-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #fff;
  font-size: 14px;
}
.checkbox-line input[type='checkbox'] {
  accent-color: #4ade80;
  transform: scale(1.1);
  margin-top: 2px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.btn {
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
.btn-accent {
  background: #4ade80;
  border: 1px solid #4ade80;
  color: #fff;
}
.btn-accent:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
