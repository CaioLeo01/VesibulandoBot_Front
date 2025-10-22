<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cfg-title">
        <header class="modal-header">
          <h2 id="cfg-title">Adicionar Nova Questão</h2>
          <button class="icon-btn" @click="close" aria-label="Fechar">✕</button>
        </header>

        <section class="modal-body">
          <div class="field-row">
            <div class="field">
              <label for="m-simulado">Matéria</label>
              <select id="m-simulado" v-model="materiaSelecionada">
                <option v-for="opt in materias" :key="opt.cod_materia" :value="opt.cod_materia">
                  {{ opt.nome_materia }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="ano">Ano</label>
              <select id="ano" v-model="anoSelecionado">
                <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
              </select>
            </div>
          </div>
          <div class="field-row">
            <div class="field full">
              <label for="tx-questao">Enunciado da Questão</label>
              <textarea
                id="tx-questao"
                v-model="textoQuestao"
                placeholder="Digite o enunciado completo da questão..."
              ></textarea>
            </div>
          </div>
          <div class="field-row alternativas">
            <div
              v-for="letra in ['A', 'B', 'C', 'D', 'E']"
              :key="letra"
              class="alternativa-item"
            >
              <label :for="'alt-' + letra">{{ letra }}:</label>
              <input
                :id="'alt-' + letra"
                type="text"
                v-model="alternativas[letra]"
                placeholder="Digite a alternativa"
              />
              <input
                type="checkbox"
                v-model="respostaCorreta"
                :value="letra"
                :checked="respostaCorreta === letra"
                @change="respostaCorreta = letra"
                title="Marcar como correta"
              />
            </div>
          </div>

        </section>

        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="close">Cancelar</button>
          <button class="btn btn-accent" @click="apply">Salvar</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listarMaterias } from '@/services/materias.js'
import { criarQuestao } from '@/services/questao.js'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'apply'])

const materias = ref([])
const materiaSelecionada = ref(null)
const anoSelecionado = ref(new Date().getFullYear())
const anos = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i)

const alternativas = ref({
  A: '',
  B: '',
  C: '',
  D: '',
  E: ''
})

const respostaCorreta = ref(null)

const textoQuestao = ref('')

onMounted(async () => {
  try {
    materias.value = await listarMaterias()
  } catch (e) {
    toast.error('Erro ao carregar matérias.', 'ERRO')
  }
})

function close() {
  emit('update:modelValue', false)
}

async function apply() {
  try {
    if (!materiaSelecionada.value || !textoQuestao.value || !respostaCorreta.value) {
      toast.warning('Preencha todos os campos obrigatórios.')
      return;
    }

    const payload = {
      tx_questao: textoQuestao.value,
      ano_questao: anoSelecionado.value,
      cod_materia: materiaSelecionada.value,
      tx_resposta_correta: respostaCorreta.value,
      alternativas: Object.entries(alternativas.value).map(([letra, texto]) => ({
        tx_letra: letra,
        tx_texto: texto || ''
      }))
    }

    await criarQuestao(payload)

    toast.success('Questão criada com sucesso!', 'SUCESSO')
    emit('apply')
    resetForm()
    close()
  } catch (error) {
    console.error('Erro ao criar questão:', error)
    toast.error('Erro ao salvar a questão.', 'ERRO')
  }
}

function resetForm() {
  materiaSelecionada.value = null
  anoSelecionado.value = new Date().getFullYear()
  textoQuestao.value = ''
  respostaCorreta.value = null
  alternativas.value = { A: '', B: '', C: '', D: '', E: '' }
}
</script>

<style scoped>
/* ===== Paleta ===== */
:root, :host{
  --c-primary:#1E3A5F;
  --c-accent:#4ADE80;
  --c-bg:#F9FAFB;
  --c-surface:#FFFFFF;
  --c-text:#1F2937;
  --glass: rgba(30,58,95,.92);
  --bd-soft: rgba(255,255,255,.16);
  --bd-strong: rgba(255,255,255,.26);
  --shadow: 0 30px 80px rgba(2,6,23,.35);
}

/* ===== Overlay / Modal ===== */
.overlay{
  position:fixed; inset:0; background:rgba(2,6,23,.55);
  display:grid; place-items:center; padding:24px; z-index:1000;
}
.modal{
  background: #1E3A5F !important;
  border: 1px solid #1E3A5F;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  width: clamp(360px, 92vw, 820px);
  box-sizing: border-box;
  border-radius: 24px;
}

/* ===== Header ===== */
.modal-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px;
  border-bottom:1px solid var(--bd-soft);
}
.modal-header h2{
  margin:0; font-size:28px; font-weight:800; letter-spacing:.2px; color:#fcfcfc;
}
.icon-btn{
  background:transparent; color:#ffffff; border:1px solid var(--bd-soft);
  width:36px; height:36px; border-radius:8px; cursor:pointer;
}
.icon-btn:hover{ background:rgba(255,255,255,.06); }

/* ===== Body ===== */
.modal-body{ padding:20px 24px; display:grid; gap:18px; }
.field-row {display: flex; justify-content: space-between; gap: 16px;}
.field{ display:flex; flex-direction: column; flex: 1; gap:10px; }
.field label{ color:#ffffff; font-size:14px; }

/* ===== Alternativas ===== */
.alternativas {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.alternativa-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alternativa-item label {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  width: 18px;
  text-align: right;
}

.alternativa-item input[type="text"] {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--bd-strong);
  background: #1E3A5F;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.alternativa-item input[type="text"]::placeholder {
  color: rgba(255,255,255,0.5);
}

.alternativa-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4ADE80;
}

/* ===== Enunciado ===== */
.field-row {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
}

.field.full {
  flex: 1 1 100%;
}

.field label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.field select,
.field textarea {
  width: 95%;
  padding: 10px 14px;
  border-radius: 12px;
  border:1px solid #2A4C70;
  background: #1E3A5F;
  color: #ffffff;
  font-size: 14px;
  resize: none;
  outline: none;
}

.field textarea {
  min-height: 100px;
  line-height: 1.5;
}

/* Alternativas */
.alternativas {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.alternativa-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alternativa-item label {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  width: 18px;
  text-align: right;
}

.alternativa-item input[type="text"] {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border:1px solid #2A4C70;
  background: #1E3A5F;
  color: #fff;
  font-size: 14px;
  outline: none;
}

.alternativa-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4ADE80;
}

/* Ano */
.year-row{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.year-arrow{
  width:40px; height:40px; border-radius:10px; cursor:pointer;
  background:rgba(255,255,255,.08); color:#E7F0FF; border:1px solid var(--bd-strong);
  font-size:20px; font-weight:800;
}
.year-arrow:disabled{ opacity:.5; cursor:not-allowed; }
.year-box{
  min-width:120px; text-align:center;
  background:#FFFFFF; color:var(--c-text);
  border-radius:10px; padding:10px 14px; font-weight:800; letter-spacing:.5px;
}

/* ===== Footer ===== */
.modal > .modal-footer{
  display: flex !important;
  justify-content: flex-end !important;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--bd-soft);
  width: 94%;
}
.btn{
  border-radius:12px; padding:10px 16px; font-weight:700; font-size:14px; cursor:pointer;
  border:1px solid var(--bd-strong); background:rgba(255,255,255,.08); color:#E7F0FF;
}
.btn-ghost{ background:rgba(255,255,255,.08); }

/* Botão Iniciar (verde) */
.modal-footer .btn-accent{
  --btn-green: #4ADE80;       /* base */
  --btn-green-hover: #16A34A; /* hover */
  background: var(--btn-green);
  color: #FFFFFF;
  border: 1px solid var(--btn-green);
  box-shadow: none;
  transition: background-color .2s ease, border-color .2s ease, transform .05s ease;
}
.modal-footer .btn-accent:hover{
  background: var(--btn-green-hover);
  border-color: var(--btn-green-hover);
}
.modal-footer .btn-accent:active{ transform: translateY(1px); }
.modal-footer .btn-accent:focus-visible{
  outline: 3px solid rgba(74, 222, 128, 0.4);
  outline-offset: 2px;
}
</style>
