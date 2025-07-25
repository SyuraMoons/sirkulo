/**
 * Notification List Component
 * Displays list of notifications with actions
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
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNotification } from '../../hooks/useNotification';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationListProps {
  onNotificationPress?: (notification: NotificationItem) => void;
  showMarkAllRead?: boolean;
  maxItems?: number;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  onNotificationPress,
  showMarkAllRead = true,
  maxItems,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotification();

  const loadNotifications = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const response = await getNotifications({
        page: pageNum,
        limit: maxItems || 20,
      });

      if (pageNum === 1 || refresh) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = () => {
    loadNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
    
    onNotificationPress?.(notification);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId);
              setNotifications(prev =>
                prev.filter(n => n.id !== notificationId)
              );
            } catch (error) {
              console.error('Failed to delete notification:', error);
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: '#4CAF50' };
      case 'warning':
        return { name: 'exclamation-triangle', color: '#FF9800' };
      case 'error':
        return { name: 'times-circle', color: '#F44336' };
      default:
        return { name: 'info-circle', color: '#2196F3' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadItem,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.iconContainer}>
            <FontAwesome
              name={icon.name as any}
              size={20}
              color={icon.color}
            />
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              !item.isRead && styles.unreadTitle,
            ]}>
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timestamp}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <FontAwesome name="times" size={16} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Notifications</Text>
      {showMarkAllRead && unreadCount > 0 && (
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllRead}
        >
          <Text style={styles.markAllText}>Mark all read</Text>
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
      <FontAwesome name="bell-slash" size={48} color="#DDD" />
      <Text style={styles.emptyText}>No notifications</Text>
      <Text style={styles.emptySubtext}>
        You're all caught up!
      </Text>
    </View>
  );

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  markAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 2,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#000',
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
  },
});