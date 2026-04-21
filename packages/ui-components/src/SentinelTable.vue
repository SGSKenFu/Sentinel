<template>
  <div class="overflow-hidden">
    <table class="w-full">
      <thead>
        <tr class="bg-gray-50 border-b border-gray-200">
          <th
            v-for="col in columns"
            :key="col.key"
            class="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center py-12">
            <div class="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length" class="text-center py-12 text-gray-400 text-sm">
            {{ emptyText }}
          </td>
        </tr>
        <tr
          v-for="row in rows"
          :key="String(row[rowKey])"
          class="hover:bg-gray-50 transition-colors cursor-pointer"
          @click="$emit('row-click', row)"
        >
          <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-gray-700">
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Page {{ currentPage }} of {{ totalPages }} ({{ total }} items)
      </p>
      <div class="flex gap-2">
        <button
          :disabled="currentPage <= 1"
          @click="$emit('page-change', currentPage - 1)"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Prev
        </button>
        <button
          :disabled="currentPage >= totalPages"
          @click="$emit('page-change', currentPage + 1)"
          class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string;
  label: string;
}

defineProps<{
  columns: Column[];
  rows: Record<string, unknown>[];
  rowKey?: string;
  loading?: boolean;
  emptyText?: string;
  total?: number;
  currentPage?: number;
  totalPages?: number;
}>();

defineEmits<{
  'row-click': [row: Record<string, unknown>];
  'page-change': [page: number];
}>();
</script>
