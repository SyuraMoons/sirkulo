import request from 'supertest';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import config from '../src/config';
import { ListingCategory, ProjectDifficulty, VolunteerRequirement, CraftMaterial, CraftCategory } from '../src/types';

/**
 * Extended Listing System Integration Tests
 * Tests for Project and Crafts listings functionality
 */

describe('Extended Listing System Integration Tests', () => {
  let server: Server;
  let app: any;
  let businessToken: string;
  let recyclerToken: string;
  let userToken: string;
  let businessId: number;
  let recyclerId: number;
  let userId: number;
  let projectListingId: number;
  let craftsListingId: number;

  beforeAll(async () => {
    // Initialize test server and database
    
    // Create test users
    businessId = 1;
    recyclerId = 2;
    userId = 3;
    
    businessToken = jwt.sign(
      { userId: businessId, email: 'business@test.com', roles: ['business'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    recyclerToken = jwt.sign(
      { userId: recyclerId, email: 'recycler@test.com', roles: ['recycler'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    userToken = jwt.sign(
      { userId: userId, email: 'user@test.com', roles: ['user'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Cleanup
    if (server) server.close();
  });

  describe('Project Listings', () => {
    describe('POST /api/projects', () => {
      it('should create a new project listing as business', async () => {
        const projectData = {
          title: 'Community Plastic Recycling Initiative',
          description: 'We are looking for volunteers to help sort and process plastic waste from our community collection drive. This is a great opportunity to make a direct impact on environmental sustainability.',
          category: ListingCategory.PROJECT,
          projectDifficulty: ProjectDifficulty.BEGINNER,
          volunteerRequirement: VolunteerRequirement.NO_EXPERIENCE,
          volunteersNeeded: 5,
          projectStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          projectEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
          expectedOutcome: 'Sort and process 500kg of plastic waste for recycling',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Green Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10001'
          },
          projectLocation: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Green Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            isRemote: false
          },
          projectRequirements: 'Basic safety training will be provided on-site',
          quantity: 1,
          unit: 'project'
        };

        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${businessToken}`)
          .send(projectData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing).toBeDefined();
        expect(response.body.data.listing.category).toBe(ListingCategory.PROJECT);
        expect(response.body.data.listing.projectDifficulty).toBe(ProjectDifficulty.BEGINNER);
        expect(response.body.data.listing.volunteersNeeded).toBe(5);
        expect(response.body.data.listing.volunteersApplied).toBe(0);
        expect(response.body.data.listing.isAcceptingVolunteers).toBe(true);
        
        projectListingId = response.body.data.listing.id;
      });

      it('should reject project creation from non-business user', async () => {
        const projectData = {
          title: 'Test Project',
          description: 'Test description for project listing',
          category: ListingCategory.PROJECT,
          projectDifficulty: ProjectDifficulty.BEGINNER,
          volunteerRequirement: VolunteerRequirement.NO_EXPERIENCE,
          volunteersNeeded: 3,
          projectStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          expectedOutcome: 'Test outcome',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            postalCode: '12345'
          },
          quantity: 1,
          unit: 'project'
        };

        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${userToken}`)
          .send(projectData);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Only businesses can create project listings');
      });

      it('should validate required project fields', async () => {
        const invalidProjectData = {
          title: 'Test',
          description: 'Short desc',
          category: ListingCategory.PROJECT,
          // Missing required fields
        };

        const response = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${businessToken}`)
          .send(invalidProjectData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('GET /api/projects', () => {
      it('should get all project listings', async () => {
        const response = await request(app)
          .get('/api/projects');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(Array.isArray(response.body.data.listings)).toBe(true);
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter projects by difficulty', async () => {
        const response = await request(app)
          .get('/api/projects?difficulty=beginner');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });

      it('should filter projects accepting volunteers', async () => {
        const response = await request(app)
          .get('/api/projects?acceptingVolunteers=true');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });

      it('should paginate project listings', async () => {
        const response = await request(app)
          .get('/api/projects?page=1&limit=5');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.pagination.page).toBe(1);
        expect(response.body.data.pagination.limit).toBe(5);
      });
    });

    describe('GET /api/projects/:id', () => {
      it('should get a specific project listing', async () => {
        const response = await request(app)
          .get(`/api/projects/${projectListingId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing).toBeDefined();
        expect(response.body.data.listing.id).toBe(projectListingId);
        expect(response.body.data.listing.category).toBe(ListingCategory.PROJECT);
        expect(response.body.data.listing.targetAudience).toContain('recycler');
      });

      it('should return 404 for non-existent project', async () => {
        const response = await request(app)
          .get('/api/projects/99999');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/projects/:id/volunteer', () => {
      it('should allow recycler to apply for volunteer position', async () => {
        const applicationData = {
          message: 'I am very interested in this recycling project and have experience with plastic waste sorting.',
          experience: 'Worked with local recycling center for 6 months',
          skills: ['sorting', 'plastic identification', 'teamwork'],
          availability: 'Weekends and evenings'
        };

        const response = await request(app)
          .post(`/api/projects/${projectListingId}/volunteer`)
          .set('Authorization', `Bearer ${recyclerToken}`)
          .send(applicationData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing.volunteersApplied).toBe(1);
      });

      it('should reject volunteer application from non-recycler', async () => {
        const applicationData = {
          message: 'I want to volunteer for this project',
          experience: 'Some experience',
          skills: ['sorting'],
          availability: 'Weekends'
        };

        const response = await request(app)
          .post(`/api/projects/${projectListingId}/volunteer`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(applicationData);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Only recyclers can apply for volunteer positions');
      });
    });

    describe('PUT /api/projects/:id', () => {
      it('should update project listing by owner', async () => {
        const updateData = {
          title: 'Updated Community Plastic Recycling Initiative',
          volunteersNeeded: 8,
          projectRequirements: 'Updated requirements with additional safety measures'
        };

        const response = await request(app)
          .put(`/api/projects/${projectListingId}`)
          .set('Authorization', `Bearer ${businessToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing.title).toBe('Updated Community Plastic Recycling Initiative');
        expect(response.body.data.listing.volunteersNeeded).toBe(8);
      });

      it('should reject update from non-owner', async () => {
        const updateData = {
          title: 'Unauthorized Update'
        };

        const response = await request(app)
          .put(`/api/projects/${projectListingId}`)
          .set('Authorization', `Bearer ${recyclerToken}`)
          .send(updateData);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/projects/business/:businessId', () => {
      it('should get projects by business', async () => {
        const response = await request(app)
          .get(`/api/projects/business/${businessId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(Array.isArray(response.body.data.listings)).toBe(true);
      });
    });
  });

  describe('Crafts Listings', () => {
    describe('POST /api/crafts', () => {
      it('should create a new crafts listing as recycler', async () => {
        const craftsData = {
          title: 'Upcycled Plastic Bottle Planter',
          description: 'Beautiful handcrafted planter made from recycled plastic bottles. Perfect for small plants and herbs. Each piece is unique and contributes to environmental sustainability.',
          category: ListingCategory.CRAFTS,
          craftMaterial: CraftMaterial.RECYCLED_PLASTIC,
          craftCategory: CraftCategory.HOME_DECOR,
          pricePerUnit: 25.99,
          quantity: 1,
          unit: 'piece',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '456 Craft Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10002'
          },
          craftingTechnique: 'Hand-cut and assembled with eco-friendly adhesives',
          dimensions: '15cm x 15cm x 20cm',
          careInstructions: 'Wipe clean with damp cloth, suitable for indoor and outdoor use',
          isCustomizable: true,
          estimatedCraftingTime: 3,
          artistName: 'EcoArt Studio',
          artistBio: 'Passionate about creating beautiful art from waste materials'
        };

        const response = await request(app)
          .post('/api/crafts')
          .set('Authorization', `Bearer ${recyclerToken}`)
          .send(craftsData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing).toBeDefined();
        expect(response.body.data.listing.category).toBe(ListingCategory.CRAFTS);
        expect(response.body.data.listing.craftMaterial).toBe(CraftMaterial.RECYCLED_PLASTIC);
        expect(response.body.data.listing.craftCategory).toBe(CraftCategory.HOME_DECOR);
        expect(response.body.data.listing.pricePerUnit).toBe(25.99);
        expect(response.body.data.listing.isCustomizable).toBe(true);
        expect(response.body.data.listing.isAvailableForPurchase).toBe(true);
        
        craftsListingId = response.body.data.listing.id;
      });

      it('should create crafts listing as business', async () => {
        const craftsData = {
          title: 'Reclaimed Wood Coffee Table',
          description: 'Handcrafted coffee table made from reclaimed wood. Each piece tells a story of sustainability and craftsmanship.',
          category: ListingCategory.CRAFTS,
          craftMaterial: CraftMaterial.RECLAIMED_WOOD,
          craftCategory: CraftCategory.FURNITURE,
          pricePerUnit: 299.99,
          quantity: 1,
          unit: 'piece',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '789 Wood Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            postalCode: '10003'
          },
          craftingTechnique: 'Traditional woodworking with modern finishing',
          dimensions: '120cm x 60cm x 45cm',
          careInstructions: 'Dust regularly, use coasters for drinks',
          isCustomizable: false,
          estimatedCraftingTime: 24,
          artistName: 'Sustainable Furniture Co.',
          artistBio: 'Creating beautiful furniture from reclaimed materials'
        };

        const response = await request(app)
          .post('/api/crafts')
          .set('Authorization', `Bearer ${businessToken}`)
          .send(craftsData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing.craftMaterial).toBe(CraftMaterial.RECLAIMED_WOOD);
        expect(response.body.data.listing.craftCategory).toBe(CraftCategory.FURNITURE);
      });

      it('should reject crafts creation from regular user', async () => {
        const craftsData = {
          title: 'Test Craft',
          description: 'Test description for crafts listing',
          category: ListingCategory.CRAFTS,
          craftMaterial: CraftMaterial.RECYCLED_PLASTIC,
          craftCategory: CraftCategory.ARTWORK,
          pricePerUnit: 10.99,
          quantity: 1,
          unit: 'piece',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            postalCode: '12345'
          }
        };

        const response = await request(app)
          .post('/api/crafts')
          .set('Authorization', `Bearer ${userToken}`)
          .send(craftsData);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('Only businesses and recyclers can create crafts listings');
      });
    });

    describe('GET /api/crafts', () => {
      it('should get all crafts listings', async () => {
        const response = await request(app)
          .get('/api/crafts');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(Array.isArray(response.body.data.listings)).toBe(true);
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should filter crafts by material', async () => {
        const response = await request(app)
          .get('/api/crafts?material=recycled_plastic');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });

      it('should filter crafts by category', async () => {
        const response = await request(app)
          .get('/api/crafts?category=home_decor');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });

      it('should filter crafts by price range', async () => {
        const response = await request(app)
          .get('/api/crafts?minPrice=20&maxPrice=50');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });

      it('should sort crafts by price', async () => {
        const response = await request(app)
          .get('/api/crafts?sortBy=price&sortOrder=ASC');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
      });
    });

    describe('GET /api/crafts/featured', () => {
      it('should get featured crafts', async () => {
        const response = await request(app)
          .get('/api/crafts/featured?limit=5');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(Array.isArray(response.body.data.listings)).toBe(true);
      });
    });

    describe('GET /api/crafts/search', () => {
      it('should search crafts by text', async () => {
        const response = await request(app)
          .get('/api/crafts/search?q=plastic');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(response.body.data.searchTerm).toBe('plastic');
      });

      it('should require search term', async () => {
        const response = await request(app)
          .get('/api/crafts/search');

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/crafts/category/:category', () => {
      it('should get crafts by category', async () => {
        const response = await request(app)
          .get('/api/crafts/category/home_decor');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(response.body.data.category).toBe('home_decor');
      });
    });

    describe('GET /api/crafts/:id', () => {
      it('should get a specific crafts listing', async () => {
        const response = await request(app)
          .get(`/api/crafts/${craftsListingId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing).toBeDefined();
        expect(response.body.data.listing.id).toBe(craftsListingId);
        expect(response.body.data.listing.category).toBe(ListingCategory.CRAFTS);
        expect(response.body.data.listing.targetAudience).toContain('user');
        expect(response.body.data.listing.targetAudience).toContain('recycler');
      });
    });

    describe('PUT /api/crafts/:id', () => {
      it('should update crafts listing by owner', async () => {
        const updateData = {
          title: 'Updated Upcycled Plastic Bottle Planter',
          pricePerUnit: 29.99,
          careInstructions: 'Updated care instructions with more details'
        };

        const response = await request(app)
          .put(`/api/crafts/${craftsListingId}`)
          .set('Authorization', `Bearer ${recyclerToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listing.title).toBe('Updated Upcycled Plastic Bottle Planter');
        expect(response.body.data.listing.pricePerUnit).toBe(29.99);
      });
    });

    describe('GET /api/crafts/artist/:artistId', () => {
      it('should get crafts by artist', async () => {
        const response = await request(app)
          .get(`/api/crafts/artist/${recyclerId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.listings).toBeDefined();
        expect(Array.isArray(response.body.data.listings)).toBe(true);
      });
    });
  });

  describe('Listing Integration', () => {
    describe('Mixed Listing Types', () => {
      it('should handle different listing categories in search', async () => {
        // This would test the original listing system with new categories
        const response = await request(app)
          .get('/api/listings?category=waste');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should validate listing type-specific fields', async () => {
        // Test that waste listings still require wasteType
        const invalidWasteData = {
          title: 'Test Waste',
          description: 'Test waste description',
          category: ListingCategory.WASTE,
          // Missing wasteType
          quantity: 100,
          unit: 'kg',
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            country: 'USA',
            postalCode: '12345'
          }
        };

        const response = await request(app)
          .post('/api/listings')
          .set('Authorization', `Bearer ${businessToken}`)
          .send(invalidWasteData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('User Role Validation', () => {
      it('should enforce correct user roles for listing types', async () => {
        // Projects should only be accessible to recyclers
        const projectResponse = await request(app)
          .get('/api/projects')
          .set('Authorization', `Bearer ${userToken}`);

        expect(projectResponse.status).toBe(200); // Can view projects
        
        // But regular users shouldn't be able to apply
        const applicationData = {
          message: 'I want to volunteer',
          experience: 'Some experience',
          skills: ['sorting'],
          availability: 'Weekends'
        };

        const applyResponse = await request(app)
          .post(`/api/projects/${projectListingId}/volunteer`)
          .set('Authorization', `Bearer ${userToken}`)
          .send(applicationData);

        expect(applyResponse.status).toBe(403);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large result sets with pagination', async () => {
      const response = await request(app)
        .get('/api/crafts?limit=100');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.listings.length).toBeLessThanOrEqual(100);
    });

    it('should handle invalid enum values gracefully', async () => {
      const response = await request(app)
        .get('/api/projects?difficulty=invalid_difficulty');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle concurrent volunteer applications', async () => {
      // This would test race conditions in volunteer application counting
      const applicationData = {
        message: 'I want to volunteer for this project',
        experience: 'Some experience',
        skills: ['sorting'],
        availability: 'Weekends'
      };

      const promises = Array(3).fill(null).map(() => 
        request(app)
          .post(`/api/projects/${projectListingId}/volunteer`)
          .set('Authorization', `Bearer ${recyclerToken}`)
          .send(applicationData)
      );

      const responses = await Promise.all(promises);
      
      // Only one should succeed (if user hasn't already applied)
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeLessThanOrEqual(1);
    });
  });
});

/**
 * Test utilities for extended listing system
 */
export const ExtendedListingTestUtils = {
  /**
   * Create test project listing
   */
  async createTestProject(app: any, authToken: string) {
    const projectData = {
      title: 'Test Recycling Project',
      description: 'Test description for recycling project that needs volunteers',
      category: ListingCategory.PROJECT,
      projectDifficulty: ProjectDifficulty.BEGINNER,
      volunteerRequirement: VolunteerRequirement.NO_EXPERIENCE,
      volunteersNeeded: 3,
      projectStartDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expectedOutcome: 'Test outcome for project',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345'
      },
      quantity: 1,
      unit: 'project'
    };

    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send(projectData);

    return response.body.data.listing;
  },

  /**
   * Create test crafts listing
   */
  async createTestCraft(app: any, authToken: string) {
    const craftsData = {
      title: 'Test Upcycled Craft',
      description: 'Test description for upcycled craft item',
      category: ListingCategory.CRAFTS,
      craftMaterial: CraftMaterial.RECYCLED_PLASTIC,
      craftCategory: CraftCategory.ARTWORK,
      pricePerUnit: 19.99,
      quantity: 1,
      unit: 'piece',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        country: 'USA',
        postalCode: '12345'
      },
      craftingTechnique: 'Test technique',
      isCustomizable: true,
      artistName: 'Test Artist'
    };

    const response = await request(app)
      .post('/api/crafts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(craftsData);

    return response.body.data.listing;
  },

  /**
   * Generate test tokens for different user roles
   */
  generateTestTokens() {
    const businessToken = jwt.sign(
      { userId: 1, email: 'business@test.com', roles: ['business'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    const recyclerToken = jwt.sign(
      { userId: 2, email: 'recycler@test.com', roles: ['recycler'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    const userToken = jwt.sign(
      { userId: 3, email: 'user@test.com', roles: ['user'] },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return { businessToken, recyclerToken, userToken };
  }
};