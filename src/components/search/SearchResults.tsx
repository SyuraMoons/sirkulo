/**
 * Search Results Component
 * Displays search results with various view modes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSearch } from '../../hooks/useSearch';
import { RatingDisplay } from '../rating/RatingDisplay';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  image?: string;
  rating?: number;
  reviewCount?: number;
  category: string;
  location?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  originalPrice?: number;
}

interface SearchResultsProps {
  query: string;
  filters?: any;
  onResultPress?: (result: SearchResult) => void;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  filters,
  onResultPress,
  viewMode = 'list',
  onViewModeChange,
}) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  
  const { searchItems } = useSearch();

  useEffect(() => {
    if (query) {
      performSearch(true);
    }
  }, [query, filters]);

  const performSearch = async (reset = false) => {
    if (reset) {
      setPage(1);
      setResults([]);
    }

    try {
      setLoading(true);
      const response = await searchItems({
        query,
        filters,
        page: reset ? 1 : page,
        limit: 20,
      });

      if (reset) {
        setResults(response.results);
      } else {
        setResults(prev => [...prev, ...response.results]);
      }

      setTotalResults(response.total);
      setHasMore(response.hasMore);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    performSearch(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      performSearch(false);
    }
  };

  const formatPrice = (price: number, currency = '$') => {
    return `${currency}${price.toFixed(2)}`;
  };

  const renderListItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => onResultPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome name="image" size={24} color="#DDD" />
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <FontAwesome name="star" size={12} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          {item.location && (
            <Text style={styles.itemLocation}>• {item.location}</Text>
          )}
        </View>
        
        {item.rating && (
          <View style={styles.ratingContainer}>
            <RatingDisplay rating={item.rating} size={14} showValue={false} />
            <Text style={styles.reviewCount}>
              ({item.reviewCount || 0})
            </Text>
          </View>
        )}
        
        {item.price && (
          <View style={styles.priceContainer}>
            {item.discount && item.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.originalPrice, item.currency)}
              </Text>
            )}
            <Text style={styles.itemPrice}>
              {formatPrice(item.price, item.currency)}
            </Text>
            {item.discount && (
              <Text style={styles.discount}>-{item.discount}%</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => onResultPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.gridImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.gridImage} />
        ) : (
          <View style={styles.gridPlaceholder}>
            <FontAwesome name="image" size={32} color="#DDD" />
          </View>
        )}
        {item.isNew && (
          <View style={styles.gridNewBadge}>
            <Text style={styles.gridBadgeText}>NEW</Text>
          </View>
        )}
        {item.isFeatured && (
          <View style={styles.gridFeaturedBadge}>
            <FontAwesome name="star" size={10} color="#FFF" />
          </View>
        )}
      </View>
      
      <View style={styles.gridContent}>
        <Text style={styles.gridTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.rating && (
          <View style={styles.gridRating}>
            <RatingDisplay rating={item.rating} size={12} showValue={false} />
            <Text style={styles.gridReviewCount}>
              ({item.reviewCount || 0})
            </Text>
          </View>
        )}
        
        {item.price && (
          <View style={styles.gridPriceContainer}>
            <Text style={styles.gridPrice}>
              {formatPrice(item.price, item.currency)}
            </Text>
            {item.discount && (
              <Text style={styles.gridDiscount}>-{item.discount}%</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          {totalResults} results for "{query}"
        </Text>
      </View>
      
      <View style={styles.viewControls}>
        <TouchableOpacity
          style={[
            styles.viewButton,
            viewMode === 'list' && styles.viewButtonActive,
          ]}
          onPress={() => onViewModeChange?.('list')}
        >
          <FontAwesome
            name="list"
            size={16}
            color={viewMode === 'list' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewButton,
            viewMode === 'grid' && styles.viewButtonActive,
          ]}
          onPress={() => onViewModeChange?.('grid')}
        >
          <FontAwesome
            name="th"
            size={16}
            color={viewMode === 'grid' ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.endText}>No more results</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.footer}>
        {loading && <ActivityIndicator color="#007AFF" />}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="search" size={48} color="#DDD" />
      <Text style={styles.emptyText}>No results found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  if (loading && results.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Searching...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode} // Force re-render when view mode changes
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  resultsInfo: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  viewButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  // List view styles
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF9800',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCategory: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  itemLocation: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discount: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  // Grid view styles
  gridItem: {
    flex: 1,
    backgroundColor: '#FFF',
    margin: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridImageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  gridPlaceholder: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridNewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridFeaturedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF9800',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadgeText: {
    fontSize: 8,
    color: '#FFF',
    fontWeight: '600',
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  gridRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridReviewCount: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  gridDiscount: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});