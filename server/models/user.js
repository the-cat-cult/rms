import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  mobileNumber: Number,
  isOTPverified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, { collection: "users" });

export default mongoose.model('User', userSchema);