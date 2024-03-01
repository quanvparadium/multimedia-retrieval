import { config } from 'dotenv';
import * as fs from 'fs'


export function configEnvFolder(folderPath:string){
    const envFiles = [];
    fs.readdirSync(folderPath).forEach(file => {
        if (file.endsWith('.env')) {
            envFiles.push(`${folderPath}/${file}`);
        }
    });
    config({path:envFiles});
}