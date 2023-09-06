import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const optSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
    image: {
        data: Buffer,
        contentType: String,
    }

}, {collection: "images"});

export default mongoose.model('Images', optSchema);