import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuditAction } from '@sentinel/types';

export interface AuthTokenResponse {
  accessToken: string;
  user: Omit<UserEntity, 'passwordHash'>;
  expiresIn: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string): Promise<AuthTokenResponse> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, active: true },
      select: ['id', 'email', 'name', 'roles', 'tenantId', 'active', 'passwordHash', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: user.tenantId,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    await this.auditRepo.save(
      this.auditRepo.create({
        userId: user.id,
        tenantId: user.tenantId,
        action: AuditAction.LOGIN,
        resource: 'auth',
        ipAddress: ipAddress ?? null,
      }),
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { accessToken, user: userWithoutPassword, expiresIn };
  }

  async createUser(tenantId: string, dto: CreateUserDto): Promise<UserEntity> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
      roles: dto.roles ?? ['viewer'],
      tenantId,
      active: dto.active ?? true,
    });

    return this.userRepo.save(user);
  }

  async findUsers(tenantId: string): Promise<UserEntity[]> {
    return this.userRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findAuditLogs(
    tenantId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ data: AuditLogEntity[]; total: number }> {
    const [data, total] = await this.auditRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { data, total };
  }
}
