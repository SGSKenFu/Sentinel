import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';

@Injectable()
export class RuleService {
  private readonly logger = new Logger(RuleService.name);

  constructor(
    @InjectRepository(AlertRuleEntity)
    private readonly ruleRepo: Repository<AlertRuleEntity>,
  ) {}

  async create(tenantId: string, dto: CreateRuleDto): Promise<AlertRuleEntity> {
    const rule = this.ruleRepo.create({ ...dto, tenantId });
    return this.ruleRepo.save(rule);
  }

  async findAll(tenantId: string): Promise<AlertRuleEntity[]> {
    return this.ruleRepo.find({
      where: { tenantId },
      order: { priority: 'DESC', createdAt: 'DESC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<AlertRuleEntity> {
    const rule = await this.ruleRepo.findOne({ where: { id, tenantId } });
    if (!rule) throw new NotFoundException(`Alert rule ${id} not found`);
    return rule;
  }

  async update(id: string, tenantId: string, dto: UpdateRuleDto): Promise<AlertRuleEntity> {
    const rule = await this.findById(id, tenantId);
    Object.assign(rule, dto);
    return this.ruleRepo.save(rule);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    await this.findById(id, tenantId);
    await this.ruleRepo.delete({ id, tenantId });
  }

  async findEnabled(tenantId: string): Promise<AlertRuleEntity[]> {
    return this.ruleRepo.find({
      where: { tenantId, enabled: true },
      order: { priority: 'DESC' },
    });
  }
}
