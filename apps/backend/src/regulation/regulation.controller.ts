import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RuleService } from './rule.service';
import { SubscriptionService } from './subscription.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Regulation')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('regulation')
export class RegulationController {
  constructor(
    private readonly ruleService: RuleService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // Alert Rules
  @Post('rules')
  @ApiOperation({ summary: 'Create alert rule' })
  createRule(@CurrentUser() user: JwtPayload, @Body() dto: CreateRuleDto) {
    return this.ruleService.create(user.tenantId, dto);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List alert rules' })
  listRules(@CurrentUser() user: JwtPayload) {
    return this.ruleService.findAll(user.tenantId);
  }

  @Get('rules/:id')
  @ApiOperation({ summary: 'Get alert rule by ID' })
  getRule(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ruleService.findById(id, user.tenantId);
  }

  @Put('rules/:id')
  @ApiOperation({ summary: 'Update alert rule' })
  updateRule(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.ruleService.update(id, user.tenantId, dto);
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete alert rule' })
  deleteRule(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.ruleService.remove(id, user.tenantId);
  }

  // Subscriptions
  @Post('subscriptions')
  @ApiOperation({ summary: 'Create subscription' })
  createSubscription(@CurrentUser() user: JwtPayload, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(user.sub, user.tenantId, dto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions for current user' })
  listSubscriptions(@CurrentUser() user: JwtPayload) {
    return this.subscriptionService.findByUser(user.sub, user.tenantId);
  }

  @Get('subscriptions/:id')
  @ApiOperation({ summary: 'Get subscription by ID' })
  getSubscription(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionService.findById(id, user.tenantId);
  }

  @Put('subscriptions/:id')
  @ApiOperation({ summary: 'Update subscription' })
  updateSubscription(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSubscriptionDto>,
  ) {
    return this.subscriptionService.update(id, user.tenantId, dto);
  }

  @Delete('subscriptions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete subscription' })
  deleteSubscription(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.subscriptionService.remove(id, user.tenantId);
  }
}
