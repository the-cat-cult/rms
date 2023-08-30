import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import Otp from "../models/otp.js";
import mongoose from "mongoose";
import unirest from 'unirest'

//TODO: Add modules: userSignUp -> anyone can signup, tenantSignUp -> auth token type admin is required
//TODO: Add modules: login -> two flows, user and admin
//TODO: Change phone number -> request admin to change phone number

//TODO: sign up for user -> admin
export async function userSignUp(req, res) {

    const otp = req.body.otp;
    const mobileNumber = req.body.mno;

    const otpRecord = await Otp.findOne({ mobileNumber: mobileNumber });

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

    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        mobileNumber: mobileNumber,
        isOTPverified: false,
    })

    try {
        const newUser = await user
            .save();

        await Otp.deleteOne({ mobileNumber: mobileNumber });
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

export async function generateOTP(req, res) {
    const phone = req.body.phone;

    //random generate OTP  4 digit
    const code = Math.floor(1000 + Math.random() * 9000);

    //TODO: Generate OTP

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

    const otpRecord = new Otp({
        _id: new mongoose.Types.ObjectId(),
        mobileNumber: phone,
        otp: code,
    });

    try {
        await otpRecord
            .save();
        return res.status(201).json({
            success: true,
            message: 'New user successfully added',
            OTP: code
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error in generating new OTP' + error
        });
    }


}

export async function tenantSignUp(req, res) {

}