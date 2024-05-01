import { DeepPartial, Repository } from 'typeorm';
import mongoDB from '~/connections/mongo';
import postgresDB from '~/connections/postgres';
import { User } from '~/entities/user.entity';
import { UserInMongo } from './user-mongo';
import { Collection } from 'mongodb';

export class UserService {
    private userRepo: Repository<User>;
    private userCollection: Collection<UserInMongo>;
    constructor() {
        this.userRepo = postgresDB.getRepo(User);
        this.userCollection = mongoDB.getCollection<UserInMongo>('user');
    }

    async create(data: DeepPartial<User>) {
        const user = this.userRepo.create(data);
        return await this.userRepo.save(user);
    }

    async createInMongo(id: number) {
        const data = await this.userCollection.insertOne({
            id,
            folder: {}
        });
        console.log(data);
    }

    async isExistUser(email: string | undefined) {
        const user = await this.userRepo.findOne({
            where: {
                email
            }
        });
        if (user) return true;
        else return false;
    }

    get repo() {
        return this.userRepo;
    }

    get collection() {
        return this.userCollection;
    }
}
