import * as fs from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

export const moveFile = async (src: string, dst: string) => {
    if (!isExistFile(src)) throw new Error(`File at ${src} is not exist`);
    return new Promise((resolve, reject) => {
        fs.rename(src, dst, (err) => {
            if (err) {
                return reject(err);
            }
            resolve('OK');
        });
    });
};

export const isExistFile = (src: string) => {
    return new Promise((resolve) => {
        fs.access(src, fs.constants.F_OK, (err) => {
            if (err) {
                resolve(false); // File does not exist
            } else {
                resolve(true); // File exists
            }
        });
    });
};
