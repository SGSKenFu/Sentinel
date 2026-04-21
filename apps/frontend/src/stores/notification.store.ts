import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const toasts = ref<ToastMessage[]>([]);

  function addToast(toast: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    toasts.value.push({ ...toast, id });
    setTimeout(() => removeToast(id), 5000);
  }

  function removeToast(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.value.splice(idx, 1);
  }

  function success(title: string, message?: string) {
    addToast({ type: 'success', title, message });
  }

  function error(title: string, message?: string) {
    addToast({ type: 'error', title, message });
  }

  function warn(title: string, message?: string) {
    addToast({ type: 'warning', title, message });
  }

  function info(title: string, message?: string) {
    addToast({ type: 'info', title, message });
  }

  return { toasts, addToast, removeToast, success, error, warn, info };
});
