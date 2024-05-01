import express, { Express, NextFunction, Request, Response } from 'express';
import { UserService } from '../user/user.service';
import { CreateUserDto, LoginUserDto } from '../user/user.dto';
import { assignDataBetWeenTwoObj } from '~/helpers/object';
import { validate } from 'class-validator';
import { AppError } from '~/errors/app-error';
import { extractErrorsFromValidatioṇ̣ } from '~/helpers/validation';
import { hash } from 'bcrypt';
import { JWT } from '~/helpers/jwt';
import { ACCESS_KEY, JWT_KEY, REFRESH_KEY } from '~/config';
import { ACCESS_TOKEN_TIME, REFRESH_TOKEN_TIME } from '~/config/constant';
import { compare } from '~/helpers/hash';
import { DeepPartial } from 'typeorm';
import { User } from '~/entities/user.entity';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const userService = new UserService();
    //1. Validate data
    const dtoUser = new CreateUserDto();
    assignDataBetWeenTwoObj(dtoUser, req.body, ['email', 'name', 'password']);
    const errors = await validate(dtoUser);
    if (errors.length > 0) {
        const newErrors = extractErrorsFromValidatioṇ̣(errors);
        throw new AppError(JSON.stringify(newErrors), 401);
    }
    //2. Check whether user is exist or not
    const isExistUser = await userService.isExistUser(dtoUser.email);
    if (isExistUser) throw new AppError(`User with email ${dtoUser.email} already exist`, 409);
    //3. Create new user
    const newUser = {
        email: dtoUser.email,
        name: dtoUser.name,
        password: await hash(dtoUser.password, 10)
    };
    const createdUser = await userService.create(newUser);
    //4. Also add user in mongoDB
    await userService.createInMongo(createdUser.id);

    res.status(200).json({
        message: 'Create user successfully'
    });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const userService = new UserService();
    //1. Validate data
    const dtoUser = new LoginUserDto();
    assignDataBetWeenTwoObj(dtoUser, req.body, ['email', 'password']);
    const errors = await validate(dtoUser);
    if (errors.length > 0) {
        const newErrors = extractErrorsFromValidatioṇ̣(errors);
        throw new AppError(JSON.stringify(newErrors), 401);
    }
    //2. Check whether data is correct
    const user = await userService.repo.findOne({
        where: {
            email: dtoUser.email
        }
    });
    if (!user) throw new AppError(`User with email ${dtoUser.email} is not exist`, 400);
    const isCorrectPassword = await compare(dtoUser.password, user.password);
    if (!isCorrectPassword)
        throw new AppError(`User with email ${dtoUser.email} input wrong password`, 400);
    //3. Send token for user
    return sendTokensBack(user, res);
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const userService = new UserService();
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) throw new AppError('Refresh token is not exist', 400);
    const jwt = new JWT(REFRESH_KEY);
    let data: any;
    try {
        data = jwt.verify(refreshToken);
    } catch (error: any) {
        throw new AppError(`refreshToken encounter ${error.message} `, 401);
    }
    const user = await userService.repo.findOne({
        where: {
            id: data.id
        }
    });
    if (!user) throw new AppError(`User with this token is not exist`, 400);
    sendTokensBack(user, res);
};

function sendTokensBack(user: DeepPartial<User>, res: Response) {
    const data = {
        email: user.email,
        id: user.id
    };
    const tokens = signPairTokens(data);
    res.status(200).json({
        tokens
    });
}

function signPairTokens(data: any) {
    const accessJWT = new JWT(ACCESS_KEY);
    const refreshJWT = new JWT(REFRESH_KEY);
    const refreshToken = refreshJWT.sign(data, REFRESH_TOKEN_TIME);
    const accessToken = accessJWT.sign(data, ACCESS_TOKEN_TIME);
    return {
        accessToken,
        refreshToken
    };
}

const test = async (req: Request, res: Response, next: NextFunction) => {
    const userService = new UserService();
    console.log(req.body);
    await userService.create(req.body);
    res.status(200).json({
        message: 'oke'
    });
};
