import express from "express";

import {createBooking, getAllBookings, getOneBooking, updateBookingStatus, deleteBooking} from '../controllers/bookings.js'
import {
    createProperty,
    getAllProperties,
    getOneProperty,
    updateProperty,
    deleteProperty, getPropertiesByFilters, getAllPropertiesByUser, getPropertyById, setVerificationStatus
} from '../controllers/properties.js'
import {
    createTenant,
    getAllTenants,
    getOneTenant,
    updateTenant,
    deleteTenant, getOneTenantById, deleteTenantById,
} from '../controllers/tenant.js'
import {createUser, getAllUsers, getOneUser, updateUser, deleteUser} from '../controllers/user.js'
import {ownerSignUp, generateOTP, login, singOut, checkAuth} from '../controllers/authenitcation.js'
import authentication from '../middleware/authentication.js'

const router = express.Router();

//authentication
router.post('/login', login)
router.post('/ownerSignUp', ownerSignUp)
router.post('/generateOTP', generateOTP)
router.post('/signOut', authentication(["admin", "owner", "tenant"]), singOut)
router.get('/isAuthenticated', authentication(["admin", "owner", "tenant"]), checkAuth)

//create entity routes
router.get('/addBooking', authentication(["tenant"]), createBooking);
router.post('/addProperty', authentication(["owner"]), createProperty);
router.post("/addTenant", authentication(["admin"]), createTenant);
router.post("/addUser", authentication(["admin"]), createUser);

//get single entity
router.post('/getUser', authentication(["admin", "owner"]), getOneUser)
router.post('/getTenant', authentication(["admin", "tenant"]), getOneTenant)
router.get('/getTenant', authentication(["admin"]), getOneTenantById)
router.post('/getProperty', authentication(["admin", "owner", "tenant"]), getOneProperty)
router.post('/getPropertyById', authentication(["owner", "tenant", "admin"]), getPropertyById)
router.post('/getBooking', authentication(["admin", "tenant"]), getOneBooking)

//get list of entities
router.get('/listAllUsers', authentication(["admin"]), getAllUsers)
router.get('/listAllTenants', authentication(["admin", "owner"]), getAllTenants)
router.get('/listAllProperties', authentication(["admin", "tenant"]), getAllProperties)
router.get('/listAllPropertiesByUser', authentication(["owner"]), getAllPropertiesByUser)
router.post('/listAllPropertiesByFilter', authentication(["admin", "tenant"]), getPropertiesByFilters)
router.post('/listAllBookings', authentication(["admin", "tenant"]), getAllBookings)

//update entity
router.patch('/updateUser', authentication(["admin", "owner"]), updateUser)
router.patch('/updateTenant', authentication(["admin", "tenant"]), updateTenant)
router.patch('/updateProperty', authentication(["admin", "owner"]), updateProperty)
router.patch('/updateBookingStatus', authentication(["admin"]), updateBookingStatus)
router.post('/setVerificationStatus', authentication("admin"), setVerificationStatus)

//delete entity
router.delete('/deleteUser', authentication(["admin", "owner"]), deleteUser)
router.delete('/deleteTenant', authentication(["admin", "tenant"]), deleteTenant)
router.post('/deleteProperty', authentication(["admin", "owner"]), deleteProperty)
router.post('/deleteBooking', authentication(["tenant"]), deleteBooking)
router.get('/deleteTenantById', authentication(["admin"]), deleteTenantById)

export default router;