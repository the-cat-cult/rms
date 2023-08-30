import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const optSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    mobileNumber: Number,
    otp: Number,
}, { collection: "users" });

export default mongoose.model('OTP', optSchema);