import express from 'express'
import { signUp, signIn, getAdmins, signOut, deleteAdmin, updateAdmin, getAdminDetails } from '../controllers/admin.controller.js';
import validateAdmin from '../middleware/admin.middleware.js';
import { getItemsOfAdmin } from '../controllers/item.controller.js';
const router=express.Router();

router.post('/signup',signUp)
router.post('/signIn',signIn)
router.get('/signout', signOut)
router.get('/:adminId',getAdminDetails)
router.put('/update/:adminId',validateAdmin,updateAdmin)
router.delete('/delete/:adminId',validateAdmin,deleteAdmin)
router.get('/items', validateAdmin,getItemsOfAdmin);
router.get('/alladmins',getAdmins)

export default router