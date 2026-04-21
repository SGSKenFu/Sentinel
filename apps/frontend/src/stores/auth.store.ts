import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import bff from '@/api/bff';

export interface AuthUser {
  sub: string;
  email: string;
  roles: string[];
  tenantId: string;
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref<string | null>(null);
    const user = ref<AuthUser | null>(null);

    const isAuthenticated = computed(() => !!token.value);
    const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false);

    async function login(email: string, password: string): Promise<void> {
      const res = await bff.post<{ accessToken: string; user: AuthUser }>(
        '/governance/auth/login',
        { email, password },
      );
      token.value = res.data.accessToken;
      user.value = res.data.user;
    }

    function logout() {
      token.value = null;
      user.value = null;
    }

    return { token, user, isAuthenticated, isAdmin, login, logout };
  },
  {
    persist: true,
  },
);
