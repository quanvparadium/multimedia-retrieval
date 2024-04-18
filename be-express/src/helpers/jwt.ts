import jwt from 'jsonwebtoken';

export class JWT {
    private jwtKey: string;
    constructor(jwtKey: string) {
        this.jwtKey = jwtKey;
    }
    sign(data: any, duration: string | number) {
        return jwt.sign(data, this.jwtKey, {
            expiresIn: duration
        });
    }
    verify(data: string) {
        return jwt.verify(data, this.jwtKey, {
            complete: false
        });
    }

    isExpired(data: jwt.JwtPayload | string) {
        console.log(data);
        if (typeof data == 'string') return true;
        return (data?.exp ?? 0) * 1000 < Date.now();
    }
}
