/**
 * Rating Form Component
 * Allows users to submit ratings and reviews
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRating } from '../../hooks/useRating';

interface RatingFormProps {
  itemId: string;
  itemType: 'product' | 'service' | 'user';
  onSubmit?: (rating: number, comment?: string) => void;
  onCancel?: () => void;
  initialRating?: number;
  initialComment?: string;
  isEdit?: boolean;
}

export const RatingForm: React.FC<RatingFormProps> = ({
  itemId,
  itemType,
  onSubmit,
  onCancel,
  initialRating = 0,
  initialComment = '',
  isEdit = false,
}) => {
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createRating, updateRating } = useRating();

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateRating(itemId, selectedRating, comment);
      } else {
        await createRating({
          itemId,
          itemType,
          rating: selectedRating,
          comment: comment.trim() || undefined,
        });
      }
      
      onSubmit?.(selectedRating, comment.trim() || undefined);
      Alert.alert('Success', 'Rating submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          style={styles.starButton}
        >
          <FontAwesome
            name={i <= selectedRating ? 'star' : 'star-o'}
            size={32}
            color={i <= selectedRating ? '#FFD700' : '#DDD'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (selectedRating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Tap to rate';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEdit ? 'Update Rating' : 'Rate this item'}
      </Text>
      
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      <Text style={styles.ratingText}>
        {getRatingText()}
      </Text>

      <View style={styles.commentContainer}>
        <Text style={styles.commentLabel}>Comment (Optional)</Text>
        <TextInput
          style={styles.commentInput}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isSubmitting || selectedRating === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Update' : 'Submit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontWeight: '500',
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    backgroundColor: '#F9F9F9',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});