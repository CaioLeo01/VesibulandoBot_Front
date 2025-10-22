<template>
  <aside class="quick">
    <h3>Perguntas rapidas</h3>
    <div class="list">
      <button
        v-for="(q, i) in questions"
        :key="i"
        class="item"
        @click="$emit('pick', q)"
      >
        {{ q }}
      </button>
    </div>
  </aside>
</template>

<script setup>
const questions = [
  'Explique fotossintese em 3 passos.',
  'Como calcular a media ponderada?',
  'Qual a diferenca entre mitose e meiose?',
  'Dicas para redacao nota 1000.',
  'Resumo da Revolucao Francesa.',
  'Como converter km/h para m/s?'
]
</script>

<style scoped>
.quick {
  background: #ffffffd9;
  backdrop-filter: blur(6px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,.08);
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  min-height: 0;
  overflow: auto;
}
h3 { margin: 0 0 12px; }
.list {
  display: grid;
  gap: 8px;
}
.item {
  text-align: left;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background .2s, transform .02s;
  font-weight: 600;
}
.item:hover { background: #079685; color: #fff; }
.item:active { transform: translateY(1px); }

@media (max-width: 900px) {
  .quick {
    height: auto;
    overflow: visible;
  }

  .list {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .item {
    font-size: 14px;
  }
}
</style>
