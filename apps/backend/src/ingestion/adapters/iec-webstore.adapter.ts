import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface IecPublication {
  pubId: string;
  ref: string;
  title: string;
  pubdate: string;
  type: string;
  ics: string;
}

interface IecApiResponse {
  publications: IecPublication[];
}

export class IecWebstoreAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'iec-webstore',
      url: 'https://webstore.iec.ch',
      name: 'IEC Webstore',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<IecApiResponse>(
      '/rest/store/search?q=&type=IS&status=published&pageSize=20&pageNumber=1',
    );

    const pubs = response.data?.publications ?? [];
    const results: CrawledItemDto[] = [];

    for (const pub of pubs) {
      const url = `https://webstore.iec.ch/publication/${pub.pubId}`;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = `${pub.title}\nReference: ${pub.ref}\nType: ${pub.type}\nICS: ${pub.ics ?? ''}`;

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.STANDARD,
        title: `${pub.ref} - ${pub.title}`,
        url,
        publishDate: pub.pubdate ?? new Date().toISOString(),
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(pub.ref, pub.pubdate ?? '', rawContent),
        metadata: { pubId: pub.pubId, ref: pub.ref, type: pub.type },
      });
    }

    return results;
  }
}
