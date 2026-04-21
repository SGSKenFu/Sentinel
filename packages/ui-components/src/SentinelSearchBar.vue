<template>
  <div class="flex items-center gap-2">
    <div class="relative flex-1">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('search')"
        type="text"
        :placeholder="placeholder"
        class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <button
      v-if="showButton"
      @click="$emit('search')"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      {{ buttonText }}
    </button>
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', ''); $emit('search')"
      class="text-gray-400 hover:text-gray-600 transition-colors px-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    showButton?: boolean;
    buttonText?: string;
  }>(),
  {
    placeholder: 'Search...',
    showButton: true,
    buttonText: 'Search',
  },
);

defineEmits<{
  'update:modelValue': [value: string];
  'search': [];
}>();
</script>
