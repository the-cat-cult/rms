import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  mobileNumber: Number,
  isOTPverified: Boolean,
  password: String
}, { collection: "users" });

export default mongoose.model('User', userSchema);