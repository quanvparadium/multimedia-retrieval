import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Email is not valid' })
    email: string;

    @Length(6, 20, { message: 'Password must be between 6 and 20 chars' })
    @IsString()
    password: string;

    @Length(2, 20, { message: 'Name must be between 2 and 20 chars' })
    @IsString()
    name: string;
}

export class LoginUserDto {
    @IsEmail({}, { message: 'Email is not valid' })
    email: string;

    @Length(6, 20, { message: 'Password must be between 6 and 20 chars' })
    @IsString()
    password: string;
}
