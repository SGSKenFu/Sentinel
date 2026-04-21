# Sentinel Deployment Guide

## Prerequisites

- Docker & Docker Compose 2.x
- Node.js 20.x (for local development)
- npm 10.x

## Local Development

### 1. Clone and setup

```bash
git clone https://github.com/your-org/sentinel.git
cd sentinel
cp .env.example .env
# Edit .env with your settings
```

### 2. Start infrastructure

```bash
docker-compose up -d mysql opensearch opensearch-dashboards
```

Wait for services to be healthy:
```bash
docker-compose ps
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start backend

```bash
npm run dev:backend
```

Backend starts on http://localhost:3000
Swagger UI: http://localhost:3000/api/docs

### 5. Start frontend

```bash
npm run dev:frontend
```

Frontend starts on http://localhost:5173

---

## Production Deployment

### Docker Compose (all-in-one)

```bash
# Build production images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL host | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `LLM_API_KEY` | OpenAI/compatible API key | Optional |
| `LLM_BASE_URL` | LLM API base URL | Optional |
| `OPENSEARCH_NODE` | OpenSearch URL | Yes |
| `SMTP_HOST` | SMTP server for emails | Optional |
| `FEISHU_WEBHOOK_URL` | Feishu bot webhook | Optional |
| `WECHAT_WORK_WEBHOOK_URL` | WeChat Work webhook | Optional |

### Security Checklist

- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Set strong database passwords
- [ ] Enable HTTPS via reverse proxy (nginx/traefik)
- [ ] Set `DB_SYNCHRONIZE=false` in production (use migrations)
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Set `NODE_ENV=production`

### Database Migration (production)

In production, set `DB_SYNCHRONIZE=false` and use TypeORM migrations:

```bash
cd apps/backend
npm run build
npx typeorm migration:generate -n InitialMigration
npx typeorm migration:run
```

### OpenSearch Index Setup

The backend automatically creates the `sentinel-intelligence` index on first run. To configure index settings for production:

```bash
curl -X PUT "http://opensearch:9200/sentinel-intelligence" \
  -H "Content-Type: application/json" \
  -d '{"settings": {"number_of_shards": 3, "number_of_replicas": 1}}'
```

### Health Checks

- Backend: `GET /api/v1/governance/me` (returns 401 if running)
- MySQL: `mysqladmin ping`
- OpenSearch: `GET http://opensearch:9200/_cluster/health`

### Monitoring

Logs are written to stdout in JSON format (production) or colorized text (development).

For production, configure a log aggregator (ELK/Loki) to collect from Docker stdout:

```yaml
# docker-compose.override.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
```

### Scaling

The backend is stateless and can be horizontally scaled. Use a load balancer in front of multiple backend instances:

```yaml
services:
  backend:
    deploy:
      replicas: 3
```

Ensure all backend instances share the same MySQL and OpenSearch.
