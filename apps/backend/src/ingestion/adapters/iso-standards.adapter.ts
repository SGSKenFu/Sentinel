import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface IsoStandard {
  id: string;
  title: string;
  reference: string;
  publication_date: string;
  ics: string;
}

interface IsoApiResponse {
  data: IsoStandard[];
}

export class IsoStandardsAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'iso-standards',
      url: 'https://www.iso.org',
      name: 'ISO Standards',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<IsoApiResponse>(
      '/api/v1/standards?q=&lifecycle=Published&page=1&pageSize=20',
    );

    const standards = response.data?.data ?? [];
    const results: CrawledItemDto[] = [];

    for (const std of standards) {
      const url = `https://www.iso.org/standard/${std.id}.html`;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = `${std.title}\nReference: ${std.reference}\nICS: ${std.ics ?? ''}`;

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.STANDARD,
        title: `${std.reference} - ${std.title}`,
        url,
        publishDate: std.publication_date ?? new Date().toISOString(),
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(std.reference, std.publication_date ?? '', rawContent),
        metadata: { isoId: std.id, reference: std.reference, ics: std.ics },
      });
    }

    return results;
  }
}
