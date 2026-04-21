import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface CncaItem {
  id: string;
  title: string;
  content: string;
  date: string;
  url: string;
}

export class CncaChinaAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'cnca-china',
      url: 'https://www.cnca.gov.cn',
      name: 'CNCA China',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<{ items: CncaItem[] }>(
      '/cnca/xw/tzgg/index.shtml',
      { headers: { Accept: 'application/json, text/html' } },
    );

    const items: CncaItem[] = response.data?.items ?? [];
    const results: CrawledItemDto[] = [];

    for (const item of items) {
      const url = item.url ?? `https://www.cnca.gov.cn/cnca/xw/tzgg/${item.id}.shtml`;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = item.content ?? item.title ?? '';
      const publishDate = item.date ?? new Date().toISOString();

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.DOMESTIC,
        title: item.title,
        url,
        publishDate,
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(item.title, publishDate, rawContent),
        metadata: { sourceRegion: 'CN', sourceBody: 'CNCA' },
      });
    }

    return results;
  }
}
