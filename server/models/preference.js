import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

const propertiesSchema = new mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        propertyPreferenceIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Property',
                unique: true,
            },
        ],
        userId: mongoose.Schema.Types.ObjectId,
    },
    { collection: 'preference' }
);

export default mongoose.model('Preference', propertiesSchema);
