import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
const propertiesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    propertyId: mongoose.Schema.Types.ObjectId,
    address: String,
    propertyType: String,
    bhk: String,
    location: String,
    lat: Number,
    long: Number,
    rent: Number,
    securityDeposit: Number,
    age: Number,
    vacancyStatus: String,
    ownerId: mongoose.Schema.Types.ObjectId

}, { collection: "properties" });
export default mongoose.model('Property', propertiesSchema);