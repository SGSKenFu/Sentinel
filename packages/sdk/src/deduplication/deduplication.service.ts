import { createHash } from 'crypto';

export class DeduplicationService {
  static fingerprintFromUrl(url: string): string {
    return createHash('sha256').update(url.trim().toLowerCase()).digest('hex');
  }

  static contentHash(title: string, date: string, summary: string): string {
    const normalized = `${title.trim()}|${date.trim()}|${summary.trim()}`;
    return createHash('sha256').update(normalized).digest('hex');
  }

  static isDuplicate(existingFingerprints: Set<string>, fingerprint: string): boolean {
    return existingFingerprints.has(fingerprint);
  }
}
