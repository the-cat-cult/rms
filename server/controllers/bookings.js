import mongoose from "mongoose";
import Booking from "../models/bookings.js";

export function createBooking(req, res) {
    const booking = new Booking({
        _id: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        preferenceNumber: req.body.pnumber,
        allotmentStatus: req.body.allotmentStatus,
        propertyId: req.body.pid,
        ownerId: req.body.oid,
        tenantId: req.body.tid
    })

    return booking
        .save()
        .then((newBooking) => {
            return res.status(201).json({
                success: true,
                message: 'New booking successfully added',
                Booking: newBooking
            });
        })
        .catch((error) => {
            return res.status(500).json({
                success: false,
                message: 'Error in adding a new booking' + error
            })
        });
}

export function getAllBookings(req, res) {
    Booking.find()
        .then((allBooking) => {
            return res.status(200).json({
                success: true,
                message: 'A list of all Bookings',
                Booking: allBooking,
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

export function getOneBooking(req, res) {
    Booking.findOne({ bookingId: req.body.bid })
        .then((oneBooking) => {
            return res.status(200).json({
                success: true,
                message: 'Result',
                Booking: oneBooking,
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

export async function updateBooking(req, res) {
    const updateObject = req.body
    Booking.findOneAndUpdate({ bookingId: req.body.bid }, { $set: updateObject })
        .then((updatedBooking) => {
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

export function deleteBooking(req, res) {
    Booking.findOneAndDelete({ bookingId: req.body.bid })
        .then((oneBooking) => {
            return res.status(200).json({
                success: true,
                message: 'Deleted Booking',
                Booking: oneBooking,
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

