import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { CartItem } from '../models/cart.model';
import { Listing } from '../models/listing.model';
import { 
  AddToCartDto, 
  UpdateCartItemDto, 
  CartItemResponseDto, 
  CartResponseDto 
} from '../types/cart.dto';
import { ListingStatus } from '../types';

/**
 * Cart Service
 * Handles shopping cart operations and business logic
 */
export class CartService {
  private cartRepository: Repository<CartItem>;
  private listingRepository: Repository<Listing>;

  constructor() {
    this.cartRepository = AppDataSource.getRepository(CartItem);
    this.listingRepository = AppDataSource.getRepository(Listing);
  }

  /**
   * Add item to cart or update quantity if item already exists
   */
  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<CartItemResponseDto> {
    const { listingId, quantity, notes } = addToCartDto;

    // Validate listing exists and is active
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, status: ListingStatus.ACTIVE },
      relations: ['business']
    });

    if (!listing) {
      throw new Error('Listing not found or not available');
    }

    // Check if user is trying to add their own listing
    if (listing.businessId === userId) {
      throw new Error('You cannot add your own listing to cart');
    }

    // Validate quantity availability
    if (quantity > listing.quantity) {
      throw new Error(`Only ${listing.quantity} ${listing.unit} available`);
    }

    // Check if item already exists in cart
    let cartItem = await this.cartRepository.findOne({
      where: { userId, listingId }
    });

    if (cartItem) {
      // Update existing cart item
      const newQuantity = cartItem.quantity + quantity;
      
      if (newQuantity > listing.quantity) {
        throw new Error(`Cannot add ${quantity} ${listing.unit}. Only ${listing.quantity - cartItem.quantity} ${listing.unit} more available`);
      }

      cartItem.quantity = newQuantity;
      cartItem.pricePerUnit = listing.pricePerUnit || 0;
      cartItem.notes = notes || cartItem.notes;
      cartItem.calculateTotalPrice();
    } else {
      // Create new cart item
      cartItem = this.cartRepository.create({
        userId,
        listingId,
        quantity,
        pricePerUnit: listing.pricePerUnit || 0,
        notes: notes || null,
      });
      cartItem.calculateTotalPrice();
    }

    const savedCartItem = await this.cartRepository.save(cartItem);
    return this.formatCartItemResponse(savedCartItem, listing);
  }

  /**
   * Get user's cart with all items
   */
  async getCart(userId: number): Promise<CartResponseDto> {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['listing', 'listing.business'],
      order: { createdAt: 'DESC' }
    });

    const formattedItems: CartItemResponseDto[] = [];
    let totalQuantity = 0;
    let subtotal = 0;

    for (const item of cartItems) {
      // Skip items with deleted listings
      if (!item.listing) {
        continue;
      }

      const formattedItem = this.formatCartItemResponse(item, item.listing);
      formattedItems.push(formattedItem);
      
      totalQuantity += Number(item.quantity);
      subtotal += Number(item.totalPrice);
    }

    return {
      items: formattedItems,
      summary: {
        totalItems: formattedItems.length,
        totalQuantity,
        subtotal,
        estimatedTotal: subtotal, // Can add taxes/fees later
      },
      metadata: {
        lastUpdated: cartItems.length > 0 ? cartItems[0].updatedAt : new Date(),
        itemCount: formattedItems.length,
      },
    };
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(userId: number, cartItemId: number, updateDto: UpdateCartItemDto): Promise<CartItemResponseDto> {
    const { quantity, notes } = updateDto;

    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId },
      relations: ['listing', 'listing.business']
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (!cartItem.listing) {
      throw new Error('Listing no longer available');
    }

    // Validate quantity availability
    if (quantity > cartItem.listing.quantity) {
      throw new Error(`Only ${cartItem.listing.quantity} ${cartItem.listing.unit} available`);
    }

    cartItem.quantity = quantity;
    cartItem.pricePerUnit = cartItem.listing.pricePerUnit || 0;
    cartItem.notes = notes !== undefined ? notes : cartItem.notes;
    cartItem.calculateTotalPrice();

    const savedCartItem = await this.cartRepository.save(cartItem);
    return this.formatCartItemResponse(savedCartItem, cartItem.listing);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: number, cartItemId: number): Promise<void> {
    const cartItem = await this.cartRepository.findOne({
      where: { id: cartItemId, userId }
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    await this.cartRepository.remove(cartItem);
  }

  /**
   * Clear entire cart
   */
  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ userId });
  }

  /**
   * Get cart item count for user
   */
  async getCartItemCount(userId: number): Promise<number> {
    return this.cartRepository.count({ where: { userId } });
  }

  /**
   * Validate cart items before checkout (check availability, prices)
   */
  async validateCart(userId: number): Promise<{ valid: boolean; issues: string[] }> {
    const cartItems = await this.cartRepository.find({
      where: { userId },
      relations: ['listing']
    });

    const issues: string[] = [];

    for (const item of cartItems) {
      if (!item.listing) {
        issues.push(`Item ${item.id}: Listing no longer available`);
        continue;
      }

      if (item.listing.status !== ListingStatus.ACTIVE) {
        issues.push(`Item ${item.id}: Listing is no longer active`);
      }

      if (item.quantity > item.listing.quantity) {
        issues.push(`Item ${item.id}: Only ${item.listing.quantity} ${item.listing.unit} available, but ${item.quantity} requested`);
      }

      if (item.pricePerUnit !== (item.listing.pricePerUnit || 0)) {
        issues.push(`Item ${item.id}: Price has changed from ${item.pricePerUnit} to ${item.listing.pricePerUnit}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Format cart item for API response
   */
  private formatCartItemResponse(cartItem: CartItem, listing: Listing): CartItemResponseDto {
    return {
      id: cartItem.id,
      quantity: Number(cartItem.quantity),
      pricePerUnit: Number(cartItem.pricePerUnit),
      totalPrice: Number(cartItem.totalPrice),
      notes: cartItem.notes,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
      listing: {
        id: listing.id,
        title: listing.title,
        wasteType: listing.wasteType || '',
        unit: listing.unit,
        availableQuantity: Number(listing.quantity),
        status: listing.status,
        images: listing.images || [],
        business: {
          id: listing.business?.id || listing.businessId,
          firstName: listing.business?.firstName || '',
          lastName: listing.business?.lastName || '',
          businessProfile: listing.business?.businessProfile || undefined,
        },
      },
    };
  }
}
