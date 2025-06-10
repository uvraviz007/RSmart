import express from "express";
import {itemDetails,getItems, createItem, updateItem, deleteItem, buyItem } from "../controllers/item.controller.js";
import validateUser from "../middleware/user.middleware.js";
import validateAdmin from "../middleware/admin.middleware.js";
const router=express.Router();

router.post('/create',validateAdmin,createItem)
router.put('/update/:itemId',validateAdmin,updateItem)
router.delete('/delete/:itemId',validateAdmin,deleteItem)
router.get('/allitems',getItems)
router.get('/:itemId',itemDetails)
router.post('/buy/:itemId',validateUser,buyItem)

export default router