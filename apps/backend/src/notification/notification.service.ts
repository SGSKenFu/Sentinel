import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotificationRecord } from './entities/notification-record.entity';
import { FeishuAdapter } from './adapters/feishu.adapter';
import { WechatWorkAdapter } from './adapters/wechat-work.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { WebhookAdapter } from './adapters/webhook.adapter';
import { IntelligenceItemEntity } from '../intelligence/entities/intelligence-item.entity';
import { NotificationChannel, RuleAction } from '@sentinel/types';

export interface NotificationContext {
  item: IntelligenceItemEntity;
  actions: RuleAction[];
  tenantId: string;
  ruleId?: string;
  subscriptionId?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationRecord)
    private readonly recordRepo: Repository<NotificationRecord>,
    private readonly feishu: FeishuAdapter,
    private readonly wechatWork: WechatWorkAdapter,
    private readonly email: EmailAdapter,
    private readonly webhook: WebhookAdapter,
    private readonly configService: ConfigService,
  ) {}

  async send(ctx: NotificationContext): Promise<void> {
    for (const action of ctx.actions) {
      if (action.type !== 'notify' && action.type !== 'webhook') continue;

      const channel = action.config['channel'] as NotificationChannel | undefined;
      const record = this.recordRepo.create({
        tenantId: ctx.tenantId,
        ruleId: ctx.ruleId ?? null,
        subscriptionId: ctx.subscriptionId ?? null,
        intelligenceItemId: ctx.item.id,
        channel: channel ?? NotificationChannel.WEBHOOK,
        payload: JSON.stringify(action.config),
        success: false,
      });

      try {
        await this.dispatchNotification(ctx.item, action, channel);
        record.success = true;
      } catch (err) {
        record.errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`Notification failed for channel ${channel ?? 'unknown'}: ${record.errorMessage}`);
      }

      await this.recordRepo.save(record);
    }
  }

  private async dispatchNotification(
    item: IntelligenceItemEntity,
    action: RuleAction,
    channel?: NotificationChannel,
  ): Promise<void> {
    const config = action.config;

    const validChannels = Object.values(NotificationChannel) as string[];
    if (channel !== undefined && !validChannels.includes(channel)) {
      throw new Error(`Unsupported notification channel: ${channel}`);
    }

    switch (channel) {
      case NotificationChannel.FEISHU: {
        const webhookUrl =
          config['webhookUrl'] ?? this.configService.get<string>('FEISHU_WEBHOOK_URL', '');
        await this.feishu.send(webhookUrl, {
          title: item.title,
          content: item.summary,
          riskLevel: item.riskLevel,
          sourceType: item.sourceType,
          url: item.url,
        });
        break;
      }

      case NotificationChannel.WECHAT_WORK: {
        const webhookUrl =
          config['webhookUrl'] ?? this.configService.get<string>('WECHAT_WORK_WEBHOOK_URL', '');
        await this.wechatWork.send(webhookUrl, {
          title: item.title,
          content: item.summary,
          riskLevel: item.riskLevel,
          url: item.url,
        });
        break;
      }

      case NotificationChannel.EMAIL: {
        const to = config['to'] ?? '';
        await this.email.send({
          to,
          subject: `[Sentinel] [${item.riskLevel}] ${item.title}`,
          text: `${item.summary}\n\nView: ${item.url}`,
          html: `<h2>[${item.riskLevel}] ${item.title}</h2><p>${item.summary}</p><p><a href="${item.url}">View Full Details</a></p>`,
        });
        break;
      }

      case NotificationChannel.WEBHOOK:
      default: {
        const url = action.type === 'webhook' ? config['url'] ?? '' : config['url'] ?? '';
        await this.webhook.send(url, {
          event: 'intelligence.alert',
          timestamp: new Date().toISOString(),
          data: {
            id: item.id,
            title: item.title,
            summary: item.summary,
            riskLevel: item.riskLevel,
            sourceType: item.sourceType,
            url: item.url,
            publishDate: item.publishDate,
          },
        });
        break;
      }
    }
  }
}
