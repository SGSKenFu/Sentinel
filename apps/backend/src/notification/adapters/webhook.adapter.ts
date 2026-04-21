import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

@Injectable()
export class WebhookAdapter {
  private readonly logger = new Logger(WebhookAdapter.name);

  async send(url: string, payload: WebhookPayload, secret?: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Sentinel-Event': payload.event,
    };

    if (secret) {
      headers['X-Sentinel-Secret'] = secret;
    }

    await axios.post(url, payload, { headers, timeout: 15000 });
    this.logger.log(`Webhook delivered to ${url}: ${payload.event}`);
  }
}
