import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { IntelligenceItem, PaginatedResponse, SearchQuery } from '@sentinel/types';
import { intelligenceApi } from '@/api/intelligence.api';

export const useIntelligenceStore = defineStore('intelligence', () => {
  const items = ref<IntelligenceItem[]>([]);
  const selectedItem = ref<IntelligenceItem | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<Omit<PaginatedResponse<unknown>, 'data'>>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const searchQuery = ref<SearchQuery>({ page: 1, pageSize: 20 });

  const hasItems = computed(() => items.value.length > 0);
  const isLoading = computed(() => loading.value);

  async function search(query: SearchQuery) {
    loading.value = true;
    error.value = null;
    searchQuery.value = query;
    try {
      const res = await intelligenceApi.search(query);
      items.value = res.data.data;
      pagination.value = {
        total: res.data.total,
        page: res.data.page,
        pageSize: res.data.pageSize,
        totalPages: res.data.totalPages,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed';
    } finally {
      loading.value = false;
    }
  }

  async function list(page = 1, pageSize = 20) {
    loading.value = true;
    error.value = null;
    try {
      const res = await intelligenceApi.list(page, pageSize);
      items.value = res.data.data;
      pagination.value = {
        total: res.data.total,
        page: res.data.page,
        pageSize: res.data.pageSize,
        totalPages: res.data.totalPages,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load items';
    } finally {
      loading.value = false;
    }
  }

  async function selectItem(id: string) {
    try {
      const res = await intelligenceApi.getById(id);
      selectedItem.value = res.data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load item';
    }
  }

  function clearSelection() {
    selectedItem.value = null;
  }

  return {
    items,
    selectedItem,
    loading,
    error,
    pagination,
    searchQuery,
    hasItems,
    isLoading,
    search,
    list,
    selectItem,
    clearSelection,
  };
});
