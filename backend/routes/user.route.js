import express from 'express'
import {userDetails,getUsers,deleteUser,signUp,signIn,updateUser} from '../controllers/user.controller.js'
const router=express.Router();

router.post('/signup',signUp)
router.post('/signIn',signIn)
router.put('/update/:userId',updateUser)
router.delete('/delete/:userId',deleteUser)
router.get('/allusers',getUsers)
router.get('/:userId',userDetails)

export default router