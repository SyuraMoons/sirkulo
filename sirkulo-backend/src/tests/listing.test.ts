import request from 'supertest';
import { ListingService } from '../services/listing.service';
import { AppDataSource } from '../config/database';
import { createTestUser, createTestBusiness, createTestListing, generateTestJWT } from './setup';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { WasteType, ListingStatus, UserRole } from '../types/enums';

describe('ListingService', () => {
  let listingService: ListingService;
  let testUser: User;
  let testBusiness: User;
  let testListing: Listing;

  beforeAll(async () => {
    listingService = new ListingService();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'buyer@test.com'
    });

    testBusiness = await createTestBusiness({
      email: 'seller@test.com'
    });

    testListing = await createTestListing(testBusiness.id);
  });

  describe('createListing', () => {
    it('should create a listing successfully', async () => {
      const createListingDto = {
        title: 'Cotton Fabric Scraps',
        description: 'High quality cotton fabric from fashion production',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 20000,
        totalPrice: 1000000,
        isNegotiable: true,
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta Industrial Area',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        },
        specifications: {
          color: 'Blue',
          material: '100% Cotton',
          condition: 'Excellent'
        }
      };

      const listing = await listingService.createListing(createListingDto, testBusiness.id);

      expect(listing).toBeDefined();
      expect(listing.title).toBe(createListingDto.title);
      expect(listing.businessId).toBe(testBusiness.id);
      expect(listing.wasteType).toBe(WasteType.FABRIC_SCRAPS);
      expect(listing.status).toBe(ListingStatus.ACTIVE);
      expect(listing.isActive).toBe(true);
    });

    it('should throw error if user is not a business', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: 'Test Description',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 10,
        unit: 'kg',
        pricePerUnit: 10000,
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Test Address',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        }
      };

      await expect(listingService.createListing(createListingDto, testUser.id))
        .rejects.toThrow('Only businesses can create listings');
    });

    it('should throw error if business not found', async () => {
      const createListingDto = {
        title: 'Test Listing',
        description: 'Test Description',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 10,
        unit: 'kg',
        pricePerUnit: 10000,
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Test Address',
          city: 'Jakarta',
          state: 'DKI Jakarta',
          country: 'Indonesia',
          postalCode: '12345'
        }
      };

      await expect(listingService.createListing(createListingDto, 99999))
        .rejects.toThrow('Business not found');
    });
  });

  describe('getListings', () => {
    beforeEach(async () => {
      // Create additional test listings
      await createTestListing(testBusiness.id, {
        title: 'Leather Waste',
        wasteType: WasteType.LEATHER_WASTE,
        quantity: 25,
        pricePerUnit: 30000
      });

      await createTestListing(testBusiness.id, {
        title: 'Button Collection',
        wasteType: WasteType.BUTTONS_ZIPPERS,
        quantity: 1000,
        unit: 'pieces',
        pricePerUnit: 500
      });
    });

    it('should retrieve listings with pagination', async () => {
      const result = await listingService.getListings({
        page: 1,
        limit: 2
      });

      expect(result.listings).toHaveLength(2);
      expect(result.meta.total).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(2);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should filter listings by waste type', async () => {
      const result = await listingService.getListings({
        wasteType: WasteType.LEATHER_WASTE
      });

      expect(result.listings).toHaveLength(1);
      expect(result.listings[0].wasteType).toBe(WasteType.LEATHER_WASTE);
    });

    it('should search listings by title', async () => {
      const result = await listingService.getListings({
        search: 'Button'
      });

      expect(result.listings).toHaveLength(1);
      expect(result.listings[0].title).toContain('Button');
    });

    it('should filter by price range', async () => {
      const result = await listingService.getListings({
        minPrice: 20000,
        maxPrice: 35000
      });

      expect(result.listings).toHaveLength(1);
      expect(result.listings[0].pricePerUnit).toBeGreaterThanOrEqual(20000);
      expect(result.listings[0].pricePerUnit).toBeLessThanOrEqual(35000);
    });

    it('should sort listings by price', async () => {
      const result = await listingService.getListings({
        sortBy: 'pricePerUnit',
        sortOrder: 'ASC'
      });

      expect(result.listings.length).toBeGreaterThan(1);
      expect(result.listings[0].pricePerUnit).toBeLessThanOrEqual(result.listings[1].pricePerUnit);
    });
  });

  describe('getListingById', () => {
    it('should retrieve listing by ID', async () => {
      const listing = await listingService.getListingById(testListing.id);

      expect(listing).toBeDefined();
      expect(listing.id).toBe(testListing.id);
      expect(listing.title).toBe(testListing.title);
    });

    it('should throw error if listing not found', async () => {
      await expect(listingService.getListingById(99999))
        .rejects.toThrow('Listing not found');
    });

    it('should increment view count when retrieving listing', async () => {
      const initialViewCount = testListing.viewCount;
      
      await listingService.getListingById(testListing.id);
      
      const updatedListing = await AppDataSource.getRepository(Listing)
        .findOne({ where: { id: testListing.id } });
      
      expect(updatedListing?.viewCount).toBe(initialViewCount + 1);
    });
  });

  describe('updateListing', () => {
    it('should update listing successfully', async () => {
      const updateDto = {
        title: 'Updated Fabric Waste',
        description: 'Updated description',
        quantity: 75,
        pricePerUnit: 18000
      };

      const updatedListing = await listingService.updateListing(
        testListing.id,
        updateDto,
        testBusiness.id
      );

      expect(updatedListing.title).toBe(updateDto.title);
      expect(updatedListing.description).toBe(updateDto.description);
      expect(updatedListing.quantity).toBe(updateDto.quantity);
      expect(updatedListing.pricePerUnit).toBe(updateDto.pricePerUnit);
    });

    it('should throw error if user is not the owner', async () => {
      const updateDto = {
        title: 'Unauthorized Update'
      };

      await expect(listingService.updateListing(
        testListing.id,
        updateDto,
        testUser.id
      )).rejects.toThrow('Unauthorized: You can only update your own listings');
    });

    it('should throw error if listing not found', async () => {
      const updateDto = {
        title: 'Update Non-existent'
      };

      await expect(listingService.updateListing(
        99999,
        updateDto,
        testBusiness.id
      )).rejects.toThrow('Listing not found');
    });
  });

  describe('deleteListing', () => {
    it('should delete listing successfully', async () => {
      await listingService.deleteListing(testListing.id, testBusiness.id);

      const deletedListing = await AppDataSource.getRepository(Listing)
        .findOne({ where: { id: testListing.id } });

      expect(deletedListing).toBeNull();
    });

    it('should throw error if user is not the owner', async () => {
      await expect(listingService.deleteListing(testListing.id, testUser.id))
        .rejects.toThrow('Unauthorized: You can only delete your own listings');
    });

    it('should throw error if listing not found', async () => {
      await expect(listingService.deleteListing(99999, testBusiness.id))
        .rejects.toThrow('Listing not found');
    });
  });

  describe('deactivateListing', () => {
    it('should deactivate listing successfully', async () => {
      const deactivatedListing = await listingService.deactivateListing(
        testListing.id,
        testBusiness.id
      );

      expect(deactivatedListing.isActive).toBe(false);
      expect(deactivatedListing.status).toBe(ListingStatus.INACTIVE);
    });

    it('should throw error if user is not the owner', async () => {
      await expect(listingService.deactivateListing(testListing.id, testUser.id))
        .rejects.toThrow('Unauthorized: You can only deactivate your own listings');
    });
  });

  describe('getBusinessListings', () => {
    it('should retrieve business listings', async () => {
      // Create additional listing for the business
      await createTestListing(testBusiness.id, {
        title: 'Second Listing'
      });

      const result = await listingService.getBusinessListings(testBusiness.id, {
        page: 1,
        limit: 10
      });

      expect(result.listings).toHaveLength(2);
      expect(result.listings.every(listing => listing.businessId === testBusiness.id)).toBe(true);
    });

    it('should filter business listings by status', async () => {
      // Create inactive listing
      await createTestListing(testBusiness.id, {
        title: 'Inactive Listing',
        status: ListingStatus.INACTIVE,
        isActive: false
      });

      const activeResult = await listingService.getBusinessListings(testBusiness.id, {
        status: ListingStatus.ACTIVE
      });

      const inactiveResult = await listingService.getBusinessListings(testBusiness.id, {
        status: ListingStatus.INACTIVE
      });

      expect(activeResult.listings.every(listing => listing.status === ListingStatus.ACTIVE)).toBe(true);
      expect(inactiveResult.listings.every(listing => listing.status === ListingStatus.INACTIVE)).toBe(true);
    });
  });
});