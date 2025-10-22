<template>
  <teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cfg-title">
        <!-- Cabeçalho -->
        <header class="modal-header">
          <h2 id="cfg-title">Filtrar Dashboard</h2>
          <button class="icon-btn" @click="close" aria-label="Fechar">✕</button>
        </header>

        <!-- Corpo -->
        <section class="modal-body">
          <!-- Tipo de simulado -->
          <div class="field">
            <label for="m-simulado">Tipo de simulado</label>
            <select id="m-simulado" v-model="local.simulado">
              <option v-for="opt in simulados" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Matéria -->
          <div class="field">
            <label>Matéria</label>
            <div class="pills">
              <button
                v-for="cat in categorias"
                :key="cat.value"
                class="pill"
                :class="{ active: local.categoria === cat.value }"
                @click="local.categoria = cat.value"
                type="button"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>
        </section>

        <!-- Rodapé -->
        <footer class="modal-footer">
          <button class="btn btn-ghost" @click="close">Cancelar</button>
          <button class="btn btn-accent" @click="apply">Aplicar</button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initial: {
    type: Object,
    default: () => ({
      simulado: 'enem-mix',
      categoria: 'todas'
    })
  },
  simulados: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue', 'apply'])

/** ---------- Categorias ---------- */
const categoriasBase = [
  { label: 'Todas as matérias', value: 'todas' },
  { label: 'Matemática', value: 'matematica' },
  { label: 'Linguagens', value: 'linguagens' },
  { label: 'Ciências da Natureza', value: 'natureza' },
  { label: 'Ciências Humanas', value: 'humanas' }
]
const categoriasMap = {
  'enem-mix': categoriasBase,
  'enem-2022': [
    { label: 'Todas os Blocos', value: 'todas' },
    { label: 'Bloco 1 (Linguagens e Humanas)', value: '1dia' },
    { label: 'Bloco 2 (Natureza e Matemática)', value: '2dia' }
  ],
  default: categoriasBase
}

/* Estado local */
const local = reactive({
  simulado: props.initial.simulado,
  categoria: props.initial.categoria
})

/* Computed */
const categorias = computed(() => categoriasMap[local.simulado] || categoriasMap.default || [])

/* Helpers */
function ensureCategoriaValida() {
  if (!categorias.value.find(c => c.value === local.categoria)) {
    local.categoria = categorias.value[0].value
  }
}
function resetFromInitial() {
  Object.assign(local, props.initial || {})
  ensureCategoriaValida()
}

/* Watches */
watch(() => props.modelValue, (open) => { if (open) resetFromInitial() })
watch(() => props.initial, () => resetFromInitial(), { deep: true })
watch(() => local.simulado, ensureCategoriaValida)

/* Ações */
function close() { emit('update:modelValue', false) }
function apply() {
  const simuladoLabel = (props.simulados || []).find(s => s.value === local.simulado)?.label || ''
  const categoriaLabel = categorias.value.find(c => c.value === local.categoria)?.label || ''

  emit('apply', {
    ...local,
    simuladoLabel,
    categoriaLabel
  })
  close()
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
.field{ display:grid; gap:10px; }
.field label{ color:#ffffff; font-size:14px; }

/* Select escuro */
select{
  appearance:none; width:100%;
  padding:12px 14px; border-radius:12px;
  border:1px solid var(--bd-strong);
  color:#F6FAFF; font-size:14px; outline:none;
  background-image:
    linear-gradient(45deg, transparent 50%, #CFE0FF 50%),
    linear-gradient(135deg, #CFE0FF 50%, transparent 50%);
  background-position: calc(100% - 18px) calc(1em + 2px),
                      calc(100% - 13px) calc(1em + 2px);
  background-size: 6px 6px, 6px 6px; background-repeat:no-repeat;
}

/* Pills */
.pills{ display:flex; flex-wrap:wrap; gap:10px; }
.pill{
  background:rgba(255,255,255,.10);
  border:1px solid var(--bd-strong);
  color:#E7F0FF;
  padding:10px 14px;
  border-radius:999px;
  font-weight:700; font-size:14px;
  cursor:pointer;
}
.pill:hover{ background:rgba(255,255,255,.16); }
.pill.active{
  background:#FFFFFF; color:var(--c-text); border-color:transparent;
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

/* Select menu visível no tema escuro */
.modal select{ background:#1E3A5F; color:#FFFFFF; border:1px solid #2A4C70; }
.modal select:focus{ border-color:#FBBF24; }
.modal select option,
.modal select optgroup{
  background:#1E3A5F !important; color:#FFFFFF !important;
}
.modal select option:checked,
.modal select option:hover{
  background:#16395B !important; color:#FFFFFF !important;
}
</style>
