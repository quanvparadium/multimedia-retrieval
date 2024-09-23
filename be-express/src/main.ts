import 'reflect-metadata';
import app from './app';
import { MONGO_URI, PORT } from './config';
import postgresDB from './connections/postgres';
import mongoose from 'mongoose';

postgresDB.connect();
mongoose.connect(MONGO_URI, { dbName: 'datn' });



app.listen(PORT, () => {
    console.log(`Welcome to my app in port ${PORT}`);
});
