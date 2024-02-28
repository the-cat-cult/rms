import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import Otp from "../models/otp.js";
import mongoose from "mongoose";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";
import SuperAdmin from "../models/super-admin.js";

function setExpDateTime(minutes) {
    let curr = new Date()
    return new Date(curr.getTime() + minutes * 60000);
}

export async function signUp(req, res) {
    let otp = req.body.otp;
    const mobileNumber = req.body.phone;
    const name = req.body.name;
    const type = req.body.type;

    if (!mobileNumber) {
        return res.status(400).json({
            success: false,
            message: 'Please attach mobile number'
        });
    }

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Please attach name'
        });
    }

    if (!type) {
        return res.status(400).json({
            success: false,
            message: 'Please attach type'
        });
    }

    if (type !== 'Homeowner' && type !== 'Tenant') {
        return res.status(400).json({
            success: false,
            message: 'Invalid user type'
        });
    }

    const existingOwner = await User.findOne({mobileNumber: mobileNumber});

    if (existingOwner) {
        return res.status(400).json({
            success: false,
            message: 'Owner already exists'
        });
    } else {
        const existingTenant = await Tenant.findOne({mobileNumber: mobileNumber});
        if (existingTenant) {
            return res.status(400).json({
                success: false,
                message: 'Tenant already exists'
            });
        }
    }

    let otpRecord = await Otp.findOne({mobileNumber: mobileNumber});

    if (process.env.NODE_ENV_OTP === 'development') {
        otpRecord = {}
        otpRecord.otp = 1234;
    }

    otpRecord.otp = parseInt(otpRecord.otp)
    otp = parseInt(otp)

    if (!otpRecord) {
        return res.status(400).json({
            success: false,
            message: 'OTP not found'
        });
    }

    if (otpRecord.otp !== otp) {
        return res.status(400).json({
            success: false,
            message: 'OTP not matched'
        });
    }

    let user;
    let role = '';

    if (type === 'Homeowner') {
        role = 'owner'
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            mobileNumber: mobileNumber
        })
    } else {
        role = 'tenant'
        user = new Tenant({
            _id: new mongoose.Types.ObjectId(),
            name: name,
            mobileNumber: mobileNumber
        })
    }

    try {
        const newUser = await user
            .save();

        await Otp.deleteOne({mobileNumber: mobileNumber});

        const token = generateJWTToken(newUser, role);

        return res
            .cookie("user-auth-token", token, {
                httpOnly: true,
                secure: false,
            })
            .status(200)
            .json({
                success: true,
                role: role,
                mobileNumber: mobileNumber,
                name: newUser.name,
                message: 'Owner successfully registered',
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in adding a new user' + error
        });
    }
}

async function sendSMS(code, phone) {
    try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
            method: 'POST',
            headers: {
                Authorization: process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                variables_values: code,
                route: 'otp',
                numbers: phone,
            }),
        });

        // Check for the status code
        if (response.status !== 200) {
            const responseData = await response.json(); // Parse JSON response
            const errorMessage = responseData ? responseData.message : 'Unknown error';
            console.error(`Failed to send SMS. Status: ${response.status}. Error: ${errorMessage}`);
            return {
                status: false,
                message: errorMessage
            };
        } else {
            console.log('SMS sent successfully');
            return {
                status: true,
                message: 'SMS sent successfully'
            };
        }

    } catch (error) {
        // Log the error message without throwing an exception
        const errorMessage = error.message || 'Unknown error';
        console.error('Error sending SMS:', errorMessage);
        return {
            status: false,
            message: errorMessage
        };
    }
}



export async function generateOTP(req, res) {
    const phone = req.body.phone;

    if (process.env.NODE_ENV_OTP === 'development') {
        return res.status(201).json({
            success: true,
            message: 'OTP successfully generated',
        });
    }

    const code = Math.floor(1000 + Math.random() * 9000);
    let otpRecord = await Otp.findOne({mobileNumber: phone});
    let expDateTime = setExpDateTime(5);

    if (!otpRecord) {
        otpRecord = new Otp({
            _id: new mongoose.Types.ObjectId(),
            mobileNumber: phone,
            otp: code,
            exp: expDateTime,
        });
    } else {
        otpRecord.otp = code;
        otpRecord.exp = expDateTime;
    }


    try {
        let response = await sendSMS(code, phone);

        if(!response.status) {
            return res.status(500).json({
                success: false,
                message: response.message
            });
        }

        await otpRecord
            .save();
        return res.status(201).json({
            success: true,
            message: 'OTP successfully generated',
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Error in generating new OTP' + error
        });
    }
}

export async function login(req, res) {

    let otp = req.body.otp;
    const mobileNumber = req.body.phone;

    let user = await User.findOne({mobileNumber: mobileNumber});
    let role = 'owner';

    if (user) {
        if (user.isAdmin) {
            role = 'admin';
        } else {
            role = 'owner';
        }
    } else {
        user = await Tenant.findOne({mobileNumber: mobileNumber});

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }

        role = 'tenant';
    }

    let otpRecord = await Otp.findOne({mobileNumber: mobileNumber});

    //if env is def
    if (process.env.NODE_ENV_OTP === 'development') {
        otpRecord = {}
        otpRecord.otp = 1234;
    }

    if (!otpRecord) {
        return res.status(400).json({
            success: false,
            message: 'OTP not found'
        });
    }

    //parse both values to number
    otpRecord.otp = parseInt(otpRecord.otp);
    otp = parseInt(otp);

    if (otpRecord.otp !== otp) {
        return res.status(400).json({
            success: false,
            message: 'OTP not matched'
        });
    }

    const token = generateJWTToken(user, role);

    await Otp.deleteOne({mobileNumber: mobileNumber});
    const superAdmin = await SuperAdmin.findOne({mobileNumber: mobileNumber}).exec();

    let isSuperAdmin = false;

    if (superAdmin) {
        isSuperAdmin = true
    }

    return res
        .cookie("user-auth-token", token, {
            httpOnly: true,
            secure: false,
        })
        .status(200)
        .json({
            success: true,
            role: role,
            name: user.name,
            mobileNumber: mobileNumber,
            isSuperAdmin: isSuperAdmin,
            message: 'Login successful'
        });
}

function generateJWTToken(user, role) {
    return jwt.sign({_id: user._id, role: role}, process.env.JWT_SECRET_KEY);
}

export function singOut(req, res) {
    return res
        .clearCookie("user-auth-token")
        .status(200)
        .json({
            success: true,
            message: 'Signout successful'
        });
}

export async function checkAuth(req, res) {
    const superAdmin = await SuperAdmin.findOne({mobileNumber: req.user.mobileNumber}).exec();

    let isSuperAdmin = false;

    if (superAdmin) {
        isSuperAdmin = true
    }

    return res.status(200).json({
        success: true,
        name: req.user.name,
        role: req.user.role,
        mobileNumber: req.user.mobileNumber,
        isSuperAdmin: isSuperAdmin,
        message: 'User is authenticated'
    });
}