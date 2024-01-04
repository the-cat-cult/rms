import mongoose from "mongoose";
import Tenant from "../models/tenant.js";
import User from "../models/user.js";
import Bookings from "../models/bookings.js";
import Properties from "../models/properties.js";

export async function createTenant(req, res) {

    const { name, mno } = req.body;

    //validate data
    if (!(name && mno)) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (mno.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Mobile number should be of 10 digits'
        });
    }

    //check if number in user or tenant
    const existingTenant = await Tenant.findOne({ mobileNumber: mno });
    if (existingTenant) {
        return res.status(400).json({
            success: false,
            message: 'Tenant already exists'
        });
    } else {
        const existingUser = await User.findOne({ mobileNumber: mno });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
    }

    const tenant = new Tenant({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        mobileNumber: mno,
    })

    return tenant
        .save()
        .then((newTenant) => {
            return res.status(201).json({
                success: true,
                message: 'New tenant successfully added',
                Tenant: newTenant
            });
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: 'Error in adding a new tenant' + error
            })
        });
}

export function verifyTenant(req, res) {
    let mobileNumber = req.body.mobileNumber;
    let verified = req.body.verified;

    let updateFields = {
        verified: verified,
    };

    if (!verified) {
        updateFields.allocationStatus = 'no';
        updateFields.allocatedProperty = undefined;
    }

    Tenant.findOneAndUpdate({ mobileNumber: mobileNumber }, updateFields)
        .then(async (tenant) => {

            if (!verified) {
                await cleanupOnTenantChange(tenant._id)
            }

            return res.status(200).json({
                success: true,
                message: verified ? 'Tenant verified' : 'Tenant unverified',
                Tenant: tenant,
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


export function getAllTenants(req, res) {
    Tenant.find()
        .then((allTenant) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Tenants',
                Tenant: allTenant,
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

export async function getOneTenantById(req, res) {
    const id = req.query.tenant_id

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No id provided'
        });
    }

    Tenant.findOne({ _id: id })
        .populate('allocatedProperty')
        .then(async (oneTenant) => {
            let bookings = await Bookings.find({tenantId: id});
            if (bookings.length === 0) {
                console.log('No bookings found', bookings)
                oneTenant.allocationStatus = 'no'
                oneTenant.allocatedProperty = null
                oneTenant.save()
            }

            return res.status(200).json({
                success: true,
                message: 'Result',
                Tenant: oneTenant,
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

export function getOneTenant(req, res) {
    let mobileNumber = req.user.mobileNumber;

    if (req.user.role === 'admin') {
        mobileNumber = req.body.mobileNumber;
    }

    Tenant.findOne({ mobileNumber: mobileNumber })
        .populate('allocatedProperty')
        .then((oneTenant) => {
            return res.status(200).json({
                success: true,
                message: 'Result',
                Tenant: oneTenant,
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

export async function updateTenant(req, res) {
    let mobileNumber = req.user.mobileNumber;

    if (req.user.role === 'admin') {
        mobileNumber = req.body.mobileNumber;
    }

    const updateObject = req.body
    Tenant.findOneAndUpdate({ mobileNumber: mobileNumber }, { $set: updateObject })
        .then((updatedTenant) => {
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

export function deleteTenantById(req, res) {
    let id = req.query.tenant_id

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No id provided'
        });
    }

    Tenant.findOneAndDelete({ _id: id })
        .then(async (oneTenant) => {

            try {
                await cleanupOnTenantChange(oneTenant._id)
                console.log('Booking for property deleted successfully');
            } catch (error) {
                console.error('Error deleting booking:', error);
            }

            return res.status(200).json({
                success: true,
                message: 'Deleted Tenant',
                Tenant: oneTenant,
            });
        }).catch((err) => {
            res.status(500).json({
                success: false,
                message: 'Server error. Please try again.',
                error: err.message,
            });
        });
}

async function cleanupOnTenantChange(tenantId) {
    try {
        const bookings = await Bookings.find({ tenantId: tenantId });
        for (const booking of bookings) {
            const property = await Properties.findOne({ _id: booking.propertyId });

            if (property) {
                property.vacancyStatus = true;
                await property.save();
            }
        }
        await Bookings.deleteMany({ tenantId: tenantId });
    } catch (error) {
        console.error('Error during cleanup:', error.message);
        throw error;  // Propagate the error if needed
    }
}
