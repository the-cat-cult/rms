import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
const bookingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    bookingId: mongoose.Schema.Types.ObjectId,
    preferenceNumber: {
        type: Number,
        default: 0
    },
    allotmentStatus: {
        type: Boolean,
        default: false
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    tenantId: mongoose.Schema.Types.ObjectId
}, { collection: "bookings" });
export default mongoose.model('Booking', bookingSchema);