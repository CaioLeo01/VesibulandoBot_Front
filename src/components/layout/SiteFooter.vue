<template>
  <footer class="site-footer">
    <div class="inner">
      <div class="contacts">
        <a class="contact" :href="`mailto:${email}`">
          <i class="fa-solid fa-envelope"></i>
          <span>{{ email }}</span>
        </a>
        <a class="contact" :href="whatsUrl" target="_blank" rel="noopener noreferrer">
          <i class="fa-brands fa-whatsapp"></i>
          <span>WhatsApp</span>
        </a>
      </div>

      <div class="copy">&copy; {{ year }} VestibulandoBot</div>
    </div>
  </footer>
</template>

<script setup>
// Props para customização simples dos contatos
const props = defineProps({
  email: { type: String, default: 'caio.m.c.leonardo@gmail.com' },
  whatsapp: { type: String, default: '+55 61 98286-3954' } // DDI + DDD + número
})

const year = new Date().getFullYear()
const email = props.email
// wa.me exige apenas dígitos. Sanitiza o valor informado.
const whatsDigits = String(props.whatsapp || '').replace(/\D/g, '')
const whatsUrl = whatsDigits ? `https://wa.me/${whatsDigits}` : '#'
</script>

<style scoped>
.site-footer {
  background: #0b2a4a;
  color: #ffffff;
  border-top: 3px solid #079685;
  box-shadow: 0 -4px 18px rgba(0,0,0,.15);
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.contacts { display: flex; gap: 12px; flex-wrap: wrap; }
.contact {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all .2s ease;
  border: 1px solid transparent;
}
.contact i { color: #079685; }
.contact:hover {
  background: rgba(7, 150, 133, .18);
  box-shadow: 0 2px 8px rgba(7, 150, 133, .25);
}

.copy {
  text-align: right;
  font-size: 13px;
  color: rgba(255,255,255,.9);
}

@media (max-width: 768px) {
  .inner {
    flex-direction: column;
    text-align: center;
  }
  .copy { text-align: center; }
}
</style>

