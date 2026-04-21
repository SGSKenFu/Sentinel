import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export function createOpenSearchClient(configService: ConfigService): Client {
  const node = configService.get<string>('OPENSEARCH_NODE', 'http://localhost:9200');
  const username = configService.get<string>('OPENSEARCH_USERNAME', '');
  const password = configService.get<string>('OPENSEARCH_PASSWORD', '');

  return new Client({
    node,
    auth:
      username && password
        ? { username, password }
        : undefined,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export const OPENSEARCH_CLIENT = 'OPENSEARCH_CLIENT';
