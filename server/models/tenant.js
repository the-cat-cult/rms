import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const tenantSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    mobileNumber: Number,
    allocationStatus: {
        type: String,
        enum: ['no', 'yes'],
        default: 'no'
    },
    allocatedProperty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {collection: "tenants"});
export default mongoose.model('Tenant', tenantSchema);