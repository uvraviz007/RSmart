import express from 'express'
import {getAllPurchases,getUsers,deleteUser,signUp,signIn,updateUser,signOut, getUserDetails} from '../controllers/user.controller.js'
import validateUser from '../middleware/user.middleware.js';
import validateAdmin from '../middleware/admin.middleware.js';
const router=express.Router();

router.post('/signup',signUp)
router.post('/signout',signOut)
router.post('/signIn',signIn)
router.put('/update/:userId',validateUser,updateUser)
router.delete('/delete/:userId',validateUser,deleteUser)
router.get('/purchases', validateUser, getAllPurchases)
router.get('/allusers',getUsers)
router.get('/:userId',validateUser,getUserDetails)

export default router