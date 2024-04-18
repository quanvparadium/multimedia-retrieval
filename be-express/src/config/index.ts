import { configEnvFolder } from '~/helpers/env';

configEnvFolder('env');
//0. Config
export const PORT = process.env.PORT || 3000;
export const JWT_KEY = process.env.JWT_KEY || 'quan_key';
export const ACCESS_KEY = process.env.ACCESS_KEY || 'quan_key';
export const REFRESH_KEY = process.env.REFRESH_KEY || 'quan_key';
//1. Config for postgres
export const POSTGRES_HOST = process.env.POSTGRES_HOST ?? 'localhost';
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) ?? 3306;
export const POSTGRES_USER = process.env.POSTGRES_USER ?? 'root';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD ?? '';
export const POSTGRES_DB = process.env.POSTGRES_DB ?? 'test';
//2. Config for mongodb
export const MONGO_USER = process.env.MONGO_INITDB_ROOT_USERNAME;
export const MONGO_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
export const MONGO_HOST = process.env.MONGO_HOST;
export const MONGO_PORT = process.env.MONGO_PORT;
export const MONGO_DATABASE = process.env.MONGO_DATABASE;
