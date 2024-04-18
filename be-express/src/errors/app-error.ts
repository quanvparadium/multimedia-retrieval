export class AppError extends Error {
    private _statusCode;

    constructor(message: string, statusCode: number) {
        super(message);
        this._statusCode = statusCode;
    }

    get statusCode() {
        return this._statusCode;
    }

    get () {}
}
