import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const propertiesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    address: String,
    propertyType: String,
    bhk: String,
    location: String,
    lat: Number,
    long: Number,
    rent: Number,
    securityDeposit: Number,
    age: Number,
    vacancyStatus: {
        type: Boolean,
        default: true
    },
    ownerId: mongoose.Schema.Types.ObjectId,
    verified: {
        type: Boolean,
        default: false
    }

}, {collection: "properties"});
export default mongoose.model('Property', propertiesSchema);