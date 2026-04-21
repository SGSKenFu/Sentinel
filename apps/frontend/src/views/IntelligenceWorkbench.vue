<template>
  <div class="p-6">
    <!-- Search bar and filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-64">
          <input
            v-model="keyword"
            type="text"
            placeholder="Search intelligence items..."
            class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"
            @keyup.enter="doSearch"
          />
        </div>

        <select
          v-model="selectedSourceType"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"
        >
          <option value="">All Source Types</option>
          <option v-for="st in sourceTypes" :key="st.value" :value="st.value">{{ st.label }}</option>
        </select>

        <select
          v-model="selectedRiskLevel"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"
        >
          <option value="">All Risk Levels</option>
          <option v-for="rl in riskLevels" :key="rl.value" :value="rl.value">{{ rl.label }}</option>
        </select>

        <input
          v-model="dateFrom"
          type="date"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"
        />

        <input
          v-model="dateTo"
          type="date"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sentinel-500"
        />

        <button @click="doSearch" class="btn-primary text-sm">
          Search
        </button>

        <button @click="resetSearch" class="btn-secondary text-sm">
          Reset
        </button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Results list -->
      <div class="flex-1 min-w-0">
        <!-- Stats bar -->
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-gray-500">
            {{ store.pagination.total.toLocaleString() }} items found
          </p>
          <div class="flex items-center gap-2">
            <button
              v-for="n in Math.min(store.pagination.totalPages, 5)"
              :key="n"
              @click="goToPage(n)"
              class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
              :class="store.pagination.page === n
                ? 'bg-sentinel-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'"
            >
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="store.isLoading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>

        <!-- Items list -->
        <div v-else class="space-y-3">
          <div
            v-for="item in store.items"
            :key="item.id"
            @click="openDetail(item)"
            class="bg-white rounded-xl border border-gray-200 p-4 hover:border-sentinel-300 hover:shadow-md cursor-pointer transition-all group"
          >
            <div class="flex items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span :class="riskBadgeClass(item.riskLevel)" class="flex-shrink-0">
                    {{ item.riskLevel }}
                  </span>
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    {{ item.sourceType }}
                  </span>
                  <span class="text-xs text-gray-400 flex-shrink-0">
                    {{ formatDate(item.publishDate) }}
                  </span>
                </div>
                <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-sentinel-700 line-clamp-2">
                  {{ item.title }}
                </h3>
                <p class="text-sm text-gray-600 line-clamp-2">{{ item.summary }}</p>
                <div v-if="item.tags?.length" class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="tag in item.tags.slice(0, 5)"
                    :key="tag"
                    class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <svg class="w-4 h-4 text-gray-400 group-hover:text-sentinel-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div v-if="!store.isLoading && !store.hasItems" class="text-center py-16 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="font-medium">No intelligence items found</p>
            <p class="text-sm mt-1">Try adjusting your search filters</p>
          </div>
        </div>
      </div>

      <!-- Detail drawer (side panel) -->
      <transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-4"
      >
        <div v-if="store.selectedItem" class="w-96 flex-shrink-0">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-0 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 class="font-semibold text-gray-900">Item Details</h3>
              <button @click="store.clearSelection()" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-4 space-y-4">
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="riskBadgeClass(store.selectedItem.riskLevel)">
                  {{ store.selectedItem.riskLevel }}
                </span>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {{ store.selectedItem.sourceType }}
                </span>
              </div>

              <h2 class="font-semibold text-gray-900 text-lg leading-snug">
                {{ store.selectedItem.title }}
              </h2>

              <div class="text-sm text-gray-500">
                Published: {{ formatDate(store.selectedItem.publishDate) }}
              </div>

              <div>
                <h4 class="text-xs font-semibold uppercase text-gray-400 mb-2">Summary</h4>
                <p class="text-sm text-gray-700 leading-relaxed">{{ store.selectedItem.summary }}</p>
              </div>

              <div v-if="store.selectedItem.tags?.length">
                <h4 class="text-xs font-semibold uppercase text-gray-400 mb-2">Tags</h4>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in store.selectedItem.tags"
                    :key="tag"
                    class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold uppercase text-gray-400 mb-2">Source</h4>
                <a
                  :href="store.selectedItem.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-sentinel-600 hover:text-sentinel-700 break-all flex items-center gap-1"
                >
                  {{ store.selectedItem.url }}
                  <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div v-if="store.selectedItem.processingChain?.length">
                <h4 class="text-xs font-semibold uppercase text-gray-400 mb-2">Processing Chain</h4>
                <div class="space-y-1">
                  <div
                    v-for="entry in store.selectedItem.processingChain"
                    :key="entry.stage"
                    class="flex items-center gap-2 text-xs"
                  >
                    <span
                      class="w-2 h-2 rounded-full flex-shrink-0"
                      :class="{
                        'bg-green-500': entry.status === 'success',
                        'bg-red-500': entry.status === 'error',
                        'bg-gray-400': entry.status === 'skipped',
                      }"
                    ></span>
                    <span class="font-medium capitalize">{{ entry.stage }}</span>
                    <span class="text-gray-400">{{ entry.details }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIntelligenceStore } from '@/stores/intelligence.store';
import type { IntelligenceItem, SourceType, RiskLevel } from '@sentinel/types';

const store = useIntelligenceStore();

const keyword = ref('');
const selectedSourceType = ref('');
const selectedRiskLevel = ref('');
const dateFrom = ref('');
const dateTo = ref('');

const sourceTypes = [
  { value: 'RECALL', label: 'Recall' },
  { value: 'REGULATION', label: 'Regulation' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'DOMESTIC', label: 'Domestic' },
];

const riskLevels = [
  { value: 'HIGH', label: '🔴 High' },
  { value: 'MEDIUM', label: '🟠 Medium' },
  { value: 'LOW', label: '🟡 Low' },
  { value: 'INFO', label: '🔵 Info' },
];

function riskBadgeClass(risk: RiskLevel | string): string {
  const map: Record<string, string> = {
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
    INFO: 'badge-info',
  };
  return map[risk] ?? 'badge-info';
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function doSearch() {
  await store.search({
    keyword: keyword.value || undefined,
    sourceTypes: selectedSourceType.value ? [selectedSourceType.value as SourceType] : undefined,
    riskLevels: selectedRiskLevel.value ? [selectedRiskLevel.value as RiskLevel] : undefined,
    dateFrom: dateFrom.value || undefined,
    dateTo: dateTo.value || undefined,
    page: 1,
    pageSize: 20,
  });
}

async function resetSearch() {
  keyword.value = '';
  selectedSourceType.value = '';
  selectedRiskLevel.value = '';
  dateFrom.value = '';
  dateTo.value = '';
  await store.list(1, 20);
}

async function goToPage(page: number) {
  await store.list(page, 20);
}

function openDetail(item: IntelligenceItem) {
  store.selectItem(item.id);
}

onMounted(() => {
  store.list(1, 20);
});
</script>
