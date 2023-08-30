import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
const bookingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    preferenceNumber: Number,
    allotmentStatus: String,
    propertyId: mongoose.Schema.Types.ObjectId,
    ownerId: BigInt,
    tenantId: String
}, { collection: "bookings" });
export default mongoose.model('Booking', bookingSchema);