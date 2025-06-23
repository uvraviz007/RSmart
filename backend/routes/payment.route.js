import express from 'express';
import { createOrder, verifyPayment, getKey } from '../controllers/payment.controller.js';
import validateUser from '../middleware/user.middleware.js';

const router = express.Router();

router.post('/create-order', validateUser, createOrder);
router.post('/verify-payment', validateUser, verifyPayment);
router.get('/get-key', validateUser, getKey);

export default router; 