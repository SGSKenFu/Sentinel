<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm" :class="padding">
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-gray-100">
      <slot name="header">
        <h3 class="font-semibold text-gray-900">{{ title }}</h3>
        <p v-if="description" class="text-sm text-gray-500 mt-0.5">{{ description }}</p>
      </slot>
    </div>
    <div :class="bodyPadding">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    noPadding?: boolean;
  }>(),
  { noPadding: false },
);

const padding = props.noPadding ? 'overflow-hidden' : '';
const bodyPadding = props.noPadding ? '' : 'p-6';
</script>
