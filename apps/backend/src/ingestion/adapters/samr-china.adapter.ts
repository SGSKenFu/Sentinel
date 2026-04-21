import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface SamrItem {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  url: string;
  category: string;
}

export class SamrChinaAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'samr-china',
      url: 'https://www.samr.gov.cn',
      name: 'SAMR China',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    // SAMR provides RSS/XML feeds; fetch news list
    const response = await this.http.get<{ items: SamrItem[] }>(
      '/web/xw/gsph/index.html',
      { headers: { Accept: 'application/json, text/html' } },
    );

    const items: SamrItem[] = response.data?.items ?? [];
    const results: CrawledItemDto[] = [];

    for (const item of items) {
      const url = item.url ?? `https://www.samr.gov.cn/xw/gsph/${item.id}.html`;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = item.content ?? item.title ?? '';
      const publishDate = item.publishDate ?? new Date().toISOString();

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
        metadata: { category: item.category, sourceRegion: 'CN' },
      });
    }

    return results;
  }
}
