import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCart } from '@/src/context/CartContext';
import { MOCK_CRAFTS, CraftItem } from '@/src/constants/crafts';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addItem, isItemInCart, getItemQuantity } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Find the product by ID
  const product = MOCK_CRAFTS.find(item => item.id === id);

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mock additional product details for Plastic Chair
  const productDetails = {
    description: 'This eco-friendly plastic chair is made from 100% recycled plastic bottles. Perfect for both indoor and outdoor use, it combines sustainability with modern design. Lightweight yet durable, this chair supports up to 120kg and is weather-resistant.',
    specifications: [
      { label: 'Material', value: '100% Recycled Plastic' },
      { label: 'Dimensions', value: '45cm W × 50cm D × 80cm H' },
      { label: 'Weight', value: '3.2 kg' },
      { label: 'Weight Capacity', value: '120 kg' },
      { label: 'Color', value: 'Charcoal Gray' },
      { label: 'Assembly', value: 'No assembly required' },
    ],
    features: [
      'Made from 25+ recycled plastic bottles',
      'UV-resistant for outdoor use',
      'Easy to clean and maintain',
      'Stackable design for space saving',
      'Non-slip feet for stability',
      'Ergonomic backrest design',
    ],
    sustainability: [
      'Prevents 25 plastic bottles from landfill',
      'Reduces CO2 emissions by 2.3kg',
      'Fully recyclable at end of life',
      'Supports circular economy principles',
    ],
    images: [
      product.image,
      product.image, // Mock multiple images
      product.image,
    ],
    reviews: [
      {
        id: '1',
        name: 'Sarah M.',
        rating: 5,
        comment: 'Love this chair! Very comfortable and knowing it\'s made from recycled materials makes me feel good about the purchase.',
        date: '2 weeks ago',
      },
      {
        id: '2',
        name: 'Ahmad R.',
        rating: 4,
        comment: 'Great quality and very sturdy. Perfect for my balcony garden setup.',
        date: '1 month ago',
      },
    ],
  };

  const handleAddToCart = () => {
    addItem(product);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FontAwesome
        key={i}
        name={i < Math.round(rating) ? 'star' : 'star-o'}
        size={18}
        color="#FFD600"
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <FontAwesome name="share-alt" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Product Images */}
      <View style={styles.imageSection}>
        <Image source={productDetails.images[selectedImageIndex]} style={styles.mainImage} />
        <View style={styles.imageIndicators}>
          {productDetails.images.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                selectedImageIndex === index && styles.activeIndicator,
              ]}
              onPress={() => setSelectedImageIndex(index)}
            />
          ))}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{product.category}</Text>
        </View>
        
        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.ratingRow}>
          {renderStars(product.rating)}
          <Text style={styles.ratingText}>
            {product.rating} ({product.ratingCount} reviews)
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.stock}>Stock: {product.stock} available</Text>
        </View>

        <View style={styles.sellerRow}>
          <FontAwesome name="store" size={16} color="#386B5F" />
          <Text style={styles.sellerText}>Sold by {product.seller}</Text>
          <View style={styles.verifiedBadge}>
            <FontAwesome name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{productDetails.description}</Text>
      </View>

      {/* Specifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        {productDetails.specifications.map((spec, index) => (
          <View key={index} style={styles.specRow}>
            <Text style={styles.specLabel}>{spec.label}</Text>
            <Text style={styles.specValue}>{spec.value}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Features</Text>
        {productDetails.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <FontAwesome name="check" size={14} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Sustainability Impact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 Environmental Impact</Text>
        {productDetails.sustainability.map((impact, index) => (
          <View key={index} style={styles.impactRow}>
            <FontAwesome name="leaf" size={14} color="#4CAF50" />
            <Text style={styles.impactText}>{impact}</Text>
          </View>
        ))}
      </View>

      {/* Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {productDetails.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.name}</Text>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <View style={styles.reviewRating}>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />

      {/* Floating Add to Cart Button */}
      <View style={styles.floatingButton}>
        <TouchableOpacity
          style={[styles.addToCartBtn, isItemInCart(product.id) && styles.addToCartBtnInCart]}
          onPress={handleAddToCart}
        >
          <FontAwesome name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {isItemInCart(product.id) 
              ? `In Cart (${getItemQuantity(product.id)})` 
              : 'Add to Cart'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#386B5F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  shareBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
  },
  productInfo: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#E6F3EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 12,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: '#386B5F',
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  specValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    padding: 4,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#386B5F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addToCartBtnInCart: {
    backgroundColor: '#2D5A4F',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});