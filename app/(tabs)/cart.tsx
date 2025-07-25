import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useCart, formatPrice, CartItem } from '@/src/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (id: string, change: number) => {
    const currentItem = state.items.find(item => item.id === id);
    if (currentItem) {
      const newQuantity = currentItem.quantity + change;
      if (newQuantity > 0) {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const handleRemoveItem = (id: string, name: string) => {
    Alert.alert('Remove Item', `Remove ${name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearCart },
    ]);
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImageWrapper}>
        <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
      </View>

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <Text style={styles.itemSeller}>by {item.seller}</Text>
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item.id, -1)}
          >
            <FontAwesome name="minus" size={14} color="#386B5F" />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item.id, 1)}
          >
            <FontAwesome name="plus" size={14} color="#386B5F" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveItem(item.id, item.name)}
        >
          <FontAwesome name="trash" size={16} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (state.items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContent}>
          <View style={styles.iconContainer}>
            <FontAwesome name="shopping-cart" size={64} color="#E6F3EC" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse our eco-friendly products and add something to your cart
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={() => router.push('/')}>
            <Text style={styles.startButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={state.items}
        keyExtractor={item => item.id}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Items:</Text>
            <Text style={styles.totalValue}>{state.totalItems}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>{formatPrice(state.totalPrice)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.checkoutBtn}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E6F3EC',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  clearText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6F3EC',
    overflow: 'hidden',
  },
  itemImageWrapper: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 8,
    minWidth: 0,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: '#386B5F',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  itemSeller: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 80,
    flexShrink: 0,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3EC',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6F3EC',
    backgroundColor: '#fff',
  },
  totalSection: {
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#386B5F',
  },
  checkoutBtn: {
    backgroundColor: '#386B5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // Empty state styles
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#386B5F',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  startButton: {
    backgroundColor: '#386B5F',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
