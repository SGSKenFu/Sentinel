import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { IntelligenceItemEntity } from '../intelligence/entities/intelligence-item.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subRepo: Repository<SubscriptionEntity>,
  ) {}

  async create(userId: string, tenantId: string, dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    const sub = this.subRepo.create({
      userId,
      tenantId,
      name: dto.name,
      keywords: dto.keywords,
      sourceTypes: dto.sourceTypes ?? [],
      riskLevels: dto.riskLevels ?? [],
      channels: dto.channels,
      active: dto.active ?? true,
    });
    return this.subRepo.save(sub);
  }

  async findAll(tenantId: string): Promise<SubscriptionEntity[]> {
    return this.subRepo.find({ where: { tenantId } });
  }

  async findByUser(userId: string, tenantId: string): Promise<SubscriptionEntity[]> {
    return this.subRepo.find({ where: { userId, tenantId } });
  }

  async findById(id: string, tenantId: string): Promise<SubscriptionEntity> {
    const sub = await this.subRepo.findOne({ where: { id, tenantId } });
    if (!sub) throw new NotFoundException(`Subscription ${id} not found`);
    return sub;
  }

  async update(
    id: string,
    tenantId: string,
    dto: Partial<CreateSubscriptionDto>,
  ): Promise<SubscriptionEntity> {
    const sub = await this.findById(id, tenantId);
    Object.assign(sub, dto);
    return this.subRepo.save(sub);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.findById(id, tenantId);
    await this.subRepo.delete({ id, tenantId });
  }

  matchSubscriptions(
    item: IntelligenceItemEntity,
    subscriptions: SubscriptionEntity[],
  ): SubscriptionEntity[] {
    return subscriptions.filter((sub) => {
      if (!sub.active) return false;

      const keywordMatch =
        sub.keywords.length === 0 ||
        sub.keywords.some(
          (kw) =>
            item.title.toLowerCase().includes(kw.toLowerCase()) ||
            item.summary.toLowerCase().includes(kw.toLowerCase()),
        );

      const sourceTypeMatch =
        sub.sourceTypes.length === 0 || sub.sourceTypes.includes(item.sourceType);

      const riskLevelMatch =
        sub.riskLevels.length === 0 || sub.riskLevels.includes(item.riskLevel);

      return keywordMatch && sourceTypeMatch && riskLevelMatch;
    });
  }
}
