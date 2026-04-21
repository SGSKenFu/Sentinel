import { HttpAdapter } from '@sentinel/sdk';
import { CrawledItemDto } from '@sentinel/sdk';
import { SourceType } from '@sentinel/types';

interface EuSafetyGateItem {
  reference: string;
  title: string;
  description: string;
  date: string;
  url: string;
  category?: string;
  riskType?: string;
}

export class EuSafetyGateAdapter extends HttpAdapter {
  constructor(tenantId: string) {
    super({
      sourceId: 'eu-safety-gate',
      url: 'https://ec.europa.eu',
      name: 'EU Safety Gate',
      tenantId,
    });
  }

  async fetch(): Promise<CrawledItemDto[]> {
    const response = await this.http.get<{ alerts: EuSafetyGateItem[] }>(
      'https://ec.europa.eu/safety-gate-alerts/screen/webService/getNotifications?riskType=SERIOUS&limit=20&offset=0',
    );

    const alerts = response.data?.alerts ?? [];
    const results: CrawledItemDto[] = [];

    for (const alert of alerts) {
      const url =
        alert.url ??
        `https://ec.europa.eu/safety-gate-alerts/screen/consumer/notification/${alert.reference}`;
      const fingerprint = this.buildFingerprint(url);
      const publishDate = alert.date ?? new Date().toISOString();
      const rawContent = `${alert.description ?? ''}\nCategory: ${alert.category ?? ''}\nRisk: ${alert.riskType ?? ''}`;

      results.push({
        sourceId: this.config.sourceId,
        tenantId: this.config.tenantId,
        sourceType: SourceType.RECALL,
        title: alert.title ?? `EU Safety Alert ${alert.reference}`,
        url,
        publishDate,
        rawContent,
        fingerprint,
        contentHash: this.buildContentHash(alert.title ?? '', publishDate, rawContent),
        metadata: { reference: alert.reference, category: alert.category },
      });
    }

    return results;
  }
}
