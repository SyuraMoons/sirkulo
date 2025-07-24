import { Router } from 'express';
import { CartController } from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { AddToCartDto, UpdateCartItemDto } from '../types/cart.dto';

/**
 * Routes for shopping cart management
 */
const router = Router();
const cartController = new CartController();

// All cart routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/cart
 * @desc Get user's shopping cart
 * @access Private
 */
router.get('/', cartController.getCart);

/**
 * @route GET /api/cart/count
 * @desc Get cart item count
 * @access Private
 */
router.get('/count', cartController.getCartItemCount);

/**
 * @route GET /api/cart/validate
 * @desc Validate cart items (check availability, prices)
 * @access Private
 */
router.get('/validate', cartController.validateCart);

/**
 * @route POST /api/cart/items
 * @desc Add item to cart
 * @access Private
 * @body {AddToCartDto} Cart item data
 */
router.post(
  '/items',
  validateDto(AddToCartDto),
  cartController.addToCart
);

/**
 * @route PUT /api/cart/items/:id
 * @desc Update cart item quantity/notes
 * @access Private
 * @param {number} id - Cart item ID
 * @body {UpdateCartItemDto} Updated cart item data
 */
router.put(
  '/items/:id',
  validateDto(UpdateCartItemDto),
  cartController.updateCartItem
);

/**
 * @route DELETE /api/cart/items/:id
 * @desc Remove item from cart
 * @access Private
 * @param {number} id - Cart item ID
 */
router.delete('/items/:id', cartController.removeFromCart);

/**
 * @route DELETE /api/cart
 * @desc Clear entire cart
 * @access Private
 */
router.delete('/', cartController.clearCart);

export default router;
