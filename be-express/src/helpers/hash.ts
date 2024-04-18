import bcrypt from 'bcrypt';

export async function hash(data: string, saltRounds = 10): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashdedData = await bcrypt.hash(data, salt);
    return hashdedData;
}

export async function compare(data: string, encrypted: string) {
    return bcrypt.compare(data, encrypted);
}
