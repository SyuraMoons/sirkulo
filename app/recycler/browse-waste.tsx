import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface WasteListing {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  quantity: {
    amount: number;
    unit: string;
  };
  location: string;
  distance: number;
  price: number;
  isFree: boolean;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  listedBy: string;
  listedDate: string;
  urgency: 'Low' | 'Medium' | 'High';
  description: string;
  images: any[];
  verified: boolean;
  contactInfo: {
    phone: string;
    email: string;
    preferredContact: string;
  };
}

export default function BrowseWaste() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('distance');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<WasteListing | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Mock waste listings data
  const wasteListings: WasteListing[] = [
    {
      id: '1',
      title: 'Clean Plastic Bottles (PET)',
      category: 'Plastic',
      subcategory: 'PET Bottles',
      quantity: { amount: 150, unit: 'kg' },
      location: 'Jakarta Selatan',
      distance: 2.3,
      price: 8500,
      isFree: false,
      quality: 'Excellent',
      listedBy: 'EcoMart Supermarket',
      listedDate: '2024-07-24',
      urgency: 'Medium',
      description:
        'Clean, sorted PET bottles from our supermarket. Mostly water and beverage bottles in excellent condition.',
      images: [require('@/assets/images/plastic-chair.jpg')],
      verified: true,
      contactInfo: {
        phone: '+62 812 3456 7890',
        email: 'waste@ecomart.com',
        preferredContact: 'phone',
      },
    },
    {
      id: '2',
      title: 'Mixed Metal Scraps',
      category: 'Metal',
      subcategory: 'Mixed Metal',
      quantity: { amount: 85, unit: 'kg' },
      location: 'Jakarta Pusat',
      distance: 5.7,
      price: 0,
      isFree: true,
      quality: 'Good',
      listedBy: 'Auto Repair Shop',
      listedDate: '2024-07-23',
      urgency: 'High',
      description:
        'Various metal scraps from automotive repairs. Includes steel, aluminum, and some copper components.',
      images: [require('@/assets/images/icon.png')],
      verified: false,
      contactInfo: {
        phone: '+62 821 9876 5432',
        email: 'info@autorepair.com',
        preferredContact: 'phone',
      },
    },
    {
      id: '3',
      title: 'Office Paper Waste',
      category: 'Paper',
      subcategory: 'Office Paper',
      quantity: { amount: 200, unit: 'kg' },
      location: 'Jakarta Barat',
      distance: 8.2,
      price: 3500,
      isFree: false,
      quality: 'Good',
      listedBy: 'Corporate Office Building',
      listedDate: '2024-07-22',
      urgency: 'Low',
      description:
        'Mixed office paper including copy paper, documents, and cardboard. Well-sorted and clean.',
      images: [require('@/assets/images/icon.png')],
      verified: true,
      contactInfo: {
        phone: '+62 813 2468 1357',
        email: 'facilities@corpoffice.com',
        preferredContact: 'email',
      },
    },
    {
      id: '4',
      title: 'Electronic Components',
      category: 'Electronic',
      subcategory: 'Circuit Boards',
      quantity: { amount: 25, unit: 'kg' },
      location: 'Jakarta Timur',
      distance: 12.1,
      price: 45000,
      isFree: false,
      quality: 'Fair',
      listedBy: 'Electronics Store',
      listedDate: '2024-07-21',
      urgency: 'Medium',
      description:
        'Old circuit boards, cables, and electronic components from repairs and upgrades.',
      images: [require('@/assets/images/icon.png')],
      verified: true,
      contactInfo: {
        phone: '+62 814 7531 9642',
        email: 'waste@electrostore.com',
        preferredContact: 'phone',
      },
    },
    {
      id: '5',
      title: 'Cardboard Boxes',
      category: 'Paper',
      subcategory: 'Cardboard',
      quantity: { amount: 120, unit: 'kg' },
      location: 'Jakarta Selatan',
      distance: 3.8,
      price: 0,
      isFree: true,
      quality: 'Excellent',
      listedBy: 'Logistics Company',
      listedDate: '2024-07-24',
      urgency: 'High',
      description:
        'Clean cardboard boxes from shipping operations. Various sizes, all in excellent condition.',
      images: [require('@/assets/images/icon.png')],
      verified: true,
      contactInfo: {
        phone: '+62 815 8642 9753',
        email: 'ops@logistics.com',
        preferredContact: 'phone',
      },
    },
  ];

  const categories = ['All', 'Plastic', 'Metal', 'Paper', 'Electronic', 'Glass'];
  const sortOptions = ['distance', 'price', 'quantity', 'date'];

  const filteredWaste = wasteListings
    .filter(waste => {
      const matchesSearch =
        waste.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        waste.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || waste.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'distance':
          return a.distance - b.distance;
        case 'price':
          return a.price - b.price;
        case 'quantity':
          return b.quantity.amount - a.quantity.amount;
        case 'date':
          return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        default:
          return 0;
      }
    });

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent':
        return COLORS.success;
      case 'Good':
        return COLORS.info;
      case 'Fair':
        return COLORS.warning;
      case 'Poor':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return COLORS.error;
      case 'Medium':
        return COLORS.warning;
      case 'Low':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderWasteCard = (waste: WasteListing) => (
    <TouchableOpacity
      key={waste.id}
      style={styles.wasteCard}
      onPress={() => {
        setSelectedWaste(waste);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.wasteHeader}>
        <View style={styles.wasteInfo}>
          <Text style={styles.wasteTitle}>{waste.title}</Text>
          <View style={styles.wasteMeta}>
            <Text style={styles.wasteCategory}>{waste.category}</Text>
            <Text style={styles.wasteSeparator}>•</Text>
            <Text style={styles.wasteLocation}>{waste.location}</Text>
            <Text style={styles.wasteSeparator}>•</Text>
            <Text style={styles.wasteDistance}>{waste.distance}km</Text>
          </View>
        </View>
        <View style={styles.wastePrice}>
          {waste.isFree ? (
            <Text style={styles.freeText}>FREE</Text>
          ) : (
            <Text style={styles.priceText}>Rp{waste.price.toLocaleString()}</Text>
          )}
        </View>
      </View>

      <Text style={styles.wasteDescription} numberOfLines={2}>
        {waste.description}
      </Text>

      <View style={styles.wasteDetails}>
        <View style={styles.quantityInfo}>
          <FontAwesome name="balance-scale" size={14} color={COLORS.text.secondary} />
          <Text style={styles.quantityText}>
            {waste.quantity.amount} {waste.quantity.unit}
          </Text>
        </View>

        <View style={styles.qualityBadge}>
          <View style={[styles.qualityDot, { backgroundColor: getQualityColor(waste.quality) }]} />
          <Text style={styles.qualityText}>{waste.quality}</Text>
        </View>

        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(waste.urgency) }]}>
          <Text style={styles.urgencyText}>{waste.urgency}</Text>
        </View>
      </View>

      <View style={styles.wasteFooter}>
        <View style={styles.listerInfo}>
          <FontAwesome name="user" size={12} color={COLORS.text.secondary} />
          <Text style={styles.listerName}>{waste.listedBy}</Text>
          {waste.verified && <FontAwesome name="check-circle" size={12} color={COLORS.success} />}
        </View>
        <Text style={styles.listedDate}>{new Date(waste.listedDate).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Waste</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
          <FontAwesome name="filter" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search waste materials..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilter}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.activeCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortChip, selectedSort === option && styles.activeSortChip]}
                  onPress={() => setSelectedSort(option)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      selectedSort === option && styles.activeSortChipText,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredWaste.length} waste listings found</Text>
      </View>

      {/* Waste Listings */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredWaste.map(renderWasteCard)}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedWaste && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalBackBtn}
              >
                <FontAwesome name="arrow-left" size={20} color="#386B5F" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Waste Details</Text>
              <TouchableOpacity style={styles.modalShareBtn}>
                <FontAwesome name="share" size={20} color="#386B5F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalWasteHeader}>
                <Text style={styles.modalWasteTitle}>{selectedWaste.title}</Text>
                <Text style={styles.modalWasteCategory}>
                  {selectedWaste.category} • {selectedWaste.subcategory}
                </Text>
              </View>

              <View style={styles.modalWasteInfo}>
                <View style={styles.modalInfoRow}>
                  <FontAwesome name="balance-scale" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.modalInfoText}>
                    {selectedWaste.quantity.amount} {selectedWaste.quantity.unit}
                  </Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <FontAwesome name="map-marker" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.modalInfoText}>
                    {selectedWaste.location} ({selectedWaste.distance}km away)
                  </Text>
                </View>

                <View style={styles.modalInfoRow}>
                  <FontAwesome name="money" size={16} color={COLORS.text.secondary} />
                  <Text style={styles.modalInfoText}>
                    {selectedWaste.isFree ? 'FREE' : `Rp${selectedWaste.price.toLocaleString()}`}
                  </Text>
                </View>
              </View>

              <View style={styles.modalDescription}>
                <Text style={styles.modalSectionTitle}>Description</Text>
                <Text style={styles.modalDescriptionText}>{selectedWaste.description}</Text>
              </View>

              <View style={styles.modalListerInfo}>
                <Text style={styles.modalSectionTitle}>Listed By</Text>
                <View style={styles.modalListerCard}>
                  <View style={styles.modalListerDetails}>
                    <Text style={styles.modalListerName}>{selectedWaste.listedBy}</Text>
                    {selectedWaste.verified && (
                      <View style={styles.modalVerifiedBadge}>
                        <FontAwesome name="check-circle" size={14} color={COLORS.success} />
                        <Text style={styles.modalVerifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modalListedDate}>
                    Listed on {new Date(selectedWaste.listedDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton}>
                  <FontAwesome name="phone" size={16} color="#fff" />
                  <Text style={styles.modalActionText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton}>
                  <FontAwesome name="envelope" size={16} color="#fff" />
                  <Text style={styles.modalActionText}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton}>
                  <FontAwesome name="comment" size={16} color="#fff" />
                  <Text style={styles.modalActionText}>Message</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
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
  filterBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#222',
  },
  filtersContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryFilter: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 12,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeSortChip: {
    backgroundColor: COLORS.primary,
  },
  sortChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeSortChipText: {
    color: '#fff',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  wasteCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  wasteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  wasteInfo: {
    flex: 1,
  },
  wasteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  wasteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wasteCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  wasteSeparator: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  wasteLocation: {
    fontSize: 12,
    color: '#666',
  },
  wasteDistance: {
    fontSize: 12,
    color: '#666',
  },
  wastePrice: {
    alignItems: 'flex-end',
  },
  freeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.success,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  wasteDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  wasteDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  qualityText: {
    fontSize: 12,
    color: '#666',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgencyText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  wasteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listerName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 4,
  },
  listedDate: {
    fontSize: 12,
    color: '#999',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  modalBackBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  modalShareBtn: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalWasteHeader: {
    marginBottom: 16,
  },
  modalWasteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalWasteCategory: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalWasteInfo: {
    marginBottom: 16,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  modalDescription: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalListerInfo: {
    marginBottom: 24,
  },
  modalListerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  modalListerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalListerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
  },
  modalVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalVerifiedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
  },
  modalListedDate: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
