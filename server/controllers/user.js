import mongoose from "mongoose";
import User from "../models/user.js";
import bcrypt from 'bcrypt'

export async function createUser(req, res) {

    const saltRounds = 10;
    let hash = null
    if (req.body.password != null) {
        hash = bcrypt.hashSync(req.body.password, saltRounds);
    }

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        mobileNumber: req.body.mno,
        isOTPverified: false,
        password: hash
    })

    try {
        const newUser = await user
            .save();
        return res.status(201).json({
            success: true,
            message: 'New user successfully added',
            User: newUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in adding a new user' + error
        });
    }
}

export function getAllUsers(req, res) {
    User.find()
        .then((allUser) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Users',
                User: allUser,
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

export function getOneUser(req, res) {
    User.findOne({ mobileNumber: req.body.mno })
        .then((oneUser) => {
            return res.status(200).json({
                success: true,
                message: 'Result',
                User: oneUser,
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

export async function updateUser(req, res) {
    if (req.body.password != null) {
        const saltRounds = 10;
        const passwordHash = bcrypt.hashSync(req.body.password, saltRounds);
        const updateObject = req.body
        updateObject['password'] = passwordHash
        User.findOneAndUpdate({ mobileNumber: req.body.mno }, { $set: updateObject })
            .then((updatedUser) => {
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
    } else {
        const updateObject = req.body
        User.findOneAndUpdate({ mobileNumber: req.body.mno }, { $set: updateObject })
            .then((updatedUser) => {
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
}

export function deleteUser(req, res) {
    User.findOneAndDelete({ mobileNumber: req.body.mno })
        .then((oneUser) => {
            return res.status(200).json({
                success: true,
                message: 'Deleted User',
                User: oneUser,
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