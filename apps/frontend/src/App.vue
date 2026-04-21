<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <nav class="w-64 bg-gray-900 text-white flex flex-col shadow-xl">
      <div class="p-6 border-b border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-sentinel-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Sentinel</h1>
            <p class="text-xs text-gray-400">Compliance Intelligence</p>
          </div>
        </div>
      </div>

      <div class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="isActive(item.path)
            ? 'bg-sentinel-600 text-white'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          {{ item.label }}
        </router-link>
      </div>

      <div class="p-4 border-t border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-sentinel-500 rounded-full flex items-center justify-center text-sm font-medium">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ authStore.user?.email ?? 'Guest' }}</p>
            <p class="text-xs text-gray-400">{{ authStore.user?.roles?.join(', ') ?? '' }}</p>
          </div>
          <button
            v-if="authStore.isAuthenticated"
            @click="authStore.logout"
            class="text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ currentPageTitle }}</h2>
          <p class="text-sm text-gray-500 mt-0.5">{{ currentPageDescription }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Live
          </span>
        </div>
      </header>

      <!-- Page content -->
      <div class="flex-1 overflow-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const authStore = useAuthStore();

// Simple SVG icon components
const IconSearch = defineComponent(() => () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }),
  ])
);

const IconBell = defineComponent(() => () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }),
  ])
);

const IconBookmark = defineComponent(() => () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' }),
  ])
);

const IconClipboard = defineComponent(() => () =>
  h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2',
      d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }),
  ])
);

const navItems = [
  { path: '/intelligence', label: 'Intelligence', icon: IconSearch, description: 'Browse and search compliance intelligence' },
  { path: '/rules', label: 'Alert Rules', icon: IconBell, description: 'Configure automated alert rules' },
  { path: '/subscriptions', label: 'Subscriptions', icon: IconBookmark, description: 'Manage notification subscriptions' },
  { path: '/audit', label: 'Audit Log', icon: IconClipboard, description: 'View system audit trail' },
];

const isActive = (path: string) => route.path.startsWith(path);

const currentPageTitle = computed(() => {
  const item = navItems.find((n) => route.path.startsWith(n.path));
  return item?.label ?? 'Sentinel';
});

const currentPageDescription = computed(() => {
  const item = navItems.find((n) => route.path.startsWith(n.path));
  return item?.description ?? '';
});

const userInitial = computed(() => {
  const email = authStore.user?.email ?? 'G';
  return email.charAt(0).toUpperCase();
});
</script>
