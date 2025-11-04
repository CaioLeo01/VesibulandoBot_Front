<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true">
        <!-- Cabeçalho -->
        <header class="modal-header">
          <h2>Selecionar Desafio</h2>
          <button class="icon-btn" @click="close" aria-label="Fechar">✕</button>
        </header>

        <!-- Corpo -->
        <section class="modal-body">
          <!-- Filtro de Matéria -->
          <div class="field">
            <label for="materia">Filtrar por Matéria</label>
            <select id="materia" v-model="filtroMateria" class="input">
              <option value="">Todas as matérias</option>
              <option
                v-for="m in materias"
                :key="m.cod_materia"
                :value="m.cod_materia"
              >
                {{ m.nome_materia }}
              </option>
            </select>
          </div>

          <!-- Lista de Simulados -->
          <div v-if="simuladosFiltrados.length" class="simulados-container">
            <div
              v-for="s in simuladosFiltrados"
              :key="s.cod_simulado"
              class="simulado-card"
              @click="selecionarSimulado(s)"
            >
              <div class="simulado-header">
                <h3>{{ s.titulo }}</h3>
                <span
                  class="status"
                  :class="{ ativo: s.ativo, inativo: !s.ativo }"
                >
                  {{ s.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <p class="descricao">{{ s.descricao }}</p>
              <p class="materias">
                <strong>Matérias:</strong>
                {{ s.nomes_materias?.join(', ') || 'Não vinculadas' }}
              </p>
              <p class="data">
                Criado em: {{ formatarData(s.dt_criacao) }}
              </p>
            </div>
          </div>

          <div v-else class="no-results">
            Nenhum simulado encontrado.
          </div>
        </section>

        <!-- Rodapé -->
        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="close">Cancelar</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { listarSimulados } from '@/services/simulado.js'
import { listarMaterias } from '@/services/materias.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'selecionado'])

const materias = ref([])
const simulados = ref([])
const filtroMateria = ref('')
const carregando = ref(false)

const simuladosFiltrados = computed(() => {
  if (!filtroMateria.value) return simulados.value
  return simulados.value.filter(s =>
    s.cod_materias?.includes(Number(filtroMateria.value))
  )
})

function formatarData(dataStr) {
  if (!dataStr) return '-'
  const d = new Date(dataStr)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function carregarDados() {
  try {
    carregando.value = true

    // 🔧 Garantir que o serviço chama o endpoint certo
    const materiasRes = await listarMaterias()
    materias.value = Array.isArray(materiasRes) ? materiasRes : []

    const simuladosRes = await listarSimulados()
    simulados.value = Array.isArray(simuladosRes) ? simuladosRes : []
  } catch (e) {
    console.error('❌ Erro ao carregar dados:', e)
  } finally {
    carregando.value = false
  }
}

function selecionarSimulado(simulado) {
  emit('selecionado', simulado)
  close()
}

function close() {
  emit('update:modelValue', false)
}

/* Recarrega os dados sempre que o modal é aberto */
watch(
  () => props.modelValue,
  (open) => {
    if (open) carregarDados()
  }
)
</script>

<style scoped>
/* === Overlay === */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 1000;
}

/* === Modal === */
.modal {
  background: #1e3a5f;
  border: 1px solid #1e3a5f;
  width: clamp(380px, 95vw, 850px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

/* === Header === */
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
  transition: background 0.2s ease;
}
.icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* === Body === */
.modal-body {
  padding: 24px;
  display: grid;
  gap: 16px;
  color: #fff;
  overflow-y: auto;
}
.field label {
  font-weight: 600;
}

/* === Input e Select estilizados === */
.input {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s;
}

.input:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.input:focus {
  border-color: #4ade80;
  background-color: rgba(255, 255, 255, 0.15);
}

/* === Dropdown (lista de opções) === */
select.input option {
  background-color: #1e3a5f;
  color: #ffffff;
}

select.input option:checked,
select.input option:hover {
  background-color: #4ade80 !important;
  color: #042a18 !important;
}

/* Remove seta padrão (Windows) */
.input::-ms-expand {
  display: none;
}

/* === Cards === */
.simulados-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.simulado-card {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.simulado-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}
.simulado-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.simulado-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
}
.status {
  font-size: 13px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}
.status.ativo {
  background: #4ade80;
  color: #053a20;
}
.status.inativo {
  background: #ef4444;
  color: #fff;
}
.descricao {
  color: #cfe8ff;
  font-size: 14px;
  margin: 6px 0;
}
.materias,
.data {
  font-size: 13px;
  color: #cfe8ff;
}

/* === Footer === */
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
  transition: background 0.2s ease;
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* === Sem resultados === */
.no-results {
  text-align: center;
  color: #cbd5e1;
  font-size: 15px;
}
</style>
