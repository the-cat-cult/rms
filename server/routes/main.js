import express from "express";

import {createBooking, getAllBookings, getOneBooking, updateBooking, deleteBooking} from '../controllers/bookings.js'
import {
    createProperty,
    getAllProperties,
    getOneProperty,
    updateProperty,
    deleteProperty
} from '../controllers/properties.js'
import {createTenant, getAllTenants, getOneTenant, updateTenant, deleteTenant} from '../controllers/tenant.js'
import {createUser, getAllUsers, getOneUser, updateUser, deleteUser} from '../controllers/user.js'
import {tenantSignUp, generateOTP, login} from '../controllers/authenitcation.js'
import authentication from '../middleware/authentication.js'

const router = express.Router();

//authentication
router.post('/login', login)
router.post('/tenantSignUp', tenantSignUp)
router.post('/generateOTP', generateOTP)

//create entity routes
router.post('/addBooking', authentication(["admin", "tenant"]), createBooking);
router.post('/addProperty', authentication(["admin", "owner"]), createProperty);
router.post("/addTenant", authentication(["admin"]), createTenant);
router.post("/addUser", authentication(["admin"]), createUser);

//get single entity
router.post('/getUser', authentication(["admin"]), getOneUser)
router.post('/getTenant', authentication(["admin"]), getOneTenant)
router.post('/getProperty', authentication(["admin", "owner", "tenant"]), getOneProperty)
router.post('/getBooking', authentication(["admin", "tenant"]), getOneBooking)

//get list of entities
router.get('/listAllUsers', authentication(["admin"]), getAllUsers)
router.get('/listAllTenants', authentication(["admin"]), getAllTenants)
router.get('/listAllProperties', authentication(["admin", "owner", "tenant"]), getAllProperties)
router.get('/listAllBookings', authentication(["admin", "tenant"]), getAllBookings)

//update entity
router.patch('/updateUser', authentication(["admin"]), updateUser)
router.patch('/updateTenant', authentication(["admin"]), updateTenant)
router.patch('/updateProperty', authentication(["admin", "owner"]), updateProperty)
router.patch('/updateBooking', authentication(["admin"]), updateBooking)

//delete entity
router.delete('/deleteUser', authentication(["admin"]), deleteUser)
router.delete('/deleteTenant', authentication(["admin"]), deleteTenant)
router.delete('/deleteProperty', authentication(["admin", "owner"]), deleteProperty)
router.delete('/deleteBooking', authentication(["admin"]), deleteBooking)

export default router;