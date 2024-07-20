import mongoose, { Schema } from 'mongoose';

const thumbNailScheme: Schema = new Schema({
    storage: String,
    location: String,
    ext: String,
});

const ThumbnailModel = mongoose.model('Thumbnail', thumbNailScheme);

export { ThumbnailModel };