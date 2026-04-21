import bff from './bff';
import type { PaginatedResponse, SearchQuery } from '@sentinel/types';
import type { IntelligenceItem } from '@sentinel/types';

export const intelligenceApi = {
  search(params: SearchQuery) {
    return bff.get<PaginatedResponse<IntelligenceItem>>('/intelligence/search', { params });
  },

  list(page = 1, pageSize = 20) {
    return bff.get<PaginatedResponse<IntelligenceItem>>('/intelligence', {
      params: { page, pageSize },
    });
  },

  getById(id: string) {
    return bff.get<IntelligenceItem>(`/intelligence/${id}`);
  },
};
