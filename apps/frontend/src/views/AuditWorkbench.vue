<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Audit Log</h2>
        <p class="text-sm text-gray-500 mt-1">Track all system actions and user activities</p>
      </div>
      <div class="text-sm text-gray-500">
        {{ total.toLocaleString() }} total events
      </div>
    </div>

    <!-- Timeline -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block w-8 h-8 border-2 border-sentinel-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="entry in logs"
          :key="entry.id"
          class="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <!-- Action icon -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
            :class="actionColorClass(entry.action)"
          >
            {{ entry.action.charAt(0) }}
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-gray-900 text-sm">{{ entry.action }}</span>
              <span class="text-gray-400 text-xs">on</span>
              <span class="text-sm text-gray-700 font-medium">{{ entry.resource }}</span>
              <span v-if="entry.resourceId" class="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                {{ entry.resourceId.substring(0, 8) }}...
              </span>
            </div>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-xs text-gray-400">
                {{ entry.userId ? `User: ${entry.userId.substring(0, 8)}...` : 'Anonymous' }}
              </span>
              <span v-if="entry.ipAddress" class="text-xs text-gray-400">
                IP: {{ entry.ipAddress }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatDateTime(entry.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Timestamp -->
          <span class="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
            {{ timeAgo(entry.createdAt) }}
          </span>
        </div>

        <div v-if="!loading && logs.length === 0" class="text-center py-16 text-gray-400">
          No audit events found
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="total > pageSize" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, total) }} of {{ total }}
        </p>
        <div class="flex gap-2">
          <button
            :disabled="page <= 1"
            @click="goToPage(page - 1)"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            :disabled="page * pageSize >= total"
            @click="goToPage(page + 1)"
            class="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { auditApi, type AuditLogEntry } from '@/api/audit.api';
import { useNotificationStore } from '@/stores/notification.store';

const notif = useNotificationStore();
const logs = ref<AuditLogEntry[]>([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const pageSize = 50;

function actionColorClass(action: string): string {
  const map: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-purple-100 text-purple-700',
    LOGOUT: 'bg-gray-100 text-gray-600',
    READ: 'bg-gray-100 text-gray-500',
  };
  return map[action] ?? 'bg-gray-100 text-gray-600';
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function loadLogs(p = 1) {
  loading.value = true;
  try {
    const res = await auditApi.list(p, pageSize);
    logs.value = res.data.data;
    total.value = res.data.total;
    page.value = p;
  } catch (err) {
    notif.error('Failed to load audit logs');
  } finally {
    loading.value = false;
  }
}

function goToPage(p: number) {
  loadLogs(p);
}

onMounted(() => loadLogs(1));
</script>
