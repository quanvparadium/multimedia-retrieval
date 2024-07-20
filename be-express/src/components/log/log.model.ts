import mongoose from "mongoose";

const logScheme = new mongoose.Schema({
    userId: { type: String || Number, required: true },
    fileSystemId: { type: mongoose.Types.ObjectId, required: true },
    action: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', logScheme);

export default Log;