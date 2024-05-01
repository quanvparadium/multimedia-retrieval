import { MONGO_DATABASE, MONGO_URI } from '~/config';
import MongoDB from './mongo.class';

const mongoDB = new MongoDB(MONGO_URI, MONGO_DATABASE);

export default mongoDB;
