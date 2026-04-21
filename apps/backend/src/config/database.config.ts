import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'sentinel'),
    password: configService.get<string>('DB_PASSWORD', 'sentinel_pass'),
    database: configService.get<string>('DB_DATABASE', 'sentinel_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
    logging: configService.get<string>('DB_LOGGING', 'false') === 'true',
    charset: 'utf8mb4',
    timezone: 'Z',
    extra: {
      connectionLimit: 10,
    },
  };
}
