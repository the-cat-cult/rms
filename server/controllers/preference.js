import Preference from "../models/preference.js";
import user from "../models/user.js";
import mongoose from "mongoose";

export function getPreference(req, res) {
    let userId = req.user._id;

    Preference.findOne({userId: userId})
        .then(async (preference) => {

            await Preference.populate(preference, {path: 'propertyPreferenceIds', model: 'Property'})

            return res.status(200).json({
                success: true,
                message: 'Result',
                Preferences: preference,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });

}

export async function addPreference(req, res) {
    let userId = req.user._id;
    let propertyId = req.body.propertyId;

    let preference = await Preference.findOne({userId: userId});

    if (!preference) {
        preference = new Preference({
            _id: new mongoose.Types.ObjectId(),
            propertyPreferenceIds: [],
            userId: userId
        })
    }

    let propertyPreferenceIds = preference.propertyPreferenceIds;
    if (propertyPreferenceIds.length === 3) {
        return res.status(400).json({
            success: false,
            message: 'Preference limit reached'
        });
    }

    if (propertyPreferenceIds.includes(propertyId)) {
        return res.status(400).json({
            success: false,
            message: 'Property already added'
        });
    }

    propertyPreferenceIds.push(propertyId);
    preference.propertyPreferenceIds = propertyPreferenceIds;

    await preference.save()
        .then((preference) => {
            return res.status(200).json({
                success: true,
                message: 'Property Added',
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
}

export function deletePreference(req, res) {
    let userId = req.user._id;
    let propertyId = req.body.propertyId;

    Preference.findOne({userId: userId})
        .then((preference) => {
            Preference.updateOne({userId: userId},
                {propertyPreferenceIds: preference.propertyPreferenceIds.filter((id) => propertyId === id)})
                .then((preference) => {
                    return res.status(200).json({
                        success: true,
                        message: 'Preference updated',
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err.message,
                    });
                });

        }).catch((err) => {
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: err.message,
        });
    });
}