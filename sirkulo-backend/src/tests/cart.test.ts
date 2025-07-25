import { CartService } from '../services/cart.service';
import { AppDataSource } from '../config/database';
import { createTestUser, createTestBusiness, createTestListing } from './setup';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { CartItem } from '../models/cart.model';
import { WasteType } from '../types/enums';

describe('CartService', () => {
  let cartService: CartService;
  let testUser: User;
  let testBusiness: User;
  let testListing: Listing;

  beforeAll(async () => {
    cartService = new CartService();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'buyer@test.com'
    });

    testBusiness = await createTestBusiness({
      email: 'seller@test.com'
    });

    testListing = await createTestListing(testBusiness.id, {
      title: 'Cotton Scraps',
      quantity: 100,
      pricePerUnit: 15000
    });
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const addToCartDto = {
        listingId: testListing.id,
        quantity: 10
      };

      const cartItem = await cartService.addToCart(addToCartDto, testUser.id);

      expect(cartItem).toBeDefined();
      expect(cartItem.listingId).toBe(testListing.id);
      expect(cartItem.userId).toBe(testUser.id);
      expect(cartItem.quantity).toBe(10);
      expect(cartItem.unitPrice).toBe(15000);
      expect(cartItem.totalPrice).toBe(150000);
    });

    it('should update quantity if item already in cart', async () => {
      // Add item first time
      await cartService.addToCart({
        listingId: testListing.id,
        quantity: 5
      }, testUser.id);

      // Add same item again
      const cartItem = await cartService.addToCart({
        listingId: testListing.id,
        quantity: 3
      }, testUser.id);

      expect(cartItem.quantity).toBe(8); // 5 + 3
      expect(cartItem.totalPrice).toBe(120000); // 8 * 15000
    });

    it('should throw error if listing not found', async () => {
      const addToCartDto = {
        listingId: 99999,
        quantity: 10
      };

      await expect(cartService.addToCart(addToCartDto, testUser.id))
        .rejects.toThrow('Listing not found');
    });

    it('should throw error if listing is not active', async () => {
      // Deactivate listing
      testListing.isActive = false;
      await AppDataSource.getRepository(Listing).save(testListing);

      const addToCartDto = {
        listingId: testListing.id,
        quantity: 10
      };

      await expect(cartService.addToCart(addToCartDto, testUser.id))
        .rejects.toThrow('Listing is not available for purchase');
    });

    it('should throw error if insufficient quantity', async () => {
      const addToCartDto = {
        listingId: testListing.id,
        quantity: 150 // More than available (100)
      };

      await expect(cartService.addToCart(addToCartDto, testUser.id))
        .rejects.toThrow('Insufficient quantity available');
    });

    it('should throw error if user tries to add own listing', async () => {
      const addToCartDto = {
        listingId: testListing.id,
        quantity: 10
      };

      await expect(cartService.addToCart(addToCartDto, testBusiness.id))
        .rejects.toThrow('You cannot add your own listing to cart');
    });
  });

  describe('getCartItems', () => {
    beforeEach(async () => {
      // Add multiple items to cart
      await cartService.addToCart({
        listingId: testListing.id,
        quantity: 10
      }, testUser.id);

      // Create another listing and add to cart
      const secondListing = await createTestListing(testBusiness.id, {
        title: 'Leather Scraps',
        wasteType: WasteType.LEATHER_WASTE,
        quantity: 50,
        pricePerUnit: 25000
      });

      await cartService.addToCart({
        listingId: secondListing.id,
        quantity: 5
      }, testUser.id);
    });

    it('should retrieve all cart items for user', async () => {
      const cartItems = await cartService.getCartItems(testUser.id);

      expect(cartItems).toHaveLength(2);
      expect(cartItems[0].userId).toBe(testUser.id);
      expect(cartItems[1].userId).toBe(testUser.id);
    });

    it('should return empty array for user with no cart items', async () => {
      const emptyUser = await createTestUser({
        email: 'empty@test.com'
      });

      const cartItems = await cartService.getCartItems(emptyUser.id);

      expect(cartItems).toHaveLength(0);
    });

    it('should include listing details in cart items', async () => {
      const cartItems = await cartService.getCartItems(testUser.id);

      expect(cartItems[0].listing).toBeDefined();
      expect(cartItems[0].listing.title).toBeDefined();
      expect(cartItems[0].listing.business).toBeDefined();
    });
  });

  describe('updateCartItem', () => {
    let cartItem: CartItem;

    beforeEach(async () => {
      cartItem = await cartService.addToCart({
        listingId: testListing.id,
        quantity: 10
      }, testUser.id);
    });

    it('should update cart item quantity successfully', async () => {
      const updateDto = { quantity: 15 };

      const updatedItem = await cartService.updateCartItem(
        cartItem.id,
        updateDto,
        testUser.id
      );

      expect(updatedItem.quantity).toBe(15);
      expect(updatedItem.totalPrice).toBe(225000); // 15 * 15000
    });

    it('should throw error if cart item not found', async () => {
      const updateDto = { quantity: 15 };

      await expect(cartService.updateCartItem(99999, updateDto, testUser.id))
        .rejects.toThrow('Cart item not found');
    });

    it('should throw error if user tries to update other user\'s cart item', async () => {
      const otherUser = await createTestUser({
        email: 'other@test.com'
      });

      const updateDto = { quantity: 15 };

      await expect(cartService.updateCartItem(cartItem.id, updateDto, otherUser.id))
        .rejects.toThrow('Cart item not found');
    });

    it('should throw error if updated quantity exceeds available quantity', async () => {
      const updateDto = { quantity: 150 }; // More than available (100)

      await expect(cartService.updateCartItem(cartItem.id, updateDto, testUser.id))
        .rejects.toThrow('Insufficient quantity available');
    });
  });

  describe('removeCartItem', () => {
    let cartItem: CartItem;

    beforeEach(async () => {
      cartItem = await cartService.addToCart({
        listingId: testListing.id,
        quantity: 10
      }, testUser.id);
    });

    it('should remove cart item successfully', async () => {
      await cartService.removeCartItem(cartItem.id, testUser.id);

      const cartItems = await cartService.getCartItems(testUser.id);
      expect(cartItems).toHaveLength(0);
    });

    it('should throw error if cart item not found', async () => {
      await expect(cartService.removeCartItem(99999, testUser.id))
        .rejects.toThrow('Cart item not found');
    });

    it('should throw error if user tries to remove other user\'s cart item', async () => {
      const otherUser = await createTestUser({
        email: 'other@test.com'
      });

      await expect(cartService.removeCartItem(cartItem.id, otherUser.id))
        .rejects.toThrow('Cart item not found');
    });
  });

  describe('clearCart', () => {
    beforeEach(async () => {
      // Add multiple items to cart
      await cartService.addToCart({
        listingId: testListing.id,
        quantity: 10
      }, testUser.id);

      const secondListing = await createTestListing(testBusiness.id, {
        title: 'Second Listing',
        quantity: 50,
        pricePerUnit: 20000
      });

      await cartService.addToCart({
        listingId: secondListing.id,
        quantity: 5
      }, testUser.id);
    });

    it('should clear all cart items for user', async () => {
      await cartService.clearCart(testUser.id);

      const cartItems = await cartService.getCartItems(testUser.id);
      expect(cartItems).toHaveLength(0);
    });

    it('should not affect other users\' cart items', async () => {
      const otherUser = await createTestUser({
        email: 'other@test.com'
      });

      await cartService.addToCart({
        listingId: testListing.id,
        quantity: 5
      }, otherUser.id);

      await cartService.clearCart(testUser.id);

      const userCartItems = await cartService.getCartItems(testUser.id);
      const otherUserCartItems = await cartService.getCartItems(otherUser.id);

      expect(userCartItems).toHaveLength(0);
      expect(otherUserCartItems).toHaveLength(1);
    });
  });

  describe('getCartSummary', () => {
    beforeEach(async () => {
      // Add items to cart
      await cartService.addToCart({
        listingId: testListing.id,
        quantity: 10
      }, testUser.id);

      const secondListing = await createTestListing(testBusiness.id, {
        title: 'Expensive Item',
        quantity: 20,
        pricePerUnit: 50000
      });

      await cartService.addToCart({
        listingId: secondListing.id,
        quantity: 2
      }, testUser.id);
    });

    it('should calculate cart summary correctly', async () => {
      const summary = await cartService.getCartSummary(testUser.id);

      expect(summary.totalItems).toBe(2);
      expect(summary.totalQuantity).toBe(12); // 10 + 2
      expect(summary.subtotal).toBe(250000); // (10 * 15000) + (2 * 50000)
      expect(summary.itemsByBusiness).toHaveLength(1); // All from same business
      expect(summary.itemsByBusiness[0].businessId).toBe(testBusiness.id);
      expect(summary.itemsByBusiness[0].items).toHaveLength(2);
      expect(summary.itemsByBusiness[0].subtotal).toBe(250000);
    });

    it('should group items by different businesses', async () => {
      // Create another business and listing
      const anotherBusiness = await createTestBusiness({
        email: 'anotherbusiness@test.com'
      });

      const anotherListing = await createTestListing(anotherBusiness.id, {
        title: 'Another Business Item',
        quantity: 30,
        pricePerUnit: 10000
      });

      await cartService.addToCart({
        listingId: anotherListing.id,
        quantity: 3
      }, testUser.id);

      const summary = await cartService.getCartSummary(testUser.id);

      expect(summary.totalItems).toBe(3);
      expect(summary.itemsByBusiness).toHaveLength(2); // Two different businesses
      expect(summary.subtotal).toBe(280000); // 250000 + 30000
    });

    it('should return empty summary for empty cart', async () => {
      const emptyUser = await createTestUser({
        email: 'empty@test.com'
      });

      const summary = await cartService.getCartSummary(emptyUser.id);

      expect(summary.totalItems).toBe(0);
      expect(summary.totalQuantity).toBe(0);
      expect(summary.subtotal).toBe(0);
      expect(summary.itemsByBusiness).toHaveLength(0);
    });
  });
});