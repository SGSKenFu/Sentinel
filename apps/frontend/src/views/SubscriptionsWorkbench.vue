<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Subscriptions</h2>
        <p class="text-sm text-gray-500 mt-1">Manage your compliance intelligence notification subscriptions</p>
      </div>
      <button @click="openCreateModal" class="btn-primary text-sm flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Subscription
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block w-8 h-8 border-2 border-sentinel-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="sub in subscriptions"
        :key="sub.id"
        class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:border-sentinel-300 transition-colors"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ sub.name }}</h3>
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
              :class="sub.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ sub.active ? 'Active' : 'Paused' }}
            </span>
          </div>
          <div class="flex gap-1">
            <button
              @click="toggleSubscription(sub)"
              class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors"
            >
              {{ sub.active ? 'Pause' : 'Resume' }}
            </button>
            <button
              @click="deleteSubscription(sub.id)"
              class="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="space-y-2 text-sm">
          <div v-if="sub.keywords?.length">
            <span class="text-xs text-gray-400 uppercase font-semibold">Keywords</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="kw in sub.keywords" :key="kw"
                class="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {{ kw }}
              </span>
            </div>
          </div>

          <div v-if="sub.riskLevels?.length">
            <span class="text-xs text-gray-400 uppercase font-semibold">Risk Levels</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="rl in sub.riskLevels" :key="rl"
                :class="riskBadgeClass(rl)">
                {{ rl }}
              </span>
            </div>
          </div>

          <div v-if="sub.channels?.length">
            <span class="text-xs text-gray-400 uppercase font-semibold">Channels</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span v-for="ch in sub.channels" :key="ch"
                class="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                {{ ch }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && subscriptions.length === 0" class="col-span-full text-center py-16 text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="font-medium">No subscriptions yet</p>
        <p class="text-sm mt-1">Create a subscription to start receiving alerts</p>
      </div>
    </div>

    <!-- Create modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900 text-lg">New Subscription</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subscription Name</label>
            <input v-model="form.name" type="text" placeholder="e.g., EU Electronics Recalls"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
            <input v-model="form.keywordsRaw" type="text" placeholder="e.g., RoHS, CE marking, electronics"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Risk Levels</label>
            <div class="flex gap-3">
              <label v-for="rl in ['HIGH', 'MEDIUM', 'LOW', 'INFO']" :key="rl" class="flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" v-model="form.riskLevels" :value="rl" class="rounded text-sentinel-600" />
                {{ rl }}
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notification Channel</label>
            <select v-model="form.channel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500">
              <option value="EMAIL">Email</option>
              <option value="FEISHU">Feishu</option>
              <option value="WECHAT_WORK">WeChat Work</option>
              <option value="WEBHOOK">Webhook</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 pb-6">
          <button @click="showModal = false" class="btn-secondary text-sm">Cancel</button>
          <button @click="submitCreate" class="btn-primary text-sm" :disabled="!form.name">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { subscriptionsApi } from '@/api/subscriptions.api';
import type { Subscription, RiskLevel, NotificationChannel } from '@sentinel/types';
import { useNotificationStore } from '@/stores/notification.store';

const notif = useNotificationStore();
const subscriptions = ref<Subscription[]>([]);
const loading = ref(false);
const showModal = ref(false);

const form = ref({
  name: '',
  keywordsRaw: '',
  riskLevels: [] as string[],
  channel: 'EMAIL' as NotificationChannel,
});

function riskBadgeClass(risk: RiskLevel | string): string {
  const map: Record<string, string> = {
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
    INFO: 'badge-info',
  };
  return map[risk] ?? 'badge-info';
}

async function loadSubscriptions() {
  loading.value = true;
  try {
    const res = await subscriptionsApi.list();
    subscriptions.value = res.data;
  } catch (err) {
    notif.error('Failed to load subscriptions');
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  form.value = { name: '', keywordsRaw: '', riskLevels: [], channel: 'EMAIL' };
  showModal.value = true;
}

async function submitCreate() {
  const keywords = form.value.keywordsRaw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  try {
    await subscriptionsApi.create({
      name: form.value.name,
      keywords,
      riskLevels: form.value.riskLevels as RiskLevel[],
      channels: [form.value.channel],
      active: true,
    });
    notif.success('Subscription created');
    showModal.value = false;
    await loadSubscriptions();
  } catch (err) {
    notif.error('Failed to create subscription');
  }
}

async function toggleSubscription(sub: Subscription) {
  try {
    await subscriptionsApi.update(sub.id, { active: !sub.active });
    notif.success(`Subscription ${sub.active ? 'paused' : 'resumed'}`);
    await loadSubscriptions();
  } catch (err) {
    notif.error('Failed to update subscription');
  }
}

async function deleteSubscription(id: string) {
  if (!confirm('Delete this subscription?')) return;
  try {
    await subscriptionsApi.delete(id);
    notif.success('Subscription deleted');
    await loadSubscriptions();
  } catch (err) {
    notif.error('Failed to delete subscription');
  }
}

onMounted(loadSubscriptions);
</script>
