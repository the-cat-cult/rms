import express from "express";

import { createBooking, getAllBookings, getOneBooking, updateBooking, deleteBooking } from '../controllers/bookings.js'
import { createProperty, getAllProperties, getOneProperty, updateProperty, deleteProperty } from '../controllers/properties.js'
import { createTenant, getAllTenants, getOneTenant, updateTenant, deleteTenant } from '../controllers/tenant.js'
import { createUser, getAllUsers, getOneUser, updateUser, deleteUser } from '../controllers/user.js'

const router = express.Router();

//create entity routes
router.post('/addBooking', createBooking);
router.post('/addProperty', createProperty);
router.post("/addTenant", createTenant);
router.post("/addUser", createUser);

//get single entity
router.post('/getUser', getOneUser)
router.post('/getTenant', getOneTenant)
router.post('/getProperty', getOneProperty)
router.post('/getBooking', getOneBooking)

//get list of entities
router.get('/listAllUsers', getAllUsers)
router.get('/listAllTenants', getAllTenants)
router.get('/listAllProperties', getAllProperties)
router.get('/listAllBookings', getAllBookings)

//update entity
router.patch('/updateUser', updateUser)
router.patch('/updateTenant', updateTenant)
router.patch('/updateProperty', updateProperty)
router.patch('/updateBooking', updateBooking)

//delete entity
router.delete('/deleteUser', deleteUser)
router.delete('/deleteTenant', deleteTenant)
router.delete('/deleteProperty', deleteProperty)
router.delete('/deleteBooking', deleteBooking)

export default router;