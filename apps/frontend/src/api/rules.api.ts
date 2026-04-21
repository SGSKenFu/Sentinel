import bff from './bff';
import type { AlertRule } from '@sentinel/types';

export interface CreateRulePayload {
  name: string;
  description?: string;
  conditions: AlertRule['conditions'];
  actions: AlertRule['actions'];
  enabled?: boolean;
  priority?: number;
}

export const rulesApi = {
  list() {
    return bff.get<AlertRule[]>('/regulation/rules');
  },

  getById(id: string) {
    return bff.get<AlertRule>(`/regulation/rules/${id}`);
  },

  create(payload: CreateRulePayload) {
    return bff.post<AlertRule>('/regulation/rules', payload);
  },

  update(id: string, payload: Partial<CreateRulePayload>) {
    return bff.put<AlertRule>(`/regulation/rules/${id}`, payload);
  },

  delete(id: string) {
    return bff.delete(`/regulation/rules/${id}`);
  },
};
