import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Ingestion')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('fetch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger manual data ingestion for all adapters' })
  async triggerFetch(@CurrentUser() user: JwtPayload) {
    return this.ingestionService.fetchAll(user.tenantId);
  }

  @Post('sources')
  @ApiOperation({ summary: 'Register a new intelligence source' })
  async createSource(@CurrentUser() user: JwtPayload, @Body() dto: CreateSourceDto) {
    return this.ingestionService.createSource(user.tenantId, dto);
  }

  @Get('sources')
  @ApiOperation({ summary: 'List all intelligence sources' })
  async listSources(@CurrentUser() user: JwtPayload) {
    return this.ingestionService.listSources(user.tenantId);
  }

  @Get('crawled-items')
  @ApiOperation({ summary: 'List crawled items with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async listCrawledItems(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.ingestionService.listCrawledItems(user.tenantId, page, pageSize);
  }
}
