import mongoose from "mongoose";
import Property from "../models/properties.js";

export function createProperty(req, res) {
    const property = new Property({
        _id: new mongoose.Types.ObjectId(),
        address: req.body.addr,
        propertyType: req.body.ptype,
        bhk: req.body.bhk,
        location: req.body.location,
        lat: req.body.lat,
        long: req.body.long,
        rent: req.body.rent,
        securityDeposit: req.body.secdep,
        age: req.body.age,
        ownerId: req.user._id
    })

    return property
        .save()
        .then((newProperty) => {
            return res.status(201).json({
                success: true,
                message: 'New property successfully added',
                Property: newProperty
            });
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: 'Error in adding a new property' + error
            })
        });
}

export function getAllProperties(req, res) {
    Property.find({vacancyStatus: true})
        .then((allProperty) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Properties',
                Properties: allProperty,
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

export function getAllPropertiesByUser(req, res) {
    Property.find({ownerId: req.user._id})
        .then((allProperty) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Properties',
                Properties: allProperty,
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

export function setVerificationStatus(req, res) {
    let verified = req.body.verified;
    let propertyId = req.body.pid;
    if(verified === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Please attach verified value',
        });
    }

    Property.findOneAndUpdate({_id: propertyId}, {$set: { verified: verified }})
        .then((updatedProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Object Updated'
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

export function getOneProperty(req, res) {
    Property.findOne({_id: req.body.pid})
        .then((oneProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Result',
                Property: oneProperty,
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

export function getPropertyById(req, res) {

    Property.findOne({_id: req.body.pid})
        .then((oneProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Result',
                Property: oneProperty,
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

export function getPropertiesByFilters(req, res) {
    const {bhk, minRent, maxRent, area} = req.body;
    let query = {};
    if (bhk) {
        query.bhk = bhk;
    }
    if (minRent) {
        query.rent = {$gte: minRent};
    }
    if (maxRent) {
        query.rent = {$lte: maxRent};
    }
    if (area) {
        query.location = area;
    }

    Property.find(query).then((properties) => {
        return res.status(200).json({
            success: true,
            message: 'Result',
            Property: properties.filter(propertiesData => propertiesData.vacancyStatus === true),
        });
    }).catch((err) => {
        res.status(400).json({
            success: false,
            message: 'Filters failed',
            error: err.message,
        });
    });
}

export async function updateProperty(req, res) {
    const updateObject = req.body

    let updateProp = {_id: req.body.pid}

    if (req.user.role !== "admin") {
        updateProp.ownerId = req.user._id;
        delete updateObject.verified
    }

    Property.findOneAndUpdate(updateProp, {$set: updateObject})
        .then((updatedProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Object Updated'
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

export async function deleteProperty(req, res) {
    Property.findOneAndDelete({_id: req.body.pid, ownerId: req.user._id})
        .then((oneProperty) => {
            return res.status(200).json({
                success: true,
                message: 'Deleted Property',
                Property: oneProperty,
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