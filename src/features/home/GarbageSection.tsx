import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
  Modal,
  StyleSheet,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const CATEGORIES = ['All', 'Food Waste', 'Plastic Waste', 'Wood Waste'];

const MOCK_GARBAGE = [
  {
    id: '1',
    name: 'Plastic Bottle',
    image: require('@/assets/images/icon.png'),
    rating: 4.5,
    ratingCount: 10,
    quantity: '10 pcs',
    price: 'Rp2.000',
    type: 'Recycled',
    material: 'Plastic',
    verified: true,
  },
  {
    id: '2',
    name: 'Glass Bottle',
    image: require('@/assets/images/icon.png'),
    rating: 4.0,
    ratingCount: 8,
    quantity: '5 pcs',
    price: 'Rp5.000',
    type: 'Recycled',
    material: 'Glass',
    verified: true,
  },
];

export default function GarbageSection() {
  const [category, setCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const filteredGarbage =
    category === 'All' ? MOCK_GARBAGE : MOCK_GARBAGE.filter(item => item.material === category);

  return (
    <>
      <View style={styles.listHeaderRow}>
        <Text style={styles.listHeaderTitle}>Garbage</Text>
        <TouchableOpacity style={styles.categoryButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.categoryButtonText}>{category}</Text>
          <FontAwesome name="chevron-down" size={16} color="#386B5F" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <Pressable style={styles.seeAllBtn}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>
      <FlatList
        data={filteredGarbage}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardImageWrapper}>
              <Image source={item.image} style={styles.cardImage} resizeMode="contain" />
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <FontAwesome
                  key={i}
                  name={i < Math.round(item.rating) ? 'star' : 'star-o'}
                  size={16}
                  color="#FFD600"
                  style={{ marginRight: 1 }}
                />
              ))}
              <Text style={styles.ratingCount}>{item.ratingCount}</Text>
            </View>
            <Text style={styles.cardInfo}>
              {item.quantity} / <Text style={{ fontWeight: 'bold' }}>{item.price}</Text>
            </Text>
            <View style={styles.cardTagsRow}>
              <Text style={styles.cardTag}>{item.type}</Text>
              <Text style={styles.cardTag}>{item.material}</Text>
            </View>
            <View style={styles.cardFooterRow}>
              {item.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              <TouchableOpacity style={styles.addBtn}>
                <FontAwesome name="shopping-cart" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={styles.modalItem}
                onPress={() => {
                  setCategory(cat);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    cat === category && { fontWeight: 'bold', color: '#386B5F' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  listHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    flex: 1,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryButtonText: {
    color: '#386B5F',
    fontWeight: '700',
    fontSize: 16,
  },
  seeAllBtn: {
    padding: 4,
  },
  seeAllText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 14,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E6F3EC',
  },
  cardImageWrapper: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    height: 80,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ratingCount: {
    fontSize: 13,
    color: '#222',
    marginLeft: 4,
    fontWeight: '600',
  },
  cardInfo: {
    fontSize: 15,
    color: '#222',
    marginBottom: 2,
  },
  cardTagsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cardTag: {
    fontSize: 13,
    color: '#386B5F',
    marginRight: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: '#E6F3EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  verifiedText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#386B5F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'flex-start',
  },
  modalItem: {
    paddingVertical: 10,
    width: '100%',
  },
  modalItemText: {
    fontSize: 18,
    color: '#386B5F',
  },
});
