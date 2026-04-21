import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IntelligenceService } from './intelligence.service';
import { SearchIntelligenceDto } from './dto/search-intelligence.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('Intelligence')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('search')
  @ApiOperation({ summary: 'Full-text search intelligence items' })
  async search(@CurrentUser() user: JwtPayload, @Query() dto: SearchIntelligenceDto) {
    return this.intelligenceService.search(dto, user.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'List intelligence items with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.intelligenceService.list(user.tenantId, page, pageSize);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single intelligence item by ID' })
  async findById(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.intelligenceService.findById(id, user.tenantId);
  }
}
