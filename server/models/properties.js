import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const propertiesSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    address: String,
    propertyType: String,
    bhk: String,
    location: String,
    lat: {
        type: Number,
        default: 0
    },
    long: {
        type: Number,
        default: 0
    },
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
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Images',
        default: []
    }],

}, {collection: "properties"});
export default mongoose.model('Property', propertiesSchema);