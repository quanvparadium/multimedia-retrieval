import { DeepPartial, Repository } from 'typeorm';
import postgresDB from '~/connections/postgres';
import { User } from '~/entities/user.entity';

export class UserService {
    private userRepo: Repository<User>;
    constructor() {
        this.userRepo = postgresDB.getRepo(User);
    }

    async create(data: DeepPartial<User>) {
        const user = this.userRepo.create(data);
        await this.userRepo.save(user);
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
}
