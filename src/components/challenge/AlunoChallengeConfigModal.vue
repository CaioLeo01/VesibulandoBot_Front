<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true">
        <!-- Cabeçalho -->
        <header class="modal-header">
          <h2>Gerar Simulado</h2>
          <button class="icon-btn" @click="close" aria-label="Fechar">✕</button>
        </header>

        <!-- Corpo -->
        <section class="modal-body">
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

          <!-- Quantidade -->
          <div class="field">
            <label for="qtd">Quantidade de questões (1 a 40)</label>
            <input
              id="qtd"
              type="number"
              class="input"
              min="1"
              max="40"
              v-model.number="local.qtdQuestoes"
            />
            <small class="hint">
              Banco disponível para o filtro atual: {{ totalQuestoesDisponiveis }}
            </small>
          </div>
        </section>

        <!-- Rodapé -->
        <footer class="modal-footer">
          <button class="btn" @click="close">Cancelar</button>
          <button
            class="btn btn-accent"
            :disabled="!podeSalvar || carregando"
            @click="salvar"
          >
            Gerar
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
import { getUsuarioLogado } from '@/services/usuario.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'salvo'])

const materias = ref([])
const questoes = ref([])
const carregando = ref(false)
const usuario = ref(null)

const local = reactive({
  materiasSelecionadas: [],
  qtdQuestoes: 10,
})

const totalQuestoesDisponiveis = computed(() => questoes.value.length)

const podeSalvar = computed(() => {
  const qtd = Number(local.qtdQuestoes || 0)
  return (
    local.materiasSelecionadas.length > 0 &&
    qtd >= 1 &&
    qtd <= 40 &&
    totalQuestoesDisponiveis.value > 0
  )
})

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

async function carregarUsuario() {
  try {
    usuario.value = await getUsuarioLogado()
  } catch (e) {
    console.error('❌ Erro ao obter usuário logado:', e)
  }
}

async function carregarQuestoes() {
  try {
    carregando.value = true

    const pool = []

    for (const cod of local.materiasSelecionadas) {
      const resp = await listarQuestoesPorMateria(cod)

      let listaMateria = []

      if (Array.isArray(resp)) {
        listaMateria = resp
      } else if (resp && typeof resp === 'object') {
        const prof = Array.isArray(resp.professor) ? resp.professor : []
        const enem = Array.isArray(resp.enem) ? resp.enem : []
        listaMateria = [...prof, ...enem]
      }

      pool.push(...listaMateria)
    }

    const seen = new Set()
    questoes.value = pool.filter(q => {
      if (!q || typeof q.cod_questao === 'undefined') return false
      if (seen.has(q.cod_questao)) return false
      seen.add(q.cod_questao)
      return true
    })

  } catch (e) {
    console.error('❌ Erro ao carregar questões:', e)
  } finally {
    carregando.value = false
  }
}

function formatarDataDDMM(d = new Date()) {
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

function embaralhar(array) {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function salvar() {
  try {
    carregando.value = true

    const nome = usuario.value?.nome_usuario || 'Aluno'
    const data = formatarDataDDMM()
    const tituloAuto = `Simulado ${nome} ${data}`
    const descricaoAuto = `Simulado ${nome} ${data}`

    const sim = await criarSimulado({
      titulo: tituloAuto,
      descricao: descricaoAuto,
      ativo: true,
      cod_materias: local.materiasSelecionadas,
    })

    const idSimulado = sim?.cod_simulado
    if (!idSimulado) {
      alert('Erro ao criar simulado. Verifique o console.')
      return
    }

    const qtdSolicitada = Math.max(
      1,
      Math.min(Number(local.qtdQuestoes || 1), 40)
    )
    const pool = embaralhar(questoes.value)
    const selecionadas = pool.slice(0, Math.min(qtdSolicitada, pool.length))

    for (const q of selecionadas) {
      await adicionarQuestaoSimulado(idSimulado, { cod_questao: q.cod_questao })
    }

    emit('salvo', {
      ...sim,
      quantidade: selecionadas.length,
    })
    close()
  } catch (e) {
    console.error('❌ Erro ao gerar simulado:', e)
    alert('Erro ao gerar simulado. Veja o console para detalhes.')
  } finally {
    carregando.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  async open => {
    if (open) {
      await Promise.all([carregarUsuario(), carregarMaterias()])
      Object.assign(local, {
        materiasSelecionadas: [],
        qtdQuestoes: 10,
      })
      questoes.value = []
    } else {
      questoes.value = []
    }
  }
)
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
  max-height: 90vh;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: grid;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
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
