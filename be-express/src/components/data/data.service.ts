import { File } from 'formidable';
import { DeepPartial, Repository } from 'typeorm';
import postgresDB from '~/connections/postgres';
import { Data } from '~/entities/data.entity';
import { UserService } from '../user/user.service';
import { User } from '~/entities/user.entity';

export class DataService {
    private dataRepo: Repository<Data>;
    private userRepo: Repository<User>;
    private userService: UserService;

    constructor() {
        this.dataRepo = postgresDB.getRepo(Data);
        this.userService = new UserService();
        this.userRepo = this.userService.repo;
    }

    public async addNewFile(userId: number, blob: File) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new Error(`Cannot find user with id ${userId}`);
        const newData = this.dataRepo.create();
        const type: any = blob.mimetype?.split('/')?.[0];
        const whiteListType = ['video', 'image'];
        if (!type || !(type in whiteListType))
            throw new Error('We just support image and video type, try another file');
        newData.size = blob.size;
        newData.type = type;
        newData.status = 'active';
        newData.user = user;
        newData.fileName = blob.originalFilename || 'none';
        const savedData = await this.dataRepo.save(newData);
        return savedData;
    }
}
