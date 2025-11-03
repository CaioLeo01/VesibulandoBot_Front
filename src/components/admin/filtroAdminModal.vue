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
          <div class="field-row">
            <!-- Filtro: Simulado -->
            <div class="field">
              <label for="sel-sim">Simulado</label>
              <select id="sel-sim" v-model="filtroSimulado" class="select">
                <option :value="null">Todos os simulados</option>
                <option
                  v-for="s in simuladosOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </option>
              </select>
            </div>

            <!-- Filtro: Matéria -->
            <div class="field">
              <label for="sel-mat">Matéria</label>
              <select
                id="sel-mat"
                v-model="filtroMateria"
                class="select"
                :disabled="materiasOptions.length === 0"
              >
                <option :value="null">Todas as matérias</option>
                <option
                  v-for="m in materiasOptions"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </option>
              </select>
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
import { ref, watch, onMounted, computed } from 'vue'
import { listarSimulados } from '@/services/simulado.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  simulados: { type: Array, default: () => [] },
  initial: {
    type: Object,
    default: () => ({ cod_simulado: null, cod_materia: null })
  }
})
const emit = defineEmits(['update:modelValue', 'apply'])

const simuladosRaw = ref([])
const simuladosOptions = ref([])
const materiasOptions = ref([])

const filtroSimulado = ref(null)
const filtroMateria  = ref(null)

const simuladoById = computed(() => {
  const map = new Map()
  for (const s of simuladosRaw.value) map.set(s.cod_simulado, s)
  return map
})

function close() {
  emit('update:modelValue', false)
}
function apply() {
  emit('apply', {
    cod_simulado: filtroSimulado.value ?? null,
    cod_materia:  filtroMateria.value  ?? null
  })
  close()
}
function rebuildMateriasOptions() {
  if (filtroSimulado.value != null) {
    const s = simuladoById.value.get(filtroSimulado.value)
    const cods  = s?.cod_materias ?? []
    const nomes = s?.nomes_materias ?? []
    materiasOptions.value = cods.map((id, i) => ({ value: id, label: nomes[i] ?? `Matéria ${id}` }))
    return
  }
  
  const seen = new Set()
  const out = []
  for (const s of simuladosRaw.value) {
    const cods  = s.cod_materias ?? []
    const nomes = s.nomes_materias ?? []
    cods.forEach((id, i) => {
      if (!seen.has(id)) {
        seen.add(id)
        out.push({ value: id, label: nomes[i] ?? `Matéria ${id}` })
      }
    })
  }
  materiasOptions.value = out
}

watch(() => props.modelValue, (open) => {
  if (open) {
    filtroSimulado.value = props.initial?.cod_simulado ?? null
    filtroMateria.value  = props.initial?.cod_materia  ?? null
    rebuildMateriasOptions()
  }
})
watch(filtroSimulado, () => {
  filtroMateria.value = null
  rebuildMateriasOptions()
})

onMounted(async () => {
  if (props.simulados?.length) {
    simuladosRaw.value = props.simulados
  } else {
    try {
      simuladosRaw.value = await listarSimulados() || []
    } catch {
      simuladosRaw.value = []
    }
  }

  simuladosOptions.value = simuladosRaw.value.map(s => ({
    value: s.cod_simulado,
    label: s.titulo
  }))

  rebuildMateriasOptions()

  if (props.modelValue) {
    filtroSimulado.value = props.initial?.cod_simulado ?? null
    filtroMateria.value  = props.initial?.cod_materia  ?? null
  }
})

watch(() => props.simulados, (novo) => {
  if (!Array.isArray(novo)) return
  simuladosRaw.value = novo
  simuladosOptions.value = novo.map(s => ({
    value: s.cod_simulado,
    label: s.titulo
  }))
  rebuildMateriasOptions()
}, { immediate: false })
</script>

<style scoped>
/* ===== Paleta ===== */
:root, :host{
  --c-primary:#1E3A5F;
  --c-accent:#4ADE80;
  --c-text:#F8FAFC;
  --bd-soft: rgba(255,255,255,.16);
  --bd-strong: rgba(255,255,255,.26);
}

/* ===== Overlay / Modal ===== */
.overlay{
  position:fixed; inset:0; background:rgba(2,6,23,.55);
  display:grid; place-items:center; padding:24px; z-index:1000;
}
.modal{
  background:#1E3A5F;
  border:1px solid #1E3A5F;
  width:clamp(360px, 92vw, 720px);
  border-radius:24px;
  box-sizing:border-box;
}

/* ===== Header ===== */
.modal-header{
  display:flex; align-items:center; justify-content:space-between;
  padding:20px 24px; border-bottom:1px solid var(--bd-soft);
}
.modal-header h2{
  margin:0; font-size:22px; font-weight:800; letter-spacing:.2px; color:#ffffff;
}
.icon-btn{
  background:transparent; color:#ffffff; border:1px solid var(--bd-soft);
  width:36px; height:36px; border-radius:8px; cursor:pointer;
}
.icon-btn:hover{ background:rgba(255,255,255,.08); }

/* ===== Body ===== */
.modal-body{ padding:20px 24px; display:grid; gap:18px; }
.field-row{ display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap; }
.field{ display:flex; flex-direction:column; gap:8px; min-width:240px; flex:1; }
.field label{ color:#ffffff; font-size:14px; font-weight:600; }

.select{
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid #2A4C70;
  background:#16304A;
  color:#ffffff;
  font-size:14px;
  outline:none;
}
.select:disabled{ opacity:.6; cursor:not-allowed; }

/* ===== Footer ===== */
.modal-footer{
  display:flex; justify-content:flex-end; align-items:center; gap:12px;
  padding:20px 24px; border-top:1px solid var(--bd-soft);
}
.btn{
  border-radius:12px; padding:10px 16px; font-weight:700; font-size:14px; cursor:pointer;
  border:1px solid var(--bd-strong); background:rgba(255,255,255,.08); color:#E7F0FF;
}
.btn-ghost{ background:rgba(255,255,255,.08); }
.btn-accent{
  background:#4ADE80; color:#06291A; border:1px solid #4ADE80;
}
.btn-accent:hover{ background:#16A34A; border-color:#16A34A; color:#E6FFEF; }
</style>
