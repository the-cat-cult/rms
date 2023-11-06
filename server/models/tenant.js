import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const tenantSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    mobileNumber: Number,
    dateOfReporting: Date,
    dateOfVacation: Date,
    allocationStatus: {
        type: String,
        enum: ['no', 'yes'],
        default: 'no'
    },
    allocatedProperty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
    }
}, {collection: "tenants"});
export default mongoose.model('Tenant', tenantSchema);