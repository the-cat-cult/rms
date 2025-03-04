import mongoose from "mongoose";
import Booking from "../models/bookings.js";
import Tenant from "../models/tenant.js";
import * as path from "path";
import Properties from "../models/properties.js";

const __dirname = path.resolve();

export async function createBooking(req, res) {

    let tenantId = req.user._id;
    let propertyId = req.query.propertyId;

    //if propertyId is unverified
    if(tenantId === undefined || propertyId === undefined) {
        return res.sendFile(path.join(__dirname + '/frontend/pages/page_500.html'));
    }

    console.log(req.user)

    if(req.user.allocationStatus === 'yes') {
        return res.sendFile(path.join(__dirname + '/frontend/pages/allocated.html'));
    }

    //if property is unverified, return 500
    let property = await Properties.findOne({_id: propertyId})
    if(property.verified === false) {
        return res.sendFile(path.join(__dirname + '/frontend/pages/page_500.html'));
    }

    if (property.vacancyStatus === false) {
        return res.sendFile(path.join(__dirname + '/frontend/pages/not_vacant.html'));
    }

    //check if there are existing bookings for propertyId
    try {
        const existingBookings = await Booking.find({propertyId: propertyId, tenantId: tenantId})

        if(existingBookings.length !== 0) {
            return res.sendFile(path.join(__dirname + '/frontend/pages/tenant/existing_booking.html'));
        }
    } catch (e) {
        return res.sendFile(path.join(__dirname + '/frontend/pages/page_500.html'));
    }

    const booking = new Booking({
        _id: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        propertyId: propertyId,
        tenantId: tenantId
    })

    let bookings = await Booking.find({tenantId: req.user._id})
    if (bookings.length === 3) {
        return res.sendFile(path.join(__dirname + '/frontend/pages/tenant/booking_failed.html'));
    }

    return booking
        .save()
        .then((newBooking) => {
            return res.sendFile(path.join(__dirname + '/frontend/pages/tenant/booking_success.html'));

        })
        .catch((error) => {
            return res.sendFile(path.join(__dirname + '/frontend/pages/page_500.html'));
        });
}

export function getAllBookings(req, res) {
    let userId = req.user._id

    if (req.user.role === "admin") {
        userId = req.body.userId
    }

    Booking.find({tenantId: userId})
        .populate('propertyId')
        .then(async (allBooking) => {
            await Booking.populate(allBooking, {path: 'propertyId', model: 'Property'})
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

    Booking.findOne({bookingId: req.body.bookingId})
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

export async function updateBookingStatus(req, res) {

    let tenantId = new mongoose.Types.ObjectId(req.body.userId);
    let propertyId =  new mongoose.Types.ObjectId(req.body.propertyId)

    let otherBookings = await Booking.find({propertyId: propertyId, allotmentStatus: true, tenantId: {$ne: tenantId}})
    if(otherBookings.length !== 0) {
        return res.status(400).json({
            success: false,
            message: 'Property already booked',
        });
    }

    Booking.findOne({propertyId: propertyId, tenantId: tenantId})
        .then(async (updatedBooking) => {

            let property = await Properties.findOne({_id: propertyId})

            if (property.verified === false) {
                return res.status(400).json({
                    success: false,
                    message: 'Property not verified',
                });
            }

            property.vacancyStatus = false
            await property.save()

            let tenant = await Tenant.findOne({_id: tenantId})
            tenant.allocationStatus = "yes"
            tenant.allocatedProperty = propertyId
            await tenant.save()

            updatedBooking.allotmentStatus = true
            updatedBooking.save()

            await Booking.deleteMany({propertyId: propertyId, tenantId: {$ne: tenantId}})
            await Booking.deleteMany({tenantId: tenantId, propertyId: {$ne: propertyId}})

            return res.status(200).json({
                success: true,
                message: 'Object Updated',
                Booking: updatedBooking,
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

export async function deleteBooking(req, res) {

    Booking.findOne({propertyId: new mongoose.Types.ObjectId(req.body.propertyId), tenantId: req.user._id})
        .then((oneBooking) => {

            if(oneBooking.allotmentStatus === true) {
                return res.status(400).json({
                    success: false,
                    message: 'Already allocated',
                });
            }

            oneBooking.remove()

            Properties.findOne({_id: new mongoose.Types.ObjectId(req.body.propertyId)})
                .then((property) => {
                    property.vacancyStatus = true
                    property.save()
                })
                .catch((err) => {
                    res.status(500).json({
                        success: false,
                        message: 'Server error. Please try again.',
                        error: err.message,
                    });
                });

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

