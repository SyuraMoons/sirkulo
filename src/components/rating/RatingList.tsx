/**
 * Rating List Component
 * Displays a list of ratings and reviews with pagination
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRating } from '../../hooks/useRating';
import { RatingDisplay } from './RatingDisplay';

interface RatingListProps {
  itemId: string;
  itemType: 'product' | 'service' | 'user';
  showAddButton?: boolean;
  onAddRating?: () => void;
  maxItems?: number;
}

interface RatingItem {
  id: string;
  rating: number;
  comment?: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  isOwn?: boolean;
}

export const RatingList: React.FC<RatingListProps> = ({
  itemId,
  itemType,
  showAddButton = true,
  onAddRating,
  maxItems,
}) => {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { getRatings, deleteRating } = useRating();

  const loadRatings = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await getRatings(itemId, itemType, {
        page: pageNum,
        limit: maxItems || 10,
      });

      if (pageNum === 1 || refresh) {
        setRatings(response.ratings);
      } else {
        setRatings(prev => [...prev, ...response.ratings]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load ratings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [itemId, itemType]);

  const handleRefresh = () => {
    loadRatings(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadRatings(page + 1);
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    try {
      await deleteRating(ratingId);
      setRatings(prev => prev.filter(r => r.id !== ratingId));
    } catch (error) {
      console.error('Failed to delete rating:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRatingItem = ({ item }: { item: RatingItem }) => (
    <View style={styles.ratingItem}>
      <View style={styles.ratingHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {item.userAvatar ? (
              <Text style={styles.avatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            ) : (
              <FontAwesome name="user" size={16} color="#666" />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.ratingDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.ratingActions}>
          <RatingDisplay 
            rating={item.rating} 
            size={16} 
            showValue={false}
          />
          {item.isOwn && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteRating(item.id)}
            >
              <FontAwesome name="trash" size={14} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {item.comment && (
        <Text style={styles.comment}>{item.comment}</Text>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Reviews</Text>
      {showAddButton && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddRating}
        >
          <FontAwesome name="plus" size={14} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        {loading && <ActivityIndicator color="#007AFF" />}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="star-o" size={48} color="#DDD" />
      <Text style={styles.emptyText}>No reviews yet</Text>
      <Text style={styles.emptySubtext}>
        Be the first to share your experience
      </Text>
      {showAddButton && (
        <TouchableOpacity
          style={styles.emptyAddButton}
          onPress={onAddRating}
        >
          <Text style={styles.emptyAddButtonText}>Add Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && ratings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ratings}
        renderItem={renderRatingItem}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingItem: {
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
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
  },
  ratingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  comment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
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
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});