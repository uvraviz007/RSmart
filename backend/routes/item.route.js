import express from "express";
import {itemDetails,getItems, createItem, updateItem, deleteItem } from "../controllers/item.controller.js";
const router=express.Router();

router.post('/create',createItem)
router.put('/update/:itemId',updateItem)
router.delete('/delete/:itemId',deleteItem)
router.get('/allitems',getItems)
router.get('/:itemId',itemDetails)

export default router