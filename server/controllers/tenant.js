import mongoose from "mongoose";
import Tenant from "../models/tenant.js";
import User from "../models/user.js";
import Bookings from "../models/bookings.js";

export async function createTenant(req, res) {

    const { name, mno, dor, dov } = req.body;

    //validate data
    if (!(name && mno && dor && dov)) {
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


    if (!dor.match(/\d{4}-\d{2}-\d{2}/)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date of reporting'
        });
    }

    if (!dov.match(/\d{4}-\d{2}-\d{2}/)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid date of vacation'
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
        dateOfReporting: dor,
        dateOfVacation: dov,
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
                await Bookings.deleteOne({tenantId: oneTenant._id});
                console.log('Booking for property deleted successfully');
            } catch (error) {
                console.error('Error deleting bookin:', error);
            }

            await Bookings.deleteOne({tenantId: id})

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
