import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { AppDataSource } from '../config/database';
import { RatingService } from '../services/rating.service';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { Rating } from '../models/rating.model';
import { UserRole, WasteType, ListingStatus } from '../types/enums';

describe('RatingService', () => {
  let ratingService: RatingService;
  let testUser1: User;
  let testUser2: User;
  let testListing: Listing;

  beforeAll(async () => {
    // Initialize database connection for testing
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    ratingService = new RatingService();
  });

  afterAll(async () => {
    // Clean up database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await AppDataSource.getRepository(Rating).delete({});
    await AppDataSource.getRepository(Listing).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create test users
    const userRepo = AppDataSource.getRepository(User);
    
    testUser1 = userRepo.create({
      email: 'user1@test.com',
      password: 'hashedpassword',
      firstName: 'John',
      lastName: 'Doe',
      roles: [UserRole.USER],
      emailVerified: true,
    });
    testUser1 = await userRepo.save(testUser1);

    testUser2 = userRepo.create({
      email: 'business@test.com',
      password: 'hashedpassword',
      firstName: 'Business',
      lastName: 'Owner',
      roles: [UserRole.BUSINESS],
      emailVerified: true,
    });
    testUser2 = await userRepo.save(testUser2);

    // Create test listing
    const listingRepo = AppDataSource.getRepository(Listing);
    testListing = listingRepo.create({
      title: 'Test Fabric Waste',
      description: 'High quality fabric scraps',
      wasteType: WasteType.FABRIC_SCRAPS,
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 5.0,
      totalPrice: 500.0,
      isNegotiable: true,
      status: ListingStatus.ACTIVE,
      location: {
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Jakarta, Indonesia',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        postalCode: '12345',
      },
      businessId: testUser2.id,
      isActive: true,
    });
    testListing = await listingRepo.save(testListing);
  });

  describe('createRating', () => {
    test('should create a rating successfully', async () => {
      const createRatingDto = {
        listingId: testListing.id,
        rating: 5,
        comment: 'Excellent quality fabric!',
      };

      const rating = await ratingService.createRating(testUser1.id, createRatingDto);

      expect(rating).toBeDefined();
      expect(rating.rating).toBe(5);
      expect(rating.comment).toBe('Excellent quality fabric!');
      expect(rating.userId).toBe(testUser1.id);
      expect(rating.listingId).toBe(testListing.id);
      expect(rating.isActive).toBe(true);
    });

    test('should prevent self-rating', async () => {
      const createRatingDto = {
        listingId: testListing.id,
        rating: 5,
        comment: 'Great product!',
      };

      await expect(
        ratingService.createRating(testUser2.id, createRatingDto)
      ).rejects.toThrow('Cannot rate your own listing');
    });

    test('should prevent duplicate ratings', async () => {
      const createRatingDto = {
        listingId: testListing.id,
        rating: 5,
        comment: 'First rating',
      };

      // Create first rating
      await ratingService.createRating(testUser1.id, createRatingDto);

      // Try to create second rating
      const duplicateRatingDto = {
        listingId: testListing.id,
        rating: 3,
        comment: 'Second rating',
      };

      await expect(
        ratingService.createRating(testUser1.id, duplicateRatingDto)
      ).rejects.toThrow('You have already rated this listing');
    });

    test('should validate rating range', async () => {
      const invalidRatingDto = {
        listingId: testListing.id,
        rating: 6, // Invalid rating
        comment: 'Invalid rating',
      };

      await expect(
        ratingService.createRating(testUser1.id, invalidRatingDto)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    test('should reject rating for non-existent listing', async () => {
      const createRatingDto = {
        listingId: 99999, // Non-existent listing
        rating: 5,
        comment: 'Great product!',
      };

      await expect(
        ratingService.createRating(testUser1.id, createRatingDto)
      ).rejects.toThrow('Listing not found or inactive');
    });
  });

  describe('updateRating', () => {
    let testRating: Rating;

    beforeEach(async () => {
      const createRatingDto = {
        listingId: testListing.id,
        rating: 4,
        comment: 'Good quality',
      };
      testRating = await ratingService.createRating(testUser1.id, createRatingDto);
    });

    test('should update rating successfully', async () => {
      const updateRatingDto = {
        rating: 5,
        comment: 'Actually, excellent quality!',
      };

      const updatedRating = await ratingService.updateRating(
        testUser1.id,
        testRating.id,
        updateRatingDto
      );

      expect(updatedRating.rating).toBe(5);
      expect(updatedRating.comment).toBe('Actually, excellent quality!');
    });

    test('should prevent updating other user\'s rating', async () => {
      const updateRatingDto = {
        rating: 1,
        comment: 'Terrible!',
      };

      await expect(
        ratingService.updateRating(testUser2.id, testRating.id, updateRatingDto)
      ).rejects.toThrow('Rating not found or you do not have permission to update it');
    });
  });

  describe('deleteRating', () => {
    let testRating: Rating;

    beforeEach(async () => {
      const createRatingDto = {
        listingId: testListing.id,
        rating: 4,
        comment: 'Good quality',
      };
      testRating = await ratingService.createRating(testUser1.id, createRatingDto);
    });

    test('should delete rating successfully', async () => {
      await ratingService.deleteRating(testUser1.id, testRating.id);

      const deletedRating = await ratingService.getRatingById(testRating.id);
      expect(deletedRating).toBeNull();
    });

    test('should prevent deleting other user\'s rating', async () => {
      await expect(
        ratingService.deleteRating(testUser2.id, testRating.id)
      ).rejects.toThrow('Rating not found or you do not have permission to delete it');
    });
  });

  describe('getListingRatingStats', () => {
    beforeEach(async () => {
      // Create multiple ratings for the listing
      const ratings = [
        { userId: testUser1.id, rating: 5, comment: 'Excellent!' },
      ];

      // Create additional users for more ratings
      const userRepo = AppDataSource.getRepository(User);
      for (let i = 2; i <= 5; i++) {
        const user = userRepo.create({
          email: `user${i}@test.com`,
          password: 'hashedpassword',
          firstName: `User${i}`,
          lastName: 'Test',
          roles: [UserRole.USER],
          emailVerified: true,
        });
        const savedUser = await userRepo.save(user);
        ratings.push({
          userId: savedUser.id,
          rating: i, // Ratings 2, 3, 4, 5
          comment: `Rating ${i}`,
        });
      }

      // Create all ratings
      for (const ratingData of ratings) {
        await ratingService.createRating(ratingData.userId, {
          listingId: testListing.id,
          rating: ratingData.rating,
          comment: ratingData.comment,
        });
      }
    });

    test('should calculate rating statistics correctly', async () => {
      const stats = await ratingService.getListingRatingStats(testListing.id);

      expect(stats.listingId).toBe(testListing.id);
      expect(stats.totalRatings).toBe(5);
      expect(stats.averageRating).toBeCloseTo(3.8, 1); // (5+2+3+4+5)/5 = 3.8
      expect(stats.ratingDistribution[1]).toBe(0);
      expect(stats.ratingDistribution[2]).toBe(1);
      expect(stats.ratingDistribution[3]).toBe(1);
      expect(stats.ratingDistribution[4]).toBe(1);
      expect(stats.ratingDistribution[5]).toBe(2);
    });
  });

  describe('getListingRatings', () => {
    beforeEach(async () => {
      // Create test ratings
      await ratingService.createRating(testUser1.id, {
        listingId: testListing.id,
        rating: 5,
        comment: 'Great product!',
      });
    });

    test('should get listing ratings with pagination', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
      };

      const result = await ratingService.getListingRatings(testListing.id, searchDto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].rating).toBe(5);
      expect(result.data[0].comment).toBe('Great product!');
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.stats).toBeDefined();
      expect(result.stats?.totalRatings).toBe(1);
    });
  });

  describe('canUserRateListing', () => {
    test('should return true for eligible user', async () => {
      const canRate = await ratingService.canUserRateListing(testUser1.id, testListing.id);
      expect(canRate).toBe(true);
    });

    test('should return false for listing owner', async () => {
      const canRate = await ratingService.canUserRateListing(testUser2.id, testListing.id);
      expect(canRate).toBe(false);
    });

    test('should return false if user already rated', async () => {
      // Create a rating first
      await ratingService.createRating(testUser1.id, {
        listingId: testListing.id,
        rating: 5,
        comment: 'Great!',
      });

      const canRate = await ratingService.canUserRateListing(testUser1.id, testListing.id);
      expect(canRate).toBe(false);
    });
  });
});