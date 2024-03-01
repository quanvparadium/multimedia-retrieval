// user.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(Number(id));
  }

  @Post()
  async create(@Body() userData: CreateUserDto): Promise<any> {
    return this.userService.create(userData);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.userService.update(Number(id), userData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.delete(Number(id));
  }
}
