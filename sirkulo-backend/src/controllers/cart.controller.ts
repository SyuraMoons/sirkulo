import { Response } from 'express';
import { CartService } from '../services/cart.service';
import { ResponseUtil } from '../utils/response.util';
import { AddToCartDto, UpdateCartItemDto } from '../types/cart.dto';
import { AuthenticatedRequest } from '../types/auth.dto';

/**
 * Controller for handling shopping cart operations
 */
export class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  /**
   * Add item to cart
   * POST /api/cart/items
   */
  addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const addToCartDto: AddToCartDto = req.body;
      const userId = req.user!.userId;

      const cartItem = await this.cartService.addToCart(userId, addToCartDto);

      ResponseUtil.success(res, cartItem, 'Item added to cart successfully', 201);
    } catch (error) {
      console.error('Error adding item to cart:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to add item to cart');
    }
  };

  /**
   * Get user's cart
   * GET /api/cart
   */
  getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const cart = await this.cartService.getCart(userId);

      ResponseUtil.success(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      console.error('Error retrieving cart:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to retrieve cart');
    }
  };

  /**
   * Update cart item quantity
   * PUT /api/cart/items/:id
   */
  updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cartItemId = parseInt(req.params.id);
      const updateDto: UpdateCartItemDto = req.body;
      const userId = req.user!.userId;

      if (isNaN(cartItemId)) {
        ResponseUtil.error(res, 'Invalid cart item ID', 400);
        return;
      }

      const cartItem = await this.cartService.updateCartItem(userId, cartItemId, updateDto);

      ResponseUtil.success(res, cartItem, 'Cart item updated successfully');
    } catch (error) {
      console.error('Error updating cart item:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to update cart item');
    }
  };

  /**
   * Remove item from cart
   * DELETE /api/cart/items/:id
   */
  removeFromCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const cartItemId = parseInt(req.params.id);
      const userId = req.user!.userId;

      if (isNaN(cartItemId)) {
        ResponseUtil.error(res, 'Invalid cart item ID', 400);
        return;
      }

      await this.cartService.removeFromCart(userId, cartItemId);

      ResponseUtil.success(res, null, 'Item removed from cart successfully');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to remove item from cart');
    }
  };

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      await this.cartService.clearCart(userId);

      ResponseUtil.success(res, null, 'Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to clear cart');
    }
  };

  /**
   * Get cart item count
   * GET /api/cart/count
   */
  getCartItemCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const count = await this.cartService.getCartItemCount(userId);

      ResponseUtil.success(res, { count }, 'Cart item count retrieved successfully');
    } catch (error) {
      console.error('Error getting cart item count:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get cart item count');
    }
  };

  /**
   * Validate cart before checkout
   * GET /api/cart/validate
   */
  validateCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const validation = await this.cartService.validateCart(userId);

      ResponseUtil.success(res, validation, 'Cart validation completed');
    } catch (error) {
      console.error('Error validating cart:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to validate cart');
    }
  };
}
