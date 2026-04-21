import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { TenantEntity } from './entities/tenant.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GovernanceController } from './governance.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, TenantEntity, AuditLogEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'fallback_secret_change_me'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [GovernanceController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],
})
export class GovernanceModule {}
