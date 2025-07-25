/**
 * Notification Bell Icon Component
 * Displays notification count with bell icon
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNotification } from '../../hooks/useNotification';

interface NotificationBellProps {
  onPress?: () => void;
  size?: number;
  color?: string;
  showBadge?: boolean;
  animated?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onPress,
  size = 24,
  color = '#333',
  showBadge = true,
  animated = true,
}) => {
  const { unreadCount, hasUnread } = useNotification();
  const shakeAnimation = new Animated.Value(0);

  React.useEffect(() => {
    if (animated && hasUnread) {
      const shake = () => {
        Animated.sequence([
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnimation, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      };

      const interval = setInterval(shake, 3000);
      return () => clearInterval(interval);
    }
  }, [hasUnread, animated]);

  const getBadgeText = () => {
    if (unreadCount > 99) return '99+';
    return unreadCount.toString();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.bellContainer,
          animated && {
            transform: [{ translateX: shakeAnimation }],
          },
        ]}
      >
        <FontAwesome
          name={hasUnread ? 'bell' : 'bell-o'}
          size={size}
          color={hasUnread ? '#007AFF' : color}
        />
        
        {showBadge && hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {getBadgeText()}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  bellContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});