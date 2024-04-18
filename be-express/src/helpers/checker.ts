export function checkIsEmail(email: string) {
    checkIsString(email);
    // Regular expression for checking email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
        throw new Error('`${email} is not correct format for email`');
}

interface ILengthOptions {
    min?: number;
    max?: number;
}
export function checkLength(data: string, options: ILengthOptions) {
    checkIsString(data);
    const length = data.length;
    if (options.max && length > options.max) {
        throw new Error(`${data} must have length less than ${options.max}`);
    }
    if (options.min && length > options.min) {
        throw new Error(`${data} must have length less than ${options.min}`);
    }
}

export function checkIsString(data: string) {
    if (typeof data != 'string') throw new Error(`${data} is not string`);
}
