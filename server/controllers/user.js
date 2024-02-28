import mongoose from "mongoose";
import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import Properties from "../models/properties.js";
import Bookings from "../models/bookings.js";
import Property from "../models/properties.js";
import Images from "../models/images.js";
import SuperAdmin from "../models/super-admin.js";

export async function createUser(req, res) {

    const {name, mno, isAdmin} = req.body;

    if (!(name && mno)) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (isNaN(mno) || mno.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Mobile number should be of 10 digits'
        });
    }

    const existingUser = await User.findOne({mobileNumber: mno});
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User already exists'
        });
    } else {
        const existingTenant = await Tenant.findOne({mobileNumber: mno});
        if (existingTenant) {
            return res.status(400).json({
                success: false,
                message: 'Tenant already exists'
            });
        }
    }

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        mobileNumber: mno,
        verified: true,
        isAdmin: isAdmin || false
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

export function getAllSellers(req, res) {
    User.find({isAdmin: false})
        .then((allUser) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Sellers',
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

export function verifyUser(req, res) {
    let mobileNumber = req.body.mobileNumber;
    let verified = req.body.verified;

    User.findOneAndUpdate({mobileNumber: mobileNumber}, {verified: verified})
        .then((oneUser) => {

            if (!verified) {
                Properties
                    .find({ownerId: oneUser._id})
                    .then((allProperties) => {
                        allProperties.forEach((property) => {
                            Bookings.deleteMany({propertyId: property._id})
                                .then((result) => {
                                    console.log('Deleted bookings of unverified user');
                                })
                                .catch((err) => {
                                    console.log('Error in deleting bookings of unverified user');
                                });
                        });
                        Properties.deleteMany({ownerId: oneUser._id})
                            .then((result) => {
                                console.log('Deleted properties of unverified user');
                            })
                            .catch((err) => {
                                console.log('Error in deleting properties of unverified user');
                            });
                    })
            }


            return res.status(200).json({
                success: true,
                message: verified ? 'User verified' : 'User unverified',
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

export function getOneOwnerById(req, res) {
    const id = req.query.owner_id

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No id provided'
        });
    }

    User.findOne({_id: id})
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

export function getOneUser(req, res) {
    let mobileNumber = req.user.mobileNumber;

    if (req.user.role === 'admin') {
        mobileNumber = req.body.mobileNumber;
    }

    User.findOne({mobileNumber: mobileNumber})
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
    let mobileNumber = req.user.mobileNumber;

    if (req.user.role === 'admin') {
        mobileNumber = req.body.mobileNumber;
    }

    const updateObject = req.body
    User.findOneAndUpdate({mobileNumber: mobileNumber}, {$set: updateObject})
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

export function deleteOwnerById(req, res) {
    let id = req.query.owner_id;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No id provided'
        });
    }

    User.findOneAndDelete({ _id: id, isAdmin: false })
        .then(async (oneUser) => {
            if (!oneUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner not found'
                });
            }

            // Fetch properties owned by the user
            const manyProperties = await Property.find({ ownerId: oneUser._id });

            for (const oneProperty of manyProperties) {
                const imageIds = oneProperty.images.map(image => new mongoose.Types.ObjectId(image));
                const deleteQuery = { _id: { $in: imageIds } };

                await Images.deleteMany(deleteQuery)
                    .then(result => {
                        console.log(`${result.deletedCount} images deleted successfully.`);
                    })
                    .catch(error => {
                        console.error(`Error deleting images: ${error}`);
                    });

                try {
                    await Bookings.deleteOne({ propertyId: oneProperty._id });
                    console.log(`Booking for property with ID: ${oneProperty._id} deleted successfully`);
                } catch (error) {
                    console.error('Error deleting booking:', error);
                }

                await Property.deleteOne({ _id: oneProperty._id });
                console.log(`Property with ID: ${oneProperty._id} deleted successfully`);
            }

            // Now that all properties are processed, you can delete the user
            return res.status(200).json({
                success: true,
                message: 'Deleted Owner',
                Tenant: oneUser,
            });
        }).catch((err) => {
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: err.message,
        });
    });
}

export async function deleteAdminById(req, res) {
    let id = req.query.admin_id;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: 'No id provided'
        });
    }

    let mobileNumber = req.user.mobileNumber;
    const superAdmin = await SuperAdmin.findOne({mobileNumber: mobileNumber}).exec();

    if (!superAdmin) {
        return res.status(400).json({
            success: false,
            message: 'You are not a super admin'
        });
    }

    User.findOneAndDelete({_id: id, isAdmin: true})
        .then(async (oneUser) => {
            if (!oneUser) {
                return res.status(404).json({
                    success: false,
                    message: 'Owner not found'
                });
            }

            if (mobileNumber === oneUser.mobileNumber) {
                if (!oneUser) {
                    return res.status(400).json({
                        success: false,
                        message: 'You cannot delete yourself'
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: 'Deleted admin',
                Tenant: oneUser,
            });
        }).catch((err) => {
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again.',
            error: err.message,
        });
    });
}

export function getAllAdmins(req, res) {
    User.find({isAdmin: true})
        .then((admin) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Admins',
                Admins: admin,
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