import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const tenantSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    mobileNumber: Number,
    rank: String,
    unit: String,
    dateOfReporting: Date,
    dateOfVacation: Date,
    allocationStatus: String
}, {collection: "tenants"});
export default mongoose.model('Tenant', tenantSchema);