import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import Otp from "../models/otp.js";
import mongoose from "mongoose";
import unirest from 'unirest'
import jwt from "jsonwebtoken";

export async function ownerSignUp(req, res) {
    const otp = req.body.otp;
    const mobileNumber = req.body.mno;
    const name = req.body.name;

    const otpRecord = await Otp.findOne({mobileNumber: mobileNumber});

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

    //check if user already exists
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

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: name,
        mobileNumber: mobileNumber,
        isAdmin: req.body.isAdmin
    })

    try {
        const newUser = await user
            .save();

        await Otp.deleteOne({mobileNumber: mobileNumber});

        const token = generateJWTToken(newUser, "owner");

        return res
            .cookie("user-auth-token", token, {
                httpOnly: true,
                secure: false,
            })
            .status(200)
            .json({
                success: true,
                message: 'Owner successfully registered',
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in adding a new user' + error
        });
    }
}

function sendSMS(code, phone) {
    const req = unirest("POST", "https://www.fast2sms.com/dev/bulkV2");

    req.headers({
        "authorization": "B7YnZprFjHLm4ui1aqJzAW6cOvwS8IkRyPUf9GVKlNEDt35Xbsldg6QCnOY4MbuvjhVq0wx3WSDp9zs2"
    });

    req.form({
        "variables_values": code,
        "route": "otp",
        "numbers": phone,
    });

    req.end(function (res) {
        if (res.error) throw new Error(res.error);

        console.log(res.body);
    });
}

export async function generateOTP(req, res) {
    const phone = req.body.phone;

    const code = Math.floor(1000 + Math.random() * 9000);
    let otpRecord = await Otp.findOne({mobileNumber: phone});

    if (!otpRecord) {
        otpRecord = new Otp({
            _id: new mongoose.Types.ObjectId(),
            mobileNumber: phone,
            otp: code,
        });
    } else {
        otpRecord.otp = code;
    }


    try {
        sendSMS(code, phone);
        await otpRecord
            .save();
        return res.status(201).json({
            success: true,
            message: 'OTP successfully generated',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in generating new OTP' + error
        });
    }
}

export async function login(req, res) {

    let otp = req.body.otp;
    const mobileNumber = req.body.phone;

    const otpRecord = await Otp.findOne({mobileNumber: mobileNumber});

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

    const token = generateJWTToken(user, role);

    return res
        .cookie("user-auth-token", token, {
            httpOnly: true,
            secure: false,
        })
        .status(200)
        .json({
            success: true,
            message: 'Login successful'
        });
}

function generateJWTToken(user, role) {
    return jwt.sign({_id: user._id, role: role}, process.env.JWT_SECRET_KEY);
}