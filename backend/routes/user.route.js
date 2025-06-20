import express from 'express'
import {checkLoginStatus,getSellers,getAllPurchases,getUsers,deleteUser,signUp,signIn,updateUser,signOut, getDetails, getWishlist, toggleWishlist} from '../controllers/user.controller.js'
import validateUser from '../middleware/user.middleware.js';
const router=express.Router();

router.post('/signup',signUp)
router.post('/signout',signOut)
router.post('/signIn',signIn)
router.put('/:userId/update',validateUser,updateUser)
router.delete('/:userId/delete',validateUser,deleteUser)
router.get('/purchases', validateUser, getAllPurchases)
router.get('/wishlist', validateUser, getWishlist);
router.post('/wishlist/toggle', validateUser, toggleWishlist);
router.get('/:userId/purchases', validateUser, getAllPurchases)
router.get('/allusers',getUsers)
router.get('/allSellers',getSellers)
router.get('/:userId',validateUser,getDetails)
router.get('/me', validateUser,checkLoginStatus);

export default router