<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="modelValue" class="fixed inset-0 bg-black/40 z-40" @click="close" />
    </transition>

    <transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="modelValue"
        class="fixed top-0 right-0 h-full z-50 flex flex-col bg-white shadow-2xl"
        :style="{ width }"
      >
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="font-semibold text-gray-900 text-lg">{{ title }}</h2>
          <button @click="close" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-200">
          <slot name="footer" />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    width?: string;
  }>(),
  { width: '480px' },
);

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

function close() {
  emit('update:modelValue', false);
}
</script>
