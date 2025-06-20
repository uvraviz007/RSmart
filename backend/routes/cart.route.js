import express from 'express';
import { getCart, addToCart, removeFromCart, updateItemQuantity, checkoutFromCart } from '../controllers/cart.controller.js';
import validateUser from '../middleware/user.middleware.js';

const router = express.Router();

router.use(validateUser);

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/checkout', checkoutFromCart);
router.delete('/remove/:itemId', removeFromCart);
router.put('/update/:itemId', updateItemQuantity);

export default router; 