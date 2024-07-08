import mongoose, { Schema } from 'mongoose';

const metaDataScheme: Schema = new Schema({
    storage: String,
    location: String,
    size: Number,
    mimetype: String
});

const fileSystemSchema: Schema = new Schema({
    userId: { type: String || Number, required: true },
    childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FileSystem' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'FileSystem', default: null },
    type: { type: String, enum: ['file', 'folder'], required: true },
    name: { type: String, required: true },
    metaData: {
        type: metaDataScheme,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

fileSystemSchema.index({ userId: 1 });

fileSystemSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    this.createdAt = new Date();
    next();
});

fileSystemSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function (next) {
    this.set({ updatedAt: new Date() });
    next();
});

const FileSystemModel = mongoose.model<typeof fileSystemSchema>('FileSystem', fileSystemSchema);

type IFileSystemModel = typeof FileSystemModel;
export { FileSystemModel, IFileSystemModel };