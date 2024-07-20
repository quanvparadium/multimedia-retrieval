import { DeepPartial, Repository } from 'typeorm';
import postgresDB from '~/connections/postgres';
import { User } from '~/entities/user.entity';
import FileSystemService from '../file-system/file-system.service';

export class UserService {
    private userRepo: Repository<User>;
    private fileSystemService: FileSystemService;
    constructor() {
        this.userRepo = postgresDB.getRepo(User);
        this.fileSystemService = new FileSystemService();
    }

    async create(data: DeepPartial<User>) {
        const user = this.userRepo.create(data);
        return await this.userRepo.save(user);
    }

    async createRootFolderInMongo(id: number) {
        await this.fileSystemService.createRoot(id);
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
