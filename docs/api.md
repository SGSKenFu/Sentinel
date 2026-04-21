# Sentinel API Reference

Base URL: `http://localhost:3000/api/v1`

Interactive docs: `http://localhost:3000/api/docs` (Swagger UI)

## Authentication

All endpoints except `POST /governance/auth/login` require a Bearer JWT token.

```
Authorization: Bearer <token>
```

### Login

```http
POST /governance/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "...", "email": "...", "roles": ["admin"], "tenantId": "..." },
  "expiresIn": "7d"
}
```

---

## Intelligence

### Search Items

```http
GET /intelligence/search?keyword=recall&sourceTypes=RECALL&riskLevels=HIGH&page=1&pageSize=20
```

Query params:
- `keyword` — Full-text search
- `sourceTypes[]` — Filter by source type: `RECALL`, `REGULATION`, `STANDARD`, `DOMESTIC`
- `riskLevels[]` — Filter by risk: `HIGH`, `MEDIUM`, `LOW`, `INFO`
- `dateFrom` / `dateTo` — ISO 8601 date filter
- `tags[]` — Filter by tags
- `page` / `pageSize` — Pagination

### List Items

```http
GET /intelligence?page=1&pageSize=20
```

### Get Item by ID

```http
GET /intelligence/:id
```

---

## Regulation

### Alert Rules

```http
GET    /regulation/rules
POST   /regulation/rules
GET    /regulation/rules/:id
PUT    /regulation/rules/:id
DELETE /regulation/rules/:id
```

Create rule body:
```json
{
  "name": "High-risk EU Recalls",
  "description": "Alert on all HIGH risk recalls",
  "conditions": [
    { "field": "riskLevel", "operator": "eq", "value": "HIGH" },
    { "field": "sourceType", "operator": "eq", "value": "RECALL" }
  ],
  "actions": [
    {
      "type": "notify",
      "config": { "channel": "FEISHU", "webhookUrl": "https://..." }
    }
  ],
  "priority": 10,
  "enabled": true
}
```

### Subscriptions

```http
GET    /regulation/subscriptions
POST   /regulation/subscriptions
GET    /regulation/subscriptions/:id
PUT    /regulation/subscriptions/:id
DELETE /regulation/subscriptions/:id
```

---

## Ingestion

### Trigger Manual Fetch

```http
POST /ingestion/fetch
```

Response:
```json
{ "saved": 15, "skipped": 3, "errors": 0 }
```

### List Sources

```http
GET /ingestion/sources
```

### List Crawled Items

```http
GET /ingestion/crawled-items?page=1&pageSize=20
```

---

## Governance

### User Management (admin only)

```http
POST /governance/users
GET  /governance/users
```

### Audit Logs (admin/auditor)

```http
GET /governance/audit-logs?page=1&pageSize=50
```

### Current User

```http
GET /governance/me
```

---

## Error Responses

All errors follow:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/v1/intelligence",
  "method": "GET",
  "message": { "error": "Validation failed" }
}
```

Common status codes:
- `400` — Bad request / validation error
- `401` — Unauthorized (missing or invalid token)
- `403` — Forbidden (insufficient roles)
- `404` — Resource not found
- `409` — Conflict (e.g., duplicate email)
- `500` — Internal server error
