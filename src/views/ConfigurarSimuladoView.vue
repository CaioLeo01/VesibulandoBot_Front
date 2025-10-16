<template>
  <div class="config-simulado">
    <h1>Configurar Simulado</h1>

    <!-- Seleção de Matéria / Bloco -->
    <div class="form-section">
      <label>Selecione a Matéria ou Bloco</label>
      <select v-model="materiaSelecionada" @change="carregarQuestoes">
        <option disabled value="">Selecione...</option>
        <option v-for="opt in opcoesMateria" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Campo título e descrição -->
    <div class="form-section">
      <label for="titulo">Título do Simulado</label>
      <input id="titulo" v-model="titulo" placeholder="Ex: Simulado ENEM 2025" />
    </div>
    <div class="form-section">
      <label for="descricao">Descrição</label>
      <textarea id="descricao" v-model="descricao" placeholder="Breve descrição do simulado"></textarea>
    </div>

    <!-- Lista de Questões -->
    <div v-if="questoes.length" class="questoes-lista">
      <h2>Selecione as Questões</h2>
      <div v-for="q in questoes" :key="q.cod_questao" class="questao-item">
        <input
          type="checkbox"
          :id="'q' + q.cod_questao"
          v-model="questoesSelecionadas"
          :value="q.cod_questao"
        />
        <label :for="'q' + q.cod_questao">{{ q.tx_questao }}</label>
      </div>
    </div>

    <!-- Botão Salvar -->
    <div class="footer">
      <button class="btn btn-salvar" @click="salvarSimulado">Salvar Simulado</button>
      <button class="btn btn-voltar" @click="voltar">Voltar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { listarMaterias } from '@/services/materias.js'
import { listarQuestoes } from '@/services/questao.js'
import {
  criarSimulado,
  adicionarQuestaoSimulado
} from '@/services/simulado.js'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()

const titulo = ref('')
const descricao = ref('')
const materiaSelecionada = ref('')
const questoes = ref([])
const questoesSelecionadas = ref([])

// Opções com blocos pré-definidos + matérias individuais
const materias = ref([])
const opcoesMateria = ref([
  { label: 'Bloco 1 (Ciências Humanas e Linguagens)', value: 'bloco1' },
  { label: 'Bloco 2 (Ciências da Natureza e Matemática)', value: 'bloco2' },
  { label: 'ENEM (Todas as matérias)', value: 'enem' }
])

async function carregarMaterias() {
  try {
    materias.value = await listarMaterias()
    // adiciona também as matérias individuais no dropdown
    materias.value.forEach(m =>
      opcoesMateria.value.push({ label: m.nome_materia, value: m.cod_materia })
    )
  } catch (e) {
    console.error('Erro ao listar matérias:', e)
    toast.error('Erro ao carregar matérias.')
  }
}
carregarMaterias()

async function carregarQuestoes() {
  questoes.value = []
  questoesSelecionadas.value = []

  try {
    let materiasFiltro = []

    if (materiaSelecionada.value === 'bloco1') {
      materiasFiltro = [4, 2] // Humanas e Linguagens
    } else if (materiaSelecionada.value === 'bloco2') {
      materiasFiltro = [3, 1] // Natureza e Matemática
    } else if (materiaSelecionada.value === 'enem') {
      materiasFiltro = [1, 2, 3, 4]
    } else {
      materiasFiltro = [materiaSelecionada.value]
    }

    const todasQuestoes = await listarQuestoes()
    questoes.value = todasQuestoes.filter(q =>
      materiasFiltro.includes(q.cod_materia)
    )
  } catch (e) {
    console.error('Erro ao listar questões:', e)
    toast.error('Erro ao carregar questões.')
  }
}

async function salvarSimulado() {
  if (!titulo.value || !materiaSelecionada.value) {
    toast.warning('Preencha o título e selecione uma matéria.')
    return
  }

  try {
    const payload = {
      titulo: titulo.value,
      descricao: descricao.value,
      cod_materia:
        typeof materiaSelecionada.value === 'number'
          ? materiaSelecionada.value
          : 0,
      ativo: true
    }

    // 1️⃣ Cria o simulado
    const novoSimulado = await criarSimulado(payload)
    toast.success('Simulado criado com sucesso!')

    // 2️⃣ Associa as questões
    for (const q of questoesSelecionadas.value) {
      await adicionarQuestaoSimulado(novoSimulado.id || novoSimulado.cod_simulado, {
        cod_questao: q
      })
    }

    toast.success('Questões adicionadas com sucesso!')
    router.push('/admin')
  } catch (e) {
    console.error('Erro ao salvar simulado:', e)
    toast.error('Falha ao criar o simulado.')
  }
}

function voltar() {
  router.push('/admin')
}
</script>

<style scoped>
.config-simulado {
  max-width: 900px;
  margin: 40px auto;
  background: #1e3a5f;
  color: white;
  border-radius: 16px;
  padding: 24px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
  font-weight: 800;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

select,
input,
textarea {
  border-radius: 8px;
  border: 1px solid #2a4c70;
  background: #0e2a3e;
  color: white;
  padding: 10px 12px;
  font-size: 14px;
}

.questoes-lista {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px;
  margin-top: 20px;
}

.questao-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 8px;
}

label {
  line-height: 1.4;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-salvar {
  background-color: #4ade80;
  color: #0e2a3e;
}

.btn-voltar {
  background-color: #f87171;
  color: white;
}
</style>
