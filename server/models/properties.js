import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
const propertiesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    propertyId: mongoose.Schema.Types.ObjectId,
    address: String,
    propertyType: String,
    bhk: String,
    location: String,
    lat: mongoose.Schema.Types.Decimal128,
    long: mongoose.Schema.Types.Decimal128,
    rent: mongoose.Schema.Types.Decimal128,
    securityDeposit: mongoose.Schema.Types.Decimal128,
    age: mongoose.Schema.Types.Number,
    vacancyStatus: String,
    ownerId: Number

}, { collection: "properties" });
export default mongoose.model('Property', propertiesSchema);