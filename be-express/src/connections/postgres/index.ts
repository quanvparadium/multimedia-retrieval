import PostgresDB from './postgres.class';
import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_PORT,
    POSTGRES_USER
} from '~/config';

const postgresDB = new PostgresDB({
    type: 'postgres',
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DB,
    entities: ['src/entities/*.{ts,js}'],
    logging: true,
    synchronize: true
});

export default postgresDB;
