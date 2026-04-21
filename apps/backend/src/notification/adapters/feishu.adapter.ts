import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface FeishuCardMessage {
  title: string;
  content: string;
  riskLevel: string;
  sourceType: string;
  url: string;
}

@Injectable()
export class FeishuAdapter {
  private readonly logger = new Logger(FeishuAdapter.name);

  async send(webhookUrl: string, message: FeishuCardMessage): Promise<void> {
    const riskColors: Record<string, string> = {
      HIGH: 'red',
      MEDIUM: 'orange',
      LOW: 'yellow',
      INFO: 'blue',
    };

    const color = riskColors[message.riskLevel] ?? 'blue';

    const payload = {
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: `[${message.riskLevel}] ${message.title}` },
          template: color,
        },
        elements: [
          {
            tag: 'div',
            text: { tag: 'lark_md', content: message.content },
          },
          {
            tag: 'div',
            fields: [
              { is_short: true, text: { tag: 'lark_md', content: `**Source:** ${message.sourceType}` } },
              { is_short: true, text: { tag: 'lark_md', content: `**Risk:** ${message.riskLevel}` } },
            ],
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: { tag: 'plain_text', content: 'View Details' },
                url: message.url,
                type: 'primary',
              },
            ],
          },
        ],
      },
    };

    await axios.post(webhookUrl, payload, { timeout: 10000 });
    this.logger.log(`Feishu notification sent for: ${message.title}`);
  }
}
