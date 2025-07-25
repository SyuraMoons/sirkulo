/**
 * Search Filters Component
 * Advanced filtering options for search results
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSearch } from '../../hooks/useSearch';

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface SearchFilters {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
  rating: number;
  location: string;
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest';
  inStock: boolean;
  freeShipping: boolean;
}

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    location: '',
    dateRange: { start: '', end: '' },
    sortBy: 'relevance',
    inStock: false,
    freeShipping: false,
    ...initialFilters,
  });

  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [locations, setLocations] = useState<FilterOption[]>([]);
  const { getFilterOptions } = useSearch();

  useEffect(() => {
    if (visible) {
      loadFilterOptions();
    }
  }, [visible]);

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      setCategories(options.categories || []);
      setLocations(options.locations || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      location: '',
      dateRange: { start: '', end: '' },
      sortBy: 'relevance',
      inStock: false,
      freeShipping: false,
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    if (filters.rating > 0) count++;
    if (filters.location) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.sortBy !== 'relevance') count++;
    if (filters.inStock) count++;
    if (filters.freeShipping) count++;
    return count;
  };

  const renderStarRating = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => updateFilter('rating', i === filters.rating ? 0 : i)}
          style={styles.starButton}
        >
          <FontAwesome
            name={i <= filters.rating ? 'star' : 'star-o'}
            size={24}
            color={i <= filters.rating ? '#FFD700' : '#DDD'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderSortOptions = () => {
    const options = [
      { value: 'relevance', label: 'Relevance' },
      { value: 'price_low', label: 'Price: Low to High' },
      { value: 'price_high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'newest', label: 'Newest First' },
    ];

    return options.map((option) => (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.sortOption,
          filters.sortBy === option.value && styles.sortOptionSelected,
        ]}
        onPress={() => updateFilter('sortBy', option.value as any)}
      >
        <Text
          style={[
            styles.sortOptionText,
            filters.sortBy === option.value && styles.sortOptionTextSelected,
          ]}
        >
          {option.label}
        </Text>
        {filters.sortBy === option.value && (
          <FontAwesome name="check" size={16} color="#007AFF" />
        )}
      </TouchableOpacity>
    ));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome name="times" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    filters.categories.includes(category.id) && styles.categoryChipSelected,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      filters.categories.includes(category.id) && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                  {category.count && (
                    <Text
                      style={[
                        styles.categoryCount,
                        filters.categories.includes(category.id) && styles.categoryCountSelected,
                      ]}
                    >
                      {category.count}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceContainer}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Min</Text>
                <TextInput
                  style={styles.priceField}
                  value={filters.priceRange.min.toString()}
                  onChangeText={(text) =>
                    updateFilter('priceRange', {
                      ...filters.priceRange,
                      min: parseInt(text) || 0,
                    })
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <Text style={styles.priceSeparator}>to</Text>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Max</Text>
                <TextInput
                  style={styles.priceField}
                  value={filters.priceRange.max.toString()}
                  onChangeText={(text) =>
                    updateFilter('priceRange', {
                      ...filters.priceRange,
                      max: parseInt(text) || 1000,
                    })
                  }
                  keyboardType="numeric"
                  placeholder="1000"
                />
              </View>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingContainer}>
              {renderStarRating()}
              <Text style={styles.ratingText}>
                {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TextInput
              style={styles.locationInput}
              value={filters.location}
              onChangeText={(text) => updateFilter('location', text)}
              placeholder="Enter location..."
            />
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {renderSortOptions()}
          </View>

          {/* Additional Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Options</Text>
            <View style={styles.switchContainer}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>In Stock Only</Text>
                <Switch
                  value={filters.inStock}
                  onValueChange={(value) => updateFilter('inStock', value)}
                  trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Free Shipping</Text>
                <Switch
                  value={filters.freeShipping}
                  onValueChange={(value) => updateFilter('freeShipping', value)}
                  trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  clearText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F9F9F9',
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  categoryChipTextSelected: {
    color: '#FFF',
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  categoryCountSelected: {
    color: '#FFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceField: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  priceSeparator: {
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sortOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#333',
  },
  sortOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  switchContainer: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});