const routes = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/login',
      },
      {
        path: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
      },
      {
        path: 'register',
        component: () => import('pages/auth/RegisterPage.vue'),
      },
    ],
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'billeteras',
        component: () => import('pages/billeteras/BilleterasPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'cuentas-bancarias',
        component: () => import('pages/cuentas/CuentasBancariasPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mercado',
        component: () => import('pages/ofertas/MercadoPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'ofertas/crear',
        component: () => import('pages/ofertas/CrearOfertaPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mis-ofertas',
        component: () => import('pages/ofertas/MisOfertasPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'matches',
        component: () => import('pages/ofertas/MatchesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'admin',
        component: () => import('pages/admin/AdminPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'admin/movimientos',
        component: () => import('pages/admin/AdminMovimientosPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },
      {
        path: 'admin/usuarios',
        component: () => import('pages/admin/AdminUsuariosPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },

      {
        path: 'admin/historial',
        component: () => import('pages/admin/AdminHistorialPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },

      {
        path: 'admin/monedas',
        component: () => import('pages/admin/AdminMonedasPage.vue'),
        meta: { requiresAuth: true, requiresAdmin: true },
      },

      {
        path: 'historial',
        component: () => import('pages/historial/HistorialPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
