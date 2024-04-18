import {
    DataSource,
    DataSourceOptions,
    EntityTarget,
    ObjectLiteral
} from 'typeorm';

export default class PostgresDB {
    private dataSource: DataSource;
    constructor(dataSourceOptions: DataSourceOptions) {
        this.dataSource = new DataSource(dataSourceOptions);
    }

    public async connect() {
        try {
            await this.dataSource.initialize();
            console.log('Connect to PostgresDB successfully');
        } catch (err) {
            console.log(err);
        }
    }

    public getRepo<T extends ObjectLiteral>(entity: EntityTarget<T>) {
        return this.dataSource.getRepository(entity);
    }
}
