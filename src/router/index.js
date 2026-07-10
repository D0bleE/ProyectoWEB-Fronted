import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default defineRouter(() => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole') || 'USU'

    if (to.meta.requiresAuth && !token) {
      next('/login')
      return
    }

    if ((to.path === '/login' || to.path === '/register') && token) {
      next(userRole === 'ADM' ? '/admin' : '/dashboard')
      return
    }

    if (to.meta.requiresAdmin && userRole !== 'ADM') {
      next('/dashboard')
      return
    }

    if (userRole === 'ADM' && !to.path.startsWith('/admin') && to.meta.requiresAuth) {
      next('/admin')
      return
    }

    next()
  })

  return Router
})