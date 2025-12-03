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
            <div class="field">
              <label for="bncc">Código BNCC</label>
              <select id="bncc" v-model="bnccSelecionado">
                <option value="">Selecione...</option>
                <option
                  v-for="item in bnccList"
                  :key="item.codigo"
                  :value="item.codigo"
                >
                  {{ item.codigo }} – {{ item.descricao }}
                </option>
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

const bnccList = [
  /* --- Linguagens e suas Tecnologias (LP, ART, ING, EF) --- */
  { codigo:"EM13LP01", descricao:"Analisar e compreender textos multissemióticos, reconhecendo seus usos e funções sociais." },
  { codigo:"EM13LP02", descricao:"Produzir textos orais, escritos e multissemióticos para diferentes propósitos e contextos." },
  { codigo:"EM13LP03", descricao:"Analisar estratégias argumentativas em diferentes gêneros e mídias." },
  { codigo:"EM13LP04", descricao:"Avaliar a credibilidade de fontes e combater a desinformação." },
  { codigo:"EM13LP05", descricao:"Empregar processos de revisão e edição em textos." },
  { codigo:"EM13LP06", descricao:"Compreender relações entre literatura, identidade, cultura e sociedade." },
  { codigo:"EM13LP07", descricao:"Produzir textos literários autorais ou adaptados." },
  { codigo:"EM13LP08", descricao:"Analisar obras literárias em diferentes contextos históricos e culturais." },
  { codigo:"EM13LP09", descricao:"Apreciar produções estéticas e culturais diversas." },
  { codigo:"EM13LP10", descricao:"Analisar criticamente discursos relacionados a temas contemporâneos." },

  /* Artes */
  { codigo:"EM13AR01", descricao:"Experimentar processos de criação artística em diferentes linguagens." },
  { codigo:"EM13AR02", descricao:"Analisar obras artísticas considerando contexto histórico e social." },
  { codigo:"EM13AR03", descricao:"Produzir obras autorais nas linguagens visuais, cênicas ou musicais." },
  { codigo:"EM13AR04", descricao:"Dialogar criticamente com manifestações culturais diversas." },

  /* Inglês */
  { codigo:"EM13ING01", descricao:"Compreender textos orais e escritos em língua inglesa em diferentes contextos." },
  { codigo:"EM13ING02", descricao:"Utilizar inglês em situações comunicativas diversas." },
  { codigo:"EM13ING03", descricao:"Analisar aspectos culturais de países de língua inglesa." },
  { codigo:"EM13ING04", descricao:"Produzir textos orais e escritos em inglês com clareza e adequação." },

  /* Educação Física */
  { codigo:"EM13EF01", descricao:"Analisar práticas corporais em diferentes contextos socioculturais." },
  { codigo:"EM13EF02", descricao:"Praticar atividades corporais visando saúde e bem-estar." },
  { codigo:"EM13EF03", descricao:"Compreender relações entre corpo, identidade e sociedade." },

  /* --- Matemática e suas Tecnologias --- */
  { codigo:"EM13MAT101", descricao:"Reconhecer e analisar padrões e regularidades." },
  { codigo:"EM13MAT102", descricao:"Resolver problemas utilizando raciocínio lógico e algébrico." },
  { codigo:"EM13MAT103", descricao:"Interpretar situações por meio de funções." },
  { codigo:"EM13MAT104", descricao:"Compreender progressões e relações numéricas." },
  { codigo:"EM13MAT201", descricao:"Resolver problemas que envolvam funções algébricas." },
  { codigo:"EM13MAT202", descricao:"Modelar fenômenos utilizando funções." },
  { codigo:"EM13MAT203", descricao:"Analisar gráficos e tabelas em diferentes contextos." },
  { codigo:"EM13MAT301", descricao:"Compreender conceitos de geometria plana e espacial." },
  { codigo:"EM13MAT302", descricao:"Resolver problemas com grandezas e medidas." },
  { codigo:"EM13MAT303", descricao:"Analisar formas geométricas e transformações." },
  { codigo:"EM13MAT401", descricao:"Interpretar e produzir argumentos estatísticos." },
  { codigo:"EM13MAT402", descricao:"Aplicar probabilidade em situações reais." },
  { codigo:"EM13MAT403", descricao:"Avaliar riscos e incertezas em problemas do cotidiano." },

  /* --- Ciências da Natureza (Física, Química, Biologia) --- */
  
  /* Física */
  { codigo:"EM13FIS101", descricao:"Compreender movimentos e suas representações." },
  { codigo:"EM13FIS102", descricao:"Analisar interações e forças no cotidiano." },
  { codigo:"EM13FIS201", descricao:"Aplicar conceitos de energia em situações diversas." },
  { codigo:"EM13FIS202", descricao:"Compreender processos ondulatórios e propagação." },
  { codigo:"EM13FIS301", descricao:"Analisar fenômenos eletromagnéticos." },
  { codigo:"EM13FIS302", descricao:"Compreender tecnologias que utilizam eletricidade." },

  /* Química */
  { codigo:"EM13QUI101", descricao:"Compreender propriedades e transformações da matéria." },
  { codigo:"EM13QUI102", descricao:"Analisar reações químicas em contextos variados." },
  { codigo:"EM13QUI201", descricao:"Aplicar conceitos de química para resolver problemas ambientais." },
  { codigo:"EM13QUI202", descricao:"Examinar compostos e suas aplicações cotidianas." },
  { codigo:"EM13QUI301", descricao:"Avaliar impactos de processos químicos no ambiente." },

  /* Biologia */
  { codigo:"EM13BIO101", descricao:"Compreender mecanismos celulares e genéticos." },
  { codigo:"EM13BIO102", descricao:"Analisar processos evolutivos e biodiversidade." },
  { codigo:"EM13BIO201", descricao:"Compreender relações ecológicas." },
  { codigo:"EM13BIO202", descricao:"Avaliar impactos humanos nos ecossistemas." },
  { codigo:"EM13BIO301", descricao:"Compreender sistemas do corpo humano." },
  { codigo:"EM13BIO302", descricao:"Relacionar hábitos de vida à saúde." },
  { codigo:"EM13BIO303", descricao:"Avaliar tecnologias aplicadas à saúde e biotecnologia." },

  /* --- Ciências Humanas (História, Geografia, Sociologia, Filosofia) --- */

  /* História */
  { codigo:"EM13CHS101", descricao:"Compreender temporalidades históricas e suas transformações." },
  { codigo:"EM13CHS102", descricao:"Analisar processos históricos em diferentes contextos." },
  { codigo:"EM13CHS103", descricao:"Relacionar fatos históricos a questões contemporâneas." },
  { codigo:"EM13CHS104", descricao:"Analisar criticamente discursos e narrativas históricas." },

  /* Geografia */
  { codigo:"EM13CHS201", descricao:"Interpretar fenômenos naturais e sua relação com a sociedade." },
  { codigo:"EM13CHS202", descricao:"Analisar dinâmicas territoriais e espaciais." },
  { codigo:"EM13CHS203", descricao:"Compreender processos econômicos globais." },
  { codigo:"EM13CHS204", descricao:"Avaliar problemas ambientais e suas causas." },

  /* Sociologia */
  { codigo:"EM13CHS301", descricao:"Compreender a formação das estruturas sociais." },
  { codigo:"EM13CHS302", descricao:"Analisar relações de poder e desigualdade." },
  { codigo:"EM13CHS303", descricao:"Avaliar fenômenos culturais e identitários." },

  /* Filosofia */
  { codigo:"EM13CHS401", descricao:"Refletir sobre questões éticas e morais." },
  { codigo:"EM13CHS402", descricao:"Analisar argumentações filosóficas." },
  { codigo:"EM13CHS403", descricao:"Compreender diferentes correntes de pensamento." },
];
const bnccSelecionado = ref("")

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
      bncc: bnccSelecionado.value,
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
  bnccSelecionado.value = ""
}
</script>

<style scoped>
:root, :host {
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
  position:fixed;
  inset:0;
  background:rgba(2,6,23,.55);
  display:grid;
  place-items:center;
  padding:24px;
  z-index:1000;
}

.modal{
  background:#1E3A5F !important;
  border:1px solid #1E3A5F;
  width:clamp(360px, 92vw, 820px);
  max-height:90vh;              /* limite na viewport */
  border-radius:24px;
  box-shadow:var(--shadow);
  box-sizing:border-box;
  display:flex;                 /* igual ao primeiro modal */
  flex-direction:column;
  overflow:hidden;              /* esconde barra externa */
}

/* ===== Header ===== */
.modal-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:20px 24px;
  border-bottom:1px solid var(--bd-soft);
}
.modal-header h2{
  margin:0;
  font-size:22px;
  font-weight:800;
  letter-spacing:.2px;
  color:#fcfcfc;
}
.icon-btn{
  background:transparent;
  color:#ffffff;
  border:1px solid var(--bd-soft);
  width:36px;
  height:36px;
  border-radius:8px;
  cursor:pointer;
}
.icon-btn:hover{
  background:rgba(255,255,255,.06);
}

/* ===== Body com scroll interno ===== */
.modal-body{
  flex:1;                       /* ocupa o que sobrar entre header e footer */
  overflow-y:auto;              /* scroll só aqui */
  padding:20px 24px;
  display:grid;
  gap:18px;
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,0.3) transparent;
}
.modal-body::-webkit-scrollbar{
  width:8px;
}
.modal-body::-webkit-scrollbar-thumb{
  background:rgba(255,255,255,0.3);
  border-radius:4px;
}

/* Campos */
.field-row {
  display:flex;
  gap:16px;
  align-items:flex-start;
  flex-wrap:wrap;
}
.field{
  display:flex;
  flex-direction:column;
  flex:1;
  gap:8px;
}
.field.full{
  flex:1 1 100%;
}
.field label{
  color:#ffffff;
  font-size:14px;
  font-weight:600;
}
.field select{
  width:100%;
  padding:10px 14px;
  border-radius:12px;
  border:1px solid #2A4C70;
  background:#1E3A5F;
  color:#ffffff;
  font-size:14px;
  outline:none;
}
.field textarea{
  width:100%;
  padding:10px 14px;
  border-radius:12px;
  border:1px solid #2A4C70;
  background:#1E3A5F;
  color:#ffffff;
  font-size:14px;
  resize:none;
  outline:none;
  min-height:100px;
  line-height:1.5;
}

/* BNCC select full width */
#bncc{
  width:100% !important;
}

/* ===== Alternativas ===== */
.alternativas {
  display:grid;
  gap:10px;
  margin-top:10px;
}
.alternativa-item{
  display:flex;
  align-items:center;
  gap:10px;
}
.alternativa-item label{
  color:#fff;
  font-size:14px;
  font-weight:500;
  width:18px;
  text-align:right;
}
.alternativa-item input[type="text"]{
  flex:1;
  padding:8px 10px;
  border-radius:8px;
  border:1px solid var(--bd-strong);
  background:#1E3A5F;
  color:#fff;
  font-size:14px;
  outline:none;
}
.alternativa-item input[type="text"]::placeholder{
  color:rgba(255,255,255,0.5);
}
.alternativa-item input[type="checkbox"]{
  width:18px;
  height:18px;
  cursor:pointer;
  accent-color:#4ADE80;
}

/* ===== Footer ===== */
.modal-footer{
  display:flex;
  justify-content:flex-end;
  align-items:center;
  gap:12px;
  padding:20px 24px;
  border-top:1px solid var(--bd-soft);
}
.btn{
  border-radius:12px;
  padding:10px 16px;
  font-weight:700;
  font-size:14px;
  cursor:pointer;
  border:1px solid var(--bd-strong);
  background:rgba(255,255,255,.08);
  color:#E7F0FF;
}
.btn-ghost{
  background:rgba(255,255,255,.08);
}
.modal-footer .btn-accent{
  --btn-green:#4ADE80;
  --btn-green-hover:#16A34A;
  background:var(--btn-green);
  color:#FFFFFF;
  border:1px solid var(--btn-green);
  box-shadow:none;
  transition:background-color .2s ease, border-color .2s ease, transform .05s ease;
}
.modal-footer .btn-accent:hover{
  background:var(--btn-green-hover);
  border-color:var(--btn-green-hover);
}
.modal-footer .btn-accent:active{
  transform:translateY(1px);
}
.modal-footer .btn-accent:focus-visible{
  outline:3px solid rgba(74,222,128,0.4);
  outline-offset:2px;
}
</style>
