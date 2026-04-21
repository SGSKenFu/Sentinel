import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/intelligence',
    },
    {
      path: '/intelligence',
      name: 'intelligence',
      component: () => import('@/views/IntelligenceWorkbench.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/rules',
      name: 'rules',
      component: () => import('@/views/RulesWorkbench.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: () => import('@/views/SubscriptionsWorkbench.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/audit',
      name: 'audit',
      component: () => import('@/views/AuditWorkbench.vue'),
      meta: { requiresAuth: true, roles: ['admin', 'auditor'] },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  return true;
});
