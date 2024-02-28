import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const optSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    mobileNumber: Number,
}, { collection: "superadmin" });

export default mongoose.model('SuperAdmin', optSchema);