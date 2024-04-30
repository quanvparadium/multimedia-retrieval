import { Document, MongoClient } from 'mongodb';

export default class MongoDB {
    private client: MongoClient;
    private db: string;
    constructor(uri: string, db: string) {
        this.client = new MongoClient(uri);
        this.db = db;
    }

    public async connect() {
        try {
            await this.client.connect();
            console.log('MongoDB connect successfully');
        } catch (err) {
            console.log(err);
        }
    }

    public getCollection<T extends Document>(nameCollection: string) {
        return this.client.db(this.db).collection<T>(nameCollection);
    }
}
