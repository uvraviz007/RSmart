import express from "express";
import {itemDetails,getItems, createItem, updateItem, deleteItem, buyItem, getCategories, getItemsOfSeller } from "../controllers/item.controller.js";
import validateUser from "../middleware/user.middleware.js";
import validateSeller from "../middleware/seller.middleware.js";
const router=express.Router();

router.post('/create',validateUser,validateSeller,createItem)
router.put('/update/:itemId',validateUser,validateSeller,updateItem)
router.delete('/delete/:itemId',validateUser,validateSeller,deleteItem)
router.get('/allitems',getItems)
router.get('/categories',getCategories)
router.get('/seller-items',validateUser,validateSeller,getItemsOfSeller)
router.post('/buy/:itemId',validateUser,buyItem)
router.get('/:itemId',itemDetails)

export default router