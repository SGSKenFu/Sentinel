import { CrawledItemDto } from '../dtos/crawled-item.dto';
import { IntelligenceItem } from '@sentinel/types';

export abstract class NormalizerBase {
  abstract normalize(raw: CrawledItemDto): Partial<IntelligenceItem>;

  protected parseDate(dateStr: string): Date {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();
  }

  protected extractTags(text: string): string[] {
    const keywords = [
      'CE', 'RoHS', 'REACH', 'EMC', 'LVD', 'RED', 'ATEX',
      'UL', 'FCC', 'FDA', 'CPSC', 'OSHA',
      'GB', 'CCC', 'SAMR', 'CNCA',
      'ISO', 'IEC', 'EN', 'ANSI', 'ASTM',
    ];
    const upper = text.toUpperCase();
    return keywords.filter((kw) => upper.includes(kw));
  }
}
