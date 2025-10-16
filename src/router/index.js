import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import StudyView from '../views/StudyView.vue'
import ChallengeView from '../views/ChallengeView.vue'
import PerformanceView from '../views/PerformanceView.vue'
import AdminView from '../views/AdminView.vue'
import ConfigurarSimuladoView from '../views/ConfigurarSimuladoView.vue'

import { getCurrentUser } from '@/services/auth'

const routes = [
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },

  // rotas protegidas
  { path: '/home', name: 'Home', component: HomeView, meta: { requiresAuth: true } },
  { path: '/study', name: 'Study', component: StudyView, meta: { requiresAuth: true } },
  { path: '/challenge', name: 'Challenge', component: ChallengeView, meta: { requiresAuth: true } },
  { path: '/performance', name: 'Performance', component: PerformanceView, meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: AdminView, meta: { requiresAuth: true } },
  { path: '/admin/configurar-simulado', name: 'ConfigurarSimulado', component: ConfigurarSimuladoView, meta: { requiresAuth: true } },

  // criar senha após login com Google
  { 
  path: '/criar-senha',
  name: 'CreatePassword',
  component: () => import('@/views/CreatePassword.vue'),
  meta: { requiresAuth: true }
},
]

const router = createRouter({ history: createWebHistory(), routes })

// guarda global
router.beforeEach(async (to) => {
  // 1) retorno do Google: ?login=google_ok
  if (to.query && to.query.login === 'google_ok') {
    const user = await getCurrentUser(true)  // force reload
    if (user && !user.has_password) {
      return { name: 'CreatePassword', replace: true }
    }
    return { name: 'Home', replace: true }
  }

  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  const user = await getCurrentUser()

  // 2) bloqueia acesso a rotas protegidas se não logado
  if (requiresAuth && !user) {
    return { name: 'Login', query: { r: to.fullPath } }
  }

  // Permitir Login/Register após fluxo de logout explícito
  if ((to.name === 'Login' || to.name === 'Register') && to.query && to.query.logout === '1') {
    return true
  }

  // 3) já logado não deve ver Login/Register
  if ((to.name === 'Login' || to.name === 'Register') && user) {
    return { name: user.has_password ? 'Home' : 'CreatePassword' }
  }

  return true
})

export default router
