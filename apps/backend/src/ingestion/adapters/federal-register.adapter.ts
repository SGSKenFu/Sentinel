import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface FederalRegisterArticle {
  document_number: string;
  title: string;
  abstract: string;
  publication_date: string;
  html_url: string;
  type: string;
  agencies: Array<{ name: string }>;
}

interface FederalRegisterResponse {
  results: FederalRegisterArticle[];
}

export class FederalRegisterAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'federal-register',
      url: 'https://www.federalregister.gov',
      name: 'US Federal Register',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<FederalRegisterResponse>(
      '/api/v1/documents.json?conditions[type][]=RULE&conditions[type][]=PROPOSED_RULE&per_page=20&order=newest',
    );

    const articles = response.data?.results ?? [];
    const results: CrawledItemDto[] = [];

    for (const article of articles) {
      const url = article.html_url;
      const fingerprint = this.buildFingerprint(url);
      const rawContent = `${article.abstract ?? ''}\nAgencies: ${article.agencies?.map((a) => a.name).join(', ')}\nType: ${article.type}`;

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.REGULATION,
        title: article.title,
        url,
        publishDate: article.publication_date,
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(article.title, article.publication_date, rawContent),
        metadata: { documentNumber: article.document_number, type: article.type },
      });
    }

    return results;
  }
}
