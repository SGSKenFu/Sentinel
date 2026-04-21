export enum RiskLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum SourceType {
  RECALL = 'RECALL',
  REGULATION = 'REGULATION',
  STANDARD = 'STANDARD',
  DOMESTIC = 'DOMESTIC',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  FEISHU = 'FEISHU',
  WECHAT_WORK = 'WECHAT_WORK',
  WEBHOOK = 'WEBHOOK',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface ProcessingChainEntry {
  stage: string;
  timestamp: string;
  status: 'success' | 'error' | 'skipped';
  details?: string;
}

export interface IntelligenceItem {
  id: string;
  tenantId: string;
  sourceType: SourceType;
  title: string;
  url: string;
  publishDate: Date;
  summary: string;
  tags: string[];
  riskLevel: RiskLevel;
  fingerprint: string;
  contentHash: string;
  processingChain: ProcessingChainEntry[];
  rawDataId?: string;
  enrichedAt?: Date;
  llmVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  field: string;
  operator: 'eq' | 'neq' | 'contains' | 'startsWith' | 'in' | 'gte' | 'lte';
  value: string | string[] | number;
}

export interface RuleAction {
  type: 'notify' | 'webhook' | 'tag';
  config: Record<string, string>;
}

export interface Subscription {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  keywords: string[];
  sourceTypes: SourceType[];
  riskLevels: RiskLevel[];
  channels: NotificationChannel[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchQuery {
  keyword?: string;
  sourceTypes?: SourceType[];
  riskLevels?: RiskLevel[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  tenantId?: string;
  page?: number;
  pageSize?: number;
}
