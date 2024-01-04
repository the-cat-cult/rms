import express from "express";

import {
    createBooking,
    getAllBookings,
    getOneBooking,
    updateBookingStatus,
    deleteBooking
} from '../controllers/bookings.js'
import {
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByFilters,
    getAllPropertiesByUser,
    getPropertyById,
    setVerificationStatus,
    uploadFiles,
    deleteFile, getFile, getPropertiesOfOwner, getImagesByPropertyId, getAllAreas
} from '../controllers/properties.js'
import {
    createTenant,
    getAllTenants,
    getOneTenant,
    updateTenant, getOneTenantById, deleteTenantById,
} from '../controllers/tenant.js'
import {
    createUser,
    getAllUsers,
    getOneUser,
    updateUser, getAllSellers, verifyUser, getOneOwnerById, deleteOwnerById, getAllAdmins,
} from '../controllers/user.js'
import {signUp, generateOTP, login, singOut, checkAuth} from '../controllers/authenitcation.js'
import authentication from '../middleware/authentication.js'
import multerImages from '../middleware/multer-images.js'

const router = express.Router();

//images
router.post('/uploadImages', authentication(["owner", "admin"]), multerImages, uploadFiles)
router.delete('/deleteImage', authentication(["owner", "admin"]), deleteFile)
router.get('/image/:id', authentication(['owner', 'tenant', 'admin']), getFile)

//authentication
router.post('/login', login)
router.post('/signUp', signUp)
router.post('/generateOTP', generateOTP)
router.post('/signOut', authentication(["admin", "owner", "tenant"]), singOut)
router.get('/isAuthenticated', authentication(["admin", "owner", "tenant"]), checkAuth)

//create entity routes
router.get('/addBooking', authentication(["tenant"]), createBooking);
router.post('/addProperty', authentication(["owner", "admin"]), multerImages, createProperty);
router.post("/addTenant", authentication(["admin"]), createTenant);
router.post("/addUser", authentication(["admin"]), createUser);

//get single entity
router.post('/getUser', authentication(["admin", "owner"]), getOneUser)
router.post('/getTenant', authentication(["admin", "tenant"]), getOneTenant)
router.get('/getTenant', authentication(["admin"]), getOneTenantById)
router.get('/getOwner', authentication(["admin"]), getOneOwnerById)
router.get('/getPropertiesOfOwner', authentication(["admin"]), getPropertiesOfOwner)
router.post('/getPropertyById', authentication(["owner", "tenant", "admin"]), getPropertyById)
router.post('/getBooking', authentication(["admin", "tenant"]), getOneBooking)

//get list of entities
router.get('/listAllUsers', authentication(["admin"]), getAllUsers)
router.get('/listAllTenants', authentication(["admin", "owner"]), getAllTenants)
router.get('/listAllAdmins', authentication(["admin"]), getAllAdmins)
router.get('/listAllPropertiesByUser', authentication(["owner"]), getAllPropertiesByUser)
router.get('/listAllAreas', authentication(["owner", "admin", "tenant"]), getAllAreas)
router.post('/listAllPropertiesByFilter', authentication(["admin", "tenant"]), getPropertiesByFilters)
router.post('/listAllBookings', authentication(["admin", "tenant"]), getAllBookings)
router.get('/listAllSellers', authentication(["admin"]), getAllSellers)
router.get('/listAllImagesByProperty', authentication(["admin", "owner"]), getImagesByPropertyId)
//getImagesByPropertyId

//update entity
router.patch('/updateUser', authentication(["admin", "owner"]), updateUser)
router.patch('/updateTenant', authentication(["admin", "tenant"]), updateTenant)
router.patch('/updateProperty', authentication(["admin", "owner"]), multerImages, updateProperty)
router.patch('/updateBookingStatus', authentication(["admin"]), updateBookingStatus)
router.post('/setVerificationStatus', authentication("admin"), setVerificationStatus)
router.post('/verifyUser', authentication(["admin"]), verifyUser)

//delete entity
router.post('/deleteProperty', authentication(["admin", "owner"]), deleteProperty)
router.post('/deleteBooking', authentication(["tenant"]), deleteBooking)
router.get('/deleteTenantById', authentication(["admin"]), deleteTenantById)
router.get('/deleteOwnerById', authentication(["admin"]), deleteOwnerById)

export default router;