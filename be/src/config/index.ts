import { ConfigService } from '@nestjs/config';
import { configEnvFolder } from 'src/helpers/env';
configEnvFolder('env');

const configService = new ConfigService();

//1. Config for database
export const POSTGRES_HOST = configService.get('POSTGRES_HOST') ?? 'localhost';
export const POSTGRES_PORT = configService.get('POSTGRES_PORT') ?? 3306;
export const POSTGRES_USER = configService.get('POSTGRES_USER') ?? 'root';
export const POSTGRES_PASSWORD = configService.get('POSTGRES_PASSWORD') ?? '';
export const POSTGRES_DB = configService.get('POSTGRES_DB') ?? 'test';
