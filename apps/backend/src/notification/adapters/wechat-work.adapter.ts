import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface WechatWorkMessage {
  title: string;
  content: string;
  riskLevel: string;
  url: string;
}

@Injectable()
export class WechatWorkAdapter {
  private readonly logger = new Logger(WechatWorkAdapter.name);

  async send(webhookUrl: string, message: WechatWorkMessage): Promise<void> {
    const riskEmoji: Record<string, string> = {
      HIGH: '🔴',
      MEDIUM: '🟠',
      LOW: '🟡',
      INFO: '🔵',
    };

    const emoji = riskEmoji[message.riskLevel] ?? '🔵';

    const payload = {
      msgtype: 'markdown',
      markdown: {
        content: `## ${emoji} [${message.riskLevel}] Compliance Alert
**${message.title}**

${message.content}

> [View Full Details](${message.url})`,
      },
    };

    await axios.post(webhookUrl, payload, { timeout: 10000 });
    this.logger.log(`WeChat Work notification sent for: ${message.title}`);
  }
}
