import bff from './bff';
import type { Subscription, SourceType, RiskLevel, NotificationChannel } from '@sentinel/types';

export interface CreateSubscriptionPayload {
  name: string;
  keywords: string[];
  sourceTypes?: SourceType[];
  riskLevels?: RiskLevel[];
  channels: NotificationChannel[];
  active?: boolean;
}

export const subscriptionsApi = {
  list() {
    return bff.get<Subscription[]>('/regulation/subscriptions');
  },

  getById(id: string) {
    return bff.get<Subscription>(`/regulation/subscriptions/${id}`);
  },

  create(payload: CreateSubscriptionPayload) {
    return bff.post<Subscription>('/regulation/subscriptions', payload);
  },

  update(id: string, payload: Partial<CreateSubscriptionPayload>) {
    return bff.put<Subscription>(`/regulation/subscriptions/${id}`, payload);
  },

  delete(id: string) {
    return bff.delete(`/regulation/subscriptions/${id}`);
  },
};
