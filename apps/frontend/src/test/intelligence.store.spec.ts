import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';

// Test the intelligence store
describe('IntelligenceStore', () => {
  it('initializes with empty items', async () => {
    const { useIntelligenceStore } = await import('@/stores/intelligence.store');
    const pinia = createPinia();
    const store = useIntelligenceStore(pinia);
    expect(store.items).toEqual([]);
    expect(store.loading).toBe(false);
    expect(store.hasItems).toBe(false);
  });
});
