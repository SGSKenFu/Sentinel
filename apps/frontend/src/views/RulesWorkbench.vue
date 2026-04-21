<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Alert Rules</h2>
        <p class="text-sm text-gray-500 mt-1">Configure rules to automatically detect and alert on compliance intelligence</p>
      </div>
      <button @click="openCreateModal" class="btn-primary text-sm flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Rule
      </button>
    </div>

    <!-- Rules table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Conditions</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Priority</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Created</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-gray-400">
              <div class="inline-block w-6 h-6 border-2 border-sentinel-600 border-t-transparent rounded-full animate-spin"></div>
            </td>
          </tr>
          <tr v-else-if="rules.length === 0">
            <td colspan="6" class="text-center py-12 text-gray-400">
              No alert rules configured. Create your first rule.
            </td>
          </tr>
          <tr
            v-for="rule in rules"
            :key="rule.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{{ rule.name }}</div>
              <div v-if="rule.description" class="text-xs text-gray-500 mt-0.5">{{ rule.description }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ rule.conditions?.length ?? 0 }} condition(s)
            </td>
            <td class="px-4 py-3">
              <span class="text-sm font-medium text-gray-700">{{ rule.priority }}</span>
            </td>
            <td class="px-4 py-3">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ rule.enabled ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">
              {{ formatDate(rule.createdAt) }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <button
                  @click="toggleRule(rule)"
                  class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {{ rule.enabled ? 'Disable' : 'Enable' }}
                </button>
                <button
                  @click="deleteRule(rule.id)"
                  class="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900 text-lg">Create Alert Rule</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
            <input v-model="form.name" type="text" placeholder="e.g., High-risk EU recalls"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="form.description" rows="2" placeholder="Optional description..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Condition: Risk Level</label>
            <select v-model="form.riskLevelCondition"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500">
              <option value="">Any risk level</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Priority (higher = evaluated first)</label>
            <input v-model.number="form.priority" type="number" min="0" max="100"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500" />
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
import { rulesApi } from '@/api/rules.api';
import type { AlertRule } from '@sentinel/types';
import { useNotificationStore } from '@/stores/notification.store';

const notif = useNotificationStore();
const rules = ref<AlertRule[]>([]);
const loading = ref(false);
const showModal = ref(false);

const form = ref({
  name: '',
  description: '',
  riskLevelCondition: '',
  priority: 0,
});

async function loadRules() {
  loading.value = true;
  try {
    const res = await rulesApi.list();
    rules.value = res.data;
  } catch (err) {
    notif.error('Failed to load rules');
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  form.value = { name: '', description: '', riskLevelCondition: '', priority: 0 };
  showModal.value = true;
}

async function submitCreate() {
  const conditions = form.value.riskLevelCondition
    ? [{ field: 'riskLevel', operator: 'eq' as const, value: form.value.riskLevelCondition }]
    : [];

  try {
    await rulesApi.create({
      name: form.value.name,
      description: form.value.description || undefined,
      conditions,
      actions: [],
      priority: form.value.priority,
      enabled: true,
    });
    notif.success('Rule created successfully');
    showModal.value = false;
    await loadRules();
  } catch (err) {
    notif.error('Failed to create rule');
  }
}

async function toggleRule(rule: AlertRule) {
  try {
    await rulesApi.update(rule.id, { enabled: !rule.enabled });
    notif.success(`Rule ${rule.enabled ? 'disabled' : 'enabled'}`);
    await loadRules();
  } catch (err) {
    notif.error('Failed to update rule');
  }
}

async function deleteRule(id: string) {
  if (!confirm('Are you sure you want to delete this rule?')) return;
  try {
    await rulesApi.delete(id);
    notif.success('Rule deleted');
    await loadRules();
  } catch (err) {
    notif.error('Failed to delete rule');
  }
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString();
}

onMounted(loadRules);
</script>
