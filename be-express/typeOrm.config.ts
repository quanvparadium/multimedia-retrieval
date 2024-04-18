import { config } from 'dotenv';
import * as fs from 'fs';
import { DataSource } from 'typeorm';

function configEnvFolder(folderPath: string) {
    const envFiles: any[] = [];
    fs.readdirSync(folderPath).forEach((file) => {
        if (file.endsWith('.env')) {
            envFiles.push(`${folderPath}/${file}`);
        }
    });
    config({ path: envFiles });
}
configEnvFolder('env');

class ConfigService {
    get(name: string) {
        return process.env[name];
    }
}
const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.get('POSTGRES_HOST') ?? 'localhost',
    port: Number(configService.get('POSTGRES_PORT')) ?? 3306,
    username: configService.get('POSTGRES_USER') ?? 'root',
    password: configService.get('POSTGRES_PASSWORD') ?? '',
    database: configService.get('POSTGRES_DB') ?? 'test',
    schema: 'public',
    entities: ['src/**/*.entity{.ts,.js}'],
    migrations: ['migrations/*{.ts,.js}']
});
