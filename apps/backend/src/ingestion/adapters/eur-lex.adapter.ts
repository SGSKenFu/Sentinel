import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface EurLexDocument {
  CELEX_ID: string;
  TITLE: string;
  DATE_DOCUMENT: string;
  RESOURCE_LEGAL_IS_ABOUT_SUBJECT: string;
}

interface EurLexResponse {
  results: EurLexDocument[];
}

export class EurLexAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'eur-lex',
      url: 'https://eur-lex.europa.eu',
      name: 'EUR-Lex',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dateFrom = thirtyDaysAgo.toISOString().split('T')[0];

    const response = await this.http.get<EurLexResponse>(
      `/search.html?qid=&text=product+safety&scope=EURLEX&type=quick&lang=en&formats=&FM_CODED=REG&DTS_DOM=ALL&ordering=dd&DD_MIN=${dateFrom}&page=1&pageSize=20&format=json`,
    );

    const docs = response.data?.results ?? [];
    const results: CrawledItemDto[] = [];

    for (const doc of docs) {
      const url = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${doc.CELEX_ID}`;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = `${doc.TITLE}\nSubject: ${doc.RESOURCE_LEGAL_IS_ABOUT_SUBJECT ?? ''}`;

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.REGULATION,
        title: doc.TITLE,
        url,
        publishDate: doc.DATE_DOCUMENT ?? new Date().toISOString(),
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(doc.TITLE, doc.DATE_DOCUMENT ?? '', rawContent),
        metadata: { celexId: doc.CELEX_ID },
      });
    }

    return results;
  }
}
