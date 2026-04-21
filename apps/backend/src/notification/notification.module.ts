import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationRecord } from './entities/notification-record.entity';
import { NotificationService } from './notification.service';
import { FeishuAdapter } from './adapters/feishu.adapter';
import { WechatWorkAdapter } from './adapters/wechat-work.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { WebhookAdapter } from './adapters/webhook.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRecord]), ConfigModule],
  providers: [NotificationService, FeishuAdapter, WechatWorkAdapter, EmailAdapter, WebhookAdapter],
  exports: [NotificationService],
})
export class NotificationModule {}
