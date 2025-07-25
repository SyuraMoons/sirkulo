# Extended Listing System Documentation

## Overview

The Sirkulo Extended Listing System expands the original waste marketplace to support two new types of listings:

1. **Project Listings** - Recycling projects posted by businesses seeking volunteers (recycler users)
2. **Crafts Listings** - Upcycled/recycled art and crafts for sale to regular users and recyclers

This extension maintains backward compatibility with the existing waste listing system while adding powerful new features for community engagement and sustainable commerce.

## Architecture Overview

### Listing Categories

```typescript
enum ListingCategory {
  WASTE = 'waste',        // Original waste/trash listings
  PROJECT = 'project',    // Recycling projects for volunteers
  CRAFTS = 'crafts',      // Upcycled/recycled crafts and art
}
```

### User Role Access Matrix

| Listing Type | Create | View | Purchase/Apply | Target Audience |
|--------------|--------|------|----------------|-----------------|
| **Waste** | Business | All | User, Recycler, Business | All users |
| **Project** | Business | All | Recycler only | Recyclers |
| **Crafts** | Business, Recycler | All | User, Recycler | Users & Recyclers |

## Project Listings

### Overview
Project listings allow businesses to post recycling-related tasks or projects that require volunteer assistance. Only recycler users can apply for these volunteer positions.

### Key Features
- **Volunteer Management**: Track needed vs. applied volunteers
- **Difficulty Levels**: Beginner to Expert classifications
- **Skill Requirements**: From no experience to certification required
- **Project Timeline**: Start and end dates
- **Location Support**: Physical location or remote work options
- **Application System**: Structured volunteer applications

### Data Model

```typescript
interface ProjectListing {
  // Base listing fields
  id: number;
  title: string;
  description: string;
  category: ListingCategory.PROJECT;
  
  // Project-specific fields
  projectDifficulty: ProjectDifficulty;
  volunteerRequirement: VolunteerRequirement;
  volunteersNeeded: number;
  volunteersApplied: number;
  projectStartDate: Date;
  projectEndDate?: Date;
  projectRequirements?: string;
  expectedOutcome: string;
  projectLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  };
  
  // Status
  isAcceptingVolunteers: boolean;
}
```

### Enums

```typescript
enum ProjectDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

enum VolunteerRequirement {
  NO_EXPERIENCE = 'no_experience',
  BASIC_SKILLS = 'basic_skills',
  SPECIALIZED_SKILLS = 'specialized_skills',
  CERTIFICATION_REQUIRED = 'certification_required',
}
```

### API Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer <business-token>
Content-Type: application/json

{
  "title": "Community Plastic Recycling Initiative",
  "description": "We are looking for volunteers to help sort and process plastic waste...",
  "projectDifficulty": "beginner",
  "volunteerRequirement": "no_experience",
  "volunteersNeeded": 5,
  "projectStartDate": "2024-02-01T09:00:00Z",
  "projectEndDate": "2024-02-15T17:00:00Z",
  "expectedOutcome": "Sort and process 500kg of plastic waste for recycling",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Green Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  },
  "projectLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Green Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "isRemote": false
  },
  "projectRequirements": "Basic safety training will be provided on-site",
  "quantity": 1,
  "unit": "project"
}
```

#### Get Projects with Filters
```http
GET /api/projects?difficulty=beginner&acceptingVolunteers=true&isRemote=false&page=1&limit=20
```

#### Apply for Volunteer Position
```http
POST /api/projects/{id}/volunteer
Authorization: Bearer <recycler-token>
Content-Type: application/json

{
  "message": "I am very interested in this recycling project and have experience with plastic waste sorting.",
  "experience": "Worked with local recycling center for 6 months",
  "skills": ["sorting", "plastic identification", "teamwork"],
  "availability": "Weekends and evenings"
}
```

### Business Logic

#### Volunteer Acceptance Logic
```typescript
isAcceptingVolunteers(): boolean {
  // Check if project is active
  if (!this.isActive || this.status !== ListingStatus.ACTIVE) {
    return false;
  }

  // Check if volunteer capacity reached
  if (this.volunteersNeeded && this.volunteersApplied >= this.volunteersNeeded) {
    return false;
  }

  // Check if project has already started
  const now = new Date();
  if (this.projectStartDate && this.projectStartDate <= now) {
    return false;
  }

  return true;
}
```

## Crafts Listings

### Overview
Crafts listings showcase upcycled and recycled art, crafts, and functional items that can be purchased by regular users and recyclers. These listings support both businesses and recyclers as creators.

### Key Features
- **Material Tracking**: Specify recycled/upcycled materials used
- **Craft Categories**: Artwork, furniture, accessories, etc.
- **Artist Information**: Artist name and bio
- **Customization Options**: Mark items as customizable
- **Crafting Details**: Technique, time estimates, dimensions
- **Care Instructions**: Maintenance and care information

### Data Model

```typescript
interface CraftsListing {
  // Base listing fields
  id: number;
  title: string;
  description: string;
  category: ListingCategory.CRAFTS;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  
  // Crafts-specific fields
  craftMaterial: CraftMaterial;
  craftCategory: CraftCategory;
  craftingTechnique?: string;
  dimensions?: string;
  careInstructions?: string;
  isCustomizable: boolean;
  estimatedCraftingTime?: number; // in hours
  artistName?: string;
  artistBio?: string;
  
  // Status
  isAvailableForPurchase: boolean;
}
```

### Enums

```typescript
enum CraftMaterial {
  RECYCLED_PLASTIC = 'recycled_plastic',
  UPCYCLED_FABRIC = 'upcycled_fabric',
  RECLAIMED_WOOD = 'reclaimed_wood',
  RECYCLED_METAL = 'recycled_metal',
  REPURPOSED_GLASS = 'repurposed_glass',
  MIXED_MATERIALS = 'mixed_materials',
  OTHER = 'other',
}

enum CraftCategory {
  ARTWORK = 'artwork',
  FURNITURE = 'furniture',
  ACCESSORIES = 'accessories',
  HOME_DECOR = 'home_decor',
  JEWELRY = 'jewelry',
  BAGS_PURSES = 'bags_purses',
  CLOTHING = 'clothing',
  TOYS = 'toys',
  FUNCTIONAL_ITEMS = 'functional_items',
  OTHER = 'other',
}
```

### API Endpoints

#### Create Crafts Listing
```http
POST /api/crafts
Authorization: Bearer <recycler-or-business-token>
Content-Type: application/json

{
  "title": "Upcycled Plastic Bottle Planter",
  "description": "Beautiful handcrafted planter made from recycled plastic bottles...",
  "craftMaterial": "recycled_plastic",
  "craftCategory": "home_decor",
  "pricePerUnit": 25.99,
  "quantity": 1,
  "unit": "piece",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "456 Craft Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10002"
  },
  "craftingTechnique": "Hand-cut and assembled with eco-friendly adhesives",
  "dimensions": "15cm x 15cm x 20cm",
  "careInstructions": "Wipe clean with damp cloth, suitable for indoor and outdoor use",
  "isCustomizable": true,
  "estimatedCraftingTime": 3,
  "artistName": "EcoArt Studio",
  "artistBio": "Passionate about creating beautiful art from waste materials"
}
```

#### Get Crafts with Filters
```http
GET /api/crafts?material=recycled_plastic&category=home_decor&minPrice=10&maxPrice=50&isCustomizable=true
```

#### Search Crafts
```http
GET /api/crafts/search?q=plastic+bottle&page=1&limit=20
```

#### Get Featured Crafts
```http
GET /api/crafts/featured?limit=12
```

#### Get Crafts by Category
```http
GET /api/crafts/category/home_decor?page=1&limit=20
```

#### Get Crafts by Artist
```http
GET /api/crafts/artist/{artistId}?page=1&limit=20
```

## Database Schema

### Updated Listings Table
```sql
-- Add new columns to existing listings table
ALTER TABLE listings 
ADD COLUMN category VARCHAR(20) NOT NULL DEFAULT 'waste',
ADD COLUMN project_difficulty VARCHAR(20),
ADD COLUMN volunteer_requirement VARCHAR(30),
ADD COLUMN volunteers_needed INTEGER,
ADD COLUMN volunteers_applied INTEGER DEFAULT 0,
ADD COLUMN project_start_date TIMESTAMP,
ADD COLUMN project_end_date TIMESTAMP,
ADD COLUMN project_requirements TEXT,
ADD COLUMN expected_outcome TEXT,
ADD COLUMN project_location JSONB,
ADD COLUMN craft_material VARCHAR(30),
ADD COLUMN craft_category VARCHAR(30),
ADD COLUMN crafting_technique VARCHAR(200),
ADD COLUMN dimensions VARCHAR(100),
ADD COLUMN care_instructions TEXT,
ADD COLUMN is_customizable BOOLEAN DEFAULT false,
ADD COLUMN estimated_crafting_time INTEGER,
ADD COLUMN artist_name VARCHAR(100),
ADD COLUMN artist_bio TEXT;

-- Make waste_type nullable for non-waste listings
ALTER TABLE listings ALTER COLUMN waste_type DROP NOT NULL;

-- Add check constraints
ALTER TABLE listings ADD CONSTRAINT check_category 
  CHECK (category IN ('waste', 'project', 'crafts'));

ALTER TABLE listings ADD CONSTRAINT check_project_difficulty 
  CHECK (project_difficulty IS NULL OR project_difficulty IN ('beginner', 'intermediate', 'advanced', 'expert'));

ALTER TABLE listings ADD CONSTRAINT check_volunteer_requirement 
  CHECK (volunteer_requirement IS NULL OR volunteer_requirement IN ('no_experience', 'basic_skills', 'specialized_skills', 'certification_required'));

ALTER TABLE listings ADD CONSTRAINT check_craft_material 
  CHECK (craft_material IS NULL OR craft_material IN ('recycled_plastic', 'upcycled_fabric', 'reclaimed_wood', 'recycled_metal', 'repurposed_glass', 'mixed_materials', 'other'));

ALTER TABLE listings ADD CONSTRAINT check_craft_category 
  CHECK (craft_category IS NULL OR craft_category IN ('artwork', 'furniture', 'accessories', 'home_decor', 'jewelry', 'bags_purses', 'clothing', 'toys', 'functional_items', 'other'));
```

### Volunteer Applications Table
```sql
CREATE TABLE volunteer_applications (
  id SERIAL PRIMARY KEY,
  project_listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  volunteer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  experience TEXT,
  skills TEXT[], -- Array of skills
  availability TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INTEGER REFERENCES users(id),
  review_notes TEXT,
  UNIQUE(project_listing_id, volunteer_user_id)
);

CREATE INDEX idx_volunteer_applications_project ON volunteer_applications(project_listing_id);
CREATE INDEX idx_volunteer_applications_volunteer ON volunteer_applications(volunteer_user_id);
CREATE INDEX idx_volunteer_applications_status ON volunteer_applications(status);
```

## Frontend Integration Examples

### React Components

#### Project Listing Card
```jsx
import React from 'react';
import { ProjectListing } from '../types';

interface ProjectCardProps {
  project: ProjectListing;
  onApply: (projectId: number) => void;
  userRole: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onApply, userRole }) => {
  const canApply = userRole === 'recycler' && project.isAcceptingVolunteers;
  
  return (
    <div className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      
      <div className="project-details">
        <span className="difficulty">Difficulty: {project.projectDifficulty}</span>
        <span className="volunteers">
          {project.volunteersApplied}/{project.volunteersNeeded} volunteers
        </span>
        <span className="start-date">
          Starts: {new Date(project.projectStartDate).toLocaleDateString()}
        </span>
      </div>
      
      <div className="project-location">
        <span>{project.projectLocation?.city}, {project.projectLocation?.state}</span>
        {project.projectLocation?.isRemote && <span className="remote-badge">Remote</span>}
      </div>
      
      <div className="expected-outcome">
        <strong>Expected Outcome:</strong> {project.expectedOutcome}
      </div>
      
      {canApply && (
        <button 
          className="apply-button"
          onClick={() => onApply(project.id)}
        >
          Apply to Volunteer
        </button>
      )}
      
      {!project.isAcceptingVolunteers && (
        <span className="not-accepting">Not currently accepting volunteers</span>
      )}
    </div>
  );
};
```

#### Crafts Listing Card
```jsx
import React from 'react';
import { CraftsListing } from '../types';

interface CraftsCardProps {
  craft: CraftsListing;
  onAddToCart: (craftId: number) => void;
}

export const CraftsCard: React.FC<CraftsCardProps> = ({ craft, onAddToCart }) => {
  return (
    <div className="crafts-card">
      <div className="craft-image">
        <img src={craft.images[0]} alt={craft.title} />
        {craft.isCustomizable && <span className="customizable-badge">Customizable</span>}
      </div>
      
      <div className="craft-info">
        <h3>{craft.title}</h3>
        <p className="artist">by {craft.artistName}</p>
        <p className="price">${craft.pricePerUnit}</p>
        
        <div className="craft-details">
          <span className="material">{craft.craftMaterial.replace('_', ' ')}</span>
          <span className="category">{craft.craftCategory.replace('_', ' ')}</span>
          {craft.dimensions && <span className="dimensions">{craft.dimensions}</span>}
        </div>
        
        {craft.estimatedCraftingTime && (
          <p className="crafting-time">
            Crafting time: {craft.estimatedCraftingTime} hours
          </p>
        )}
        
        <div className="rating">
          ⭐ {craft.averageRating} ({craft.totalRatings} reviews)
        </div>
        
        {craft.isAvailableForPurchase ? (
          <button 
            className="add-to-cart-button"
            onClick={() => onAddToCart(craft.id)}
          >
            Add to Cart
          </button>
        ) : (
          <span className="sold-out">Sold Out</span>
        )}
      </div>
    </div>
  );
};
```

#### Volunteer Application Form
```jsx
import React, { useState } from 'react';

interface VolunteerApplicationFormProps {
  projectId: number;
  onSubmit: (application: VolunteerApplication) => void;
  onCancel: () => void;
}

export const VolunteerApplicationForm: React.FC<VolunteerApplicationFormProps> = ({
  projectId,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    message: '',
    experience: '',
    skills: [],
    availability: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      projectId,
      ...formData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="volunteer-application-form">
      <h3>Apply for Volunteer Position</h3>
      
      <div className="form-group">
        <label htmlFor="message">Why are you interested in this project? *</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
          minLength={10}
          maxLength={1000}
          placeholder="Tell us why you want to volunteer for this project..."
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="experience">Relevant Experience</label>
        <textarea
          id="experience"
          value={formData.experience}
          onChange={(e) => setFormData({...formData, experience: e.target.value})}
          maxLength={500}
          placeholder="Describe any relevant experience you have..."
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="skills">Skills</label>
        <input
          type="text"
          id="skills"
          value={formData.skills.join(', ')}
          onChange={(e) => setFormData({
            ...formData, 
            skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
          })}
          placeholder="e.g., sorting, plastic identification, teamwork"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="availability">Availability</label>
        <input
          type="text"
          id="availability"
          value={formData.availability}
          onChange={(e) => setFormData({...formData, availability: e.target.value})}
          maxLength={200}
          placeholder="e.g., Weekends and evenings"
        />
      </div>
      
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancel
        </button>
        <button type="submit" className="submit-button">
          Submit Application
        </button>
      </div>
    </form>
  );
};
```

## Business Logic and Validation

### Listing Type Validation
```typescript
// In Listing model
validateListingType(): string[] {
  const errors: string[] = [];

  if (this.isProject()) {
    if (!this.projectDifficulty) errors.push('Project difficulty is required');
    if (!this.volunteerRequirement) errors.push('Volunteer requirement is required');
    if (!this.volunteersNeeded || this.volunteersNeeded <= 0) {
      errors.push('Number of volunteers needed must be greater than 0');
    }
    if (!this.projectStartDate) errors.push('Project start date is required');
    if (!this.expectedOutcome) errors.push('Expected outcome is required');
  }

  if (this.isCraft()) {
    if (!this.craftMaterial) errors.push('Craft material is required');
    if (!this.craftCategory) errors.push('Craft category is required');
    if (!this.pricePerUnit || this.pricePerUnit <= 0) {
      errors.push('Price is required for craft listings');
    }
  }

  if (this.isWaste()) {
    if (!this.wasteType) errors.push('Waste type is required for waste listings');
    if (!this.quantity || this.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }
  }

  return errors;
}
```

### Access Control
```typescript
// Check user permissions for listing operations
export const checkListingPermissions = (
  operation: 'create' | 'view' | 'purchase' | 'apply',
  listingType: ListingCategory,
  userRoles: UserRole[]
): boolean => {
  switch (operation) {
    case 'create':
      if (listingType === ListingCategory.PROJECT) {
        return userRoles.includes(UserRole.BUSINESS);
      }
      if (listingType === ListingCategory.CRAFTS) {
        return userRoles.includes(UserRole.BUSINESS) || userRoles.includes(UserRole.RECYCLER);
      }
      if (listingType === ListingCategory.WASTE) {
        return userRoles.includes(UserRole.BUSINESS);
      }
      break;
      
    case 'view':
      return true; // All users can view all listing types
      
    case 'purchase':
      if (listingType === ListingCategory.CRAFTS || listingType === ListingCategory.WASTE) {
        return userRoles.includes(UserRole.USER) || userRoles.includes(UserRole.RECYCLER);
      }
      return false; // Projects cannot be purchased
      
    case 'apply':
      if (listingType === ListingCategory.PROJECT) {
        return userRoles.includes(UserRole.RECYCLER);
      }
      return false; // Only projects accept applications
  }
  
  return false;
};
```

## Performance Considerations

### Database Indexing
```sql
-- Indexes for efficient querying
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_category_status ON listings(category, status) WHERE is_active = true;
CREATE INDEX idx_listings_project_difficulty ON listings(project_difficulty) WHERE category = 'project';
CREATE INDEX idx_listings_craft_material ON listings(craft_material) WHERE category = 'crafts';
CREATE INDEX idx_listings_craft_category ON listings(craft_category) WHERE category = 'crafts';
CREATE INDEX idx_listings_price_range ON listings(price_per_unit) WHERE category = 'crafts';
CREATE INDEX idx_listings_project_dates ON listings(project_start_date, project_end_date) WHERE category = 'project';
CREATE INDEX idx_listings_volunteers ON listings(volunteers_needed, volunteers_applied) WHERE category = 'project';
```

### Caching Strategy
```typescript
// Cache frequently accessed data
export class ListingCacheService {
  private redis: Redis;
  
  async getFeaturedCrafts(limit: number = 12): Promise<CraftsListing[]> {
    const cacheKey = `featured_crafts:${limit}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const featured = await this.listingRepository.getFeaturedCrafts(limit);
    await this.redis.setex(cacheKey, 300, JSON.stringify(featured)); // 5 min cache
    
    return featured;
  }
  
  async getActiveProjectsCount(): Promise<number> {
    const cacheKey = 'active_projects_count';
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return parseInt(cached);
    }
    
    const count = await this.listingRepository.getActiveProjectsCount();
    await this.redis.setex(cacheKey, 60, count.toString()); // 1 min cache
    
    return count;
  }
}
```

## Security Considerations

### Input Validation
- All user inputs are validated using class-validator decorators
- Enum values are strictly validated
- File uploads for craft images are validated for type and size
- SQL injection protection through TypeORM parameterized queries

### Access Control
- JWT-based authentication for all protected endpoints
- Role-based authorization for different listing operations
- Ownership verification for update/delete operations
- Rate limiting on volunteer applications

### Data Protection
- Sensitive user information is not exposed in public listings
- Location data is limited to city/state level in public views
- Contact information is only shared through the messaging system

## Migration Guide

### From Existing System
1. **Database Migration**: Run the provided SQL scripts to add new columns
2. **Code Updates**: Update imports to include new enums and types
3. **Frontend Changes**: Add new components for project and crafts listings
4. **Testing**: Run the comprehensive test suite to ensure compatibility

### Backward Compatibility
- All existing waste listings continue to work without modification
- Existing API endpoints remain functional
- New category field defaults to 'waste' for existing listings
- Gradual migration approach supported

## Future Enhancements

### Planned Features
- **Project Templates**: Pre-defined project types for common recycling tasks
- **Skill Matching**: Automatic matching of volunteers to projects based on skills
- **Progress Tracking**: Track project completion and volunteer contributions
- **Craft Collections**: Group related crafts into collections
- **Custom Orders**: Allow customers to request custom crafts
- **Artist Verification**: Verification system for craft artists
- **Impact Metrics**: Track environmental impact of projects and crafts

### Technical Improvements
- **GraphQL API**: Consider GraphQL for more efficient data fetching
- **Real-time Updates**: Socket.IO integration for real-time project updates
- **Advanced Search**: Elasticsearch integration for better search capabilities
- **Image Recognition**: AI-powered material identification for crafts
- **Recommendation Engine**: ML-based recommendations for users

## Support and Maintenance

### Monitoring
- Track listing creation rates by category
- Monitor volunteer application success rates
- Track craft sales and popular categories
- Alert on failed validation or permission errors

### Analytics
- Project completion rates
- Volunteer engagement metrics
- Craft sales performance
- User role distribution across listing types

### Troubleshooting
- Check user roles for permission issues
- Validate enum values for creation errors
- Verify date ranges for project scheduling
- Monitor database constraints for data integrity

This extended listing system provides a comprehensive foundation for expanding the Sirkulo platform beyond waste trading to include community engagement through recycling projects and sustainable commerce through upcycled crafts.