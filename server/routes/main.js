import express from "express";

import {createBooking, getAllBookings, getOneBooking, updateBooking, deleteBooking} from '../controllers/bookings.js'
import {
    createProperty,
    getAllProperties,
    getOneProperty,
    updateProperty,
    deleteProperty
} from '../controllers/properties.js'
import {
    createTenant,
    getAllTenants,
    getOneTenant,
    updateTenant,
    deleteTenant,
    deleteSelf as deleteSelfTenant
} from '../controllers/tenant.js'
import {createUser, getAllUsers, getOneUser, updateUser, deleteUser, deleteSelf as deleteSelfUser} from '../controllers/user.js'
import {ownerSignUp, generateOTP, login} from '../controllers/authenitcation.js'
import authentication from '../middleware/authentication.js'

const router = express.Router();

//authentication
router.post('/login', login)
router.post('/ownerSignUp', ownerSignUp)
router.post('/generateOTP', generateOTP)

//create entity routes
router.post('/addBooking', authentication(["admin", "tenant"]), createBooking);
router.post('/addProperty', authentication(["admin", "owner"]), createProperty);
router.post("/addTenant", authentication(["admin"]), createTenant);
router.post("/addUser", authentication(["admin"]), createUser);

//get single entity
router.get('/getUser', authentication(["admin"]), getOneUser)
router.get('/getTenant', authentication(["admin"]), getOneTenant)
router.get('/getProperty', authentication(["admin", "owner", "tenant"]), getOneProperty)
router.get('/getBooking', authentication(["admin", "tenant"]), getOneBooking)

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
router.delete('/deleteUserSelf', authentication(["admin", "owner"]), deleteSelfUser)
router.delete('/deleteTenantSelf', authentication(["tenant"]), deleteSelfTenant)

export default router;