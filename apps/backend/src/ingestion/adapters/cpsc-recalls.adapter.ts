import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface CpscRecall {
  RecallID: string;
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  URL: string;
  Title: string;
  Products: Array<{ Description: string }>;
  Hazards: Array<{ Name: string }>;
}

interface CpscApiResponse {
  Recalls: CpscRecall[];
}

export class CpscRecallsAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'cpsc-recalls',
      url: 'https://www.saferproducts.gov',
      name: 'CPSC Recalls',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<CpscApiResponse>(
      'https://www.cpsc.gov/cgi-bin/CPSCUploads/export.aspx?Facility=&pageNumber=1&pageSize=20&type=json',
    );

    const recalls: CpscRecall[] = response.data?.Recalls ?? [];
    const results: CrawledItemDto[] = [];

    for (const recall of recalls) {
      const url = recall.URL ?? `https://www.cpsc.gov/Recalls/${recall.RecallNumber}`;
      const fingerprint = this.buildFingerprint(url);
      const title = recall.Title ?? recall.Description ?? 'CPSC Recall';
      const publishDate = recall.RecallDate ?? new Date().toISOString();
      const rawContent = [
        `Products: ${recall.Products?.map((p) => p.Description).join(', ')}`,
        `Hazards: ${recall.Hazards?.map((h) => h.Name).join(', ')}`,
        `Description: ${recall.Description}`,
      ].join('\n');

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.RECALL,
        title,
        url,
        publishDate,
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(title, publishDate, rawContent),
        metadata: { recallId: recall.RecallID, recallNumber: recall.RecallNumber },
      });
    }

    return results;
  }
}
