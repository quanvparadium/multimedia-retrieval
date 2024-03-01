// user.service.ts
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async create(userData: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
