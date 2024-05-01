import 'reflect-metadata';
import app from './app';
import { PORT } from './config';
import postgresDB from './connections/postgres';
import mongoDB from './connections/mongo';

postgresDB.connect();
mongoDB.connect();

app.listen(PORT, () => {
    console.log(`Welcome to my app in port ${PORT}`);
});
