/**
 * Rating Display Component
 * Shows rating stars and statistics
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onPress?: () => void;
  readonly?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  totalRatings,
  size = 'medium',
  showText = true,
  onPress,
  readonly = true,
}) => {
  const getStarSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 16;
      case 'large': return 20;
      default: return 16;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'medium': return 14;
      case 'large': return 16;
      default: return 14;
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesome
            key={i}
            name="star"
            size={getStarSize()}
            color="#FFD700"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesome
            key={i}
            name="star-half-full"
            size={getStarSize()}
            color="#FFD700"
          />
        );
      } else {
        stars.push(
          <FontAwesome
            key={i}
            name="star-o"
            size={getStarSize()}
            color="#DDD"
          />
        );
      }
    }

    return stars;
  };

  const content = (
    <View style={[styles.container, size === 'small' && styles.smallContainer]}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.ratingText, { fontSize: getTextSize() }]}>
            {rating.toFixed(1)}
          </Text>
          {totalRatings !== undefined && (
            <Text style={[styles.countText, { fontSize: getTextSize() - 2 }]}>
              ({totalRatings})
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (readonly || !onPress) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallContainer: {
    gap: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '600',
    color: '#333',
  },
  countText: {
    color: '#666',
  },
  touchable: {
    padding: 4,
  },
});