<template>
  <span :class="badgeClass">
    <slot>{{ riskLevel }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RiskLevel } from '@sentinel/types';

const props = defineProps<{
  riskLevel: RiskLevel | string;
  size?: 'sm' | 'md';
}>();

const badgeClass = computed(() => {
  const sizeClasses = props.size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2.5 py-1';
  const colorMap: Record<string, string> = {
    HIGH: 'bg-red-100 text-red-800',
    MEDIUM: 'bg-orange-100 text-orange-800',
    LOW: 'bg-yellow-100 text-yellow-800',
    INFO: 'bg-blue-100 text-blue-800',
  };
  const color = colorMap[props.riskLevel] ?? 'bg-gray-100 text-gray-700';
  return `${color} ${sizeClasses} font-semibold rounded-full inline-flex items-center`;
});
</script>
