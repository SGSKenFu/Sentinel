# Sentinel Architecture

## Overview

Sentinel is a compliance intelligence monitoring and risk warning platform for the TIC (Testing, Inspection, Certification) industry.

## Monorepo Structure

```
sentinel/
├── apps/
│   ├── backend/            # NestJS API server
│   └── frontend/           # Vue 3 SPA
├── packages/
│   ├── types/              # Shared TypeScript types and enums
│   ├── sdk/                # Backend shared utilities (adapters, deduplication)
│   ├── ui-components/      # Shared Vue 3 component library
│   └── prompts/            # Versioned LLM prompt catalog
├── docker-compose.yml      # Local dev infrastructure
└── docs/                   # Documentation
```

## Backend Architecture (NestJS)

### Modules

| Module | Responsibility |
|--------|---------------|
| `IngestionModule` | Crawl data from external sources using adapters |
| `IntelligenceModule` | Normalize, enrich (LLM), score, and index items |
| `RegulationModule` | Alert rules and user subscriptions |
| `NotificationModule` | Multi-channel notification delivery |
| `GovernanceModule` | Auth, user management, audit logging |

### Data Flow

```
External Sources
      │
      ▼
Adapters (CpscRecalls, EuSafetyGate, FederalRegister, ...)
      │ CrawledItem
      ▼
IngestionService.fetchAll()
      │ saved to MySQL crawled_items
      ▼
SchedulerService (every 10 min)
      │ unprocessed items
      ▼
IntelligenceService.processRawItem()
      ├── NormalizerService   → clean + extract tags
      ├── ScoringService      → keyword-based risk scoring
      ├── EnrichmentService   → LLM summarize + tag + risk assess
      └── OpenSearchService   → index for full-text search
              │ saved to MySQL intelligence_items
              ▼
        RegulationModule
              ├── RuleEngineService  → evaluate AlertRules
              └── SubscriptionService → match Subscriptions
                      │
                      ▼
              NotificationService
              ├── FeishuAdapter
              ├── WechatWorkAdapter
              ├── EmailAdapter
              └── WebhookAdapter
```

### Ingestion Adapters

| Adapter | Source | Type |
|---------|--------|------|
| `CpscRecallsAdapter` | US CPSC | RECALL |
| `EuSafetyGateAdapter` | EU Safety Gate | RECALL |
| `FederalRegisterAdapter` | US Federal Register | REGULATION |
| `EurLexAdapter` | EUR-Lex | REGULATION |
| `IsoStandardsAdapter` | ISO | STANDARD |
| `IecWebstoreAdapter` | IEC | STANDARD |
| `SamrChinaAdapter` | SAMR China | DOMESTIC |
| `CncaChinaAdapter` | CNCA China | DOMESTIC |

### Deduplication

Items are deduplicated using two SHA-256 hashes:
- **fingerprint**: `SHA256(url)` — URL-based dedup
- **contentHash**: `SHA256(title|date|summary)` — Content-based dedup

### LLM Integration

The `EnrichmentService` calls an OpenAI-compatible API with three prompts (from `@sentinel/prompts`):
1. `SUMMARIZE_PROMPT_V1` — Generate 200-word summary
2. `TAGGING_PROMPT_V1` — Extract compliance tags as JSON array
3. `RISK_ASSESSMENT_PROMPT_V1` — Assess risk level as JSON

If no API key is configured, enrichment is skipped and the item uses keyword-based scoring only.

## Frontend Architecture (Vue 3)

### Views

| View | Path | Description |
|------|------|-------------|
| `IntelligenceWorkbench` | `/intelligence` | Search + browse intelligence items |
| `RulesWorkbench` | `/rules` | Manage alert rules |
| `SubscriptionsWorkbench` | `/subscriptions` | Manage notification subscriptions |
| `AuditWorkbench` | `/audit` | View audit trail |

### State Management (Pinia)

| Store | Responsibility |
|-------|---------------|
| `auth.store` | JWT token + user session (persisted) |
| `intelligence.store` | Intelligence items + search state |
| `notification.store` | Toast notifications |

### API Client

`src/api/bff.ts` creates an Axios instance with:
- Base URL: `/api/v1` (proxied to backend)
- 3 retry attempts with exponential backoff
- JWT Bearer token injection
- Auto-redirect to `/login` on 401

## Database Schema

### Key Tables

- `intelligence_sources` — Registered data sources
- `crawled_items` — Raw crawled data (pre-enrichment)
- `intelligence_items` — Enriched intelligence items (indexed in OpenSearch)
- `alert_rules` — Configured alert rules with JSON conditions/actions
- `subscriptions` — User notification subscriptions
- `notification_records` — Notification delivery audit trail
- `users` — User accounts with bcrypt passwords
- `tenants` — Multi-tenant configuration
- `audit_logs` — System audit trail

## Multi-Tenancy

All resources are scoped by `tenantId`. The JWT payload includes `tenantId`, and all service methods filter by it. The default tenant ID is configured via `DEFAULT_TENANT_ID` env var.
