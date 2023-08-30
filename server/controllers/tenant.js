import mongoose from "mongoose";
import Tenant from "../models/tenant.js";
import bcrypt from "bcrypt";

export function createTenant(req, res) {

    const saltRounds = 10;
    let hash = null
    if (req.body.password != null) {
        hash = bcrypt.hashSync(req.body.password, saltRounds);
    }

    const tenant = new Tenant({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        mobileNumber: req.body.mno,
        rank: req.body.rank,
        tenantId: req.body.tid,
        unit: req.body.unit,
        password: hash,
        isOTPverified: false,
        dateOfReporting: req.body.dor,
        dateOfVacation: req.body.dov,
        allocationStatus: req.body.allocStat
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

export function getOneTenant(req, res) {
    Tenant.findOne({ mobileNumber: req.body.mno })
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
    const updateObject = req.body
    if (req.body.password != null) {
        const saltRounds = 10;
        const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);
        const updateObject = req.body
        updateObject['password'] = passwordHash
    }
    Tenant.findOneAndUpdate({ mobileNumber: req.body.mno }, { $set: updateObject })
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

export function deleteTenant(req, res) {
    Tenant.findOneAndDelete({ mobileNumber: req.body.mno })
        .then((oneTenant) => {
            return res.status(200).json({
                success: true,
                message: 'Deleted Tenant',
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