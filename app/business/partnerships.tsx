import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Partner {
  id: string;
  name: string;
  type: 'Recycler' | 'Business' | 'Manufacturer';
  rating: number;
  reviewCount: number;
  specialties: string[];
  location: string;
  verified: boolean;
  avatar: any;
  description: string;
  collaborations: number;
  responseTime: string;
  status: 'Active' | 'Pending' | 'Inactive';
}

interface PartnershipRequest {
  id: string;
  partnerName: string;
  type: string;
  message: string;
  date: string;
  status: 'Pending' | 'Accepted' | 'Declined';
}

export default function BusinessPartnerships() {
  const [activeTab, setActiveTab] = useState('partners');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Mock data
  const partners: Partner[] = [
    {
      id: '1',
      name: 'EcoRecycle Solutions',
      type: 'Recycler',
      rating: 4.8,
      reviewCount: 156,
      specialties: ['Plastic Processing', 'Metal Recovery', 'Electronic Waste'],
      location: 'Jakarta Selatan',
      verified: true,
      avatar: require('@/assets/images/icon.png'),
      description:
        'Leading recycling company specializing in plastic and electronic waste processing.',
      collaborations: 23,
      responseTime: '< 2 hours',
      status: 'Active',
    },
    {
      id: '2',
      name: 'GreenTech Manufacturing',
      type: 'Manufacturer',
      rating: 4.6,
      reviewCount: 89,
      specialties: ['Sustainable Products', 'Circular Design', 'Eco Materials'],
      location: 'Jakarta Pusat',
      verified: true,
      avatar: require('@/assets/images/icon.png'),
      description: 'Innovative manufacturer creating products from recycled materials.',
      collaborations: 15,
      responseTime: '< 4 hours',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Urban Waste Collectors',
      type: 'Business',
      rating: 4.9,
      reviewCount: 234,
      specialties: ['Waste Collection', 'Sorting Services', 'Logistics'],
      location: 'Jakarta Timur',
      verified: true,
      avatar: require('@/assets/images/icon.png'),
      description: 'Professional waste collection and sorting services for businesses.',
      collaborations: 45,
      responseTime: '< 1 hour',
      status: 'Active',
    },
    {
      id: '4',
      name: 'Circular Design Studio',
      type: 'Business',
      rating: 4.7,
      reviewCount: 67,
      specialties: ['Product Design', 'Sustainability Consulting', 'Innovation'],
      location: 'Jakarta Barat',
      verified: false,
      avatar: require('@/assets/images/icon.png'),
      description:
        'Design studio focused on circular economy principles and sustainable innovation.',
      collaborations: 8,
      responseTime: '< 6 hours',
      status: 'Pending',
    },
  ];

  const partnershipRequests: PartnershipRequest[] = [
    {
      id: '1',
      partnerName: 'Sustainable Packaging Co.',
      type: 'Collaboration Request',
      message:
        'We would like to partner with you for sustainable packaging solutions using your recycled materials.',
      date: '2024-07-20',
      status: 'Pending',
    },
    {
      id: '2',
      partnerName: 'EcoFurniture Makers',
      type: 'Supply Partnership',
      message:
        'Looking for a reliable supplier of recycled wood and plastic materials for furniture production.',
      date: '2024-07-18',
      status: 'Pending',
    },
    {
      id: '3',
      partnerName: 'Green Building Solutions',
      type: 'Joint Venture',
      message: 'Interested in creating a joint venture for sustainable construction materials.',
      date: '2024-07-15',
      status: 'Accepted',
    },
  ];

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'All' || partner.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderPartnerCard = (partner: Partner) => (
    <TouchableOpacity
      key={partner.id}
      style={styles.partnerCard}
      onPress={() => {
        setSelectedPartner(partner);
        setModalVisible(true);
      }}
    >
      <View style={styles.partnerHeader}>
        <Image source={partner.avatar} style={styles.partnerAvatar} />
        <View style={styles.partnerInfo}>
          <View style={styles.partnerNameRow}>
            <Text style={styles.partnerName}>{partner.name}</Text>
            {partner.verified && (
              <FontAwesome name="check-circle" size={16} color={COLORS.success} />
            )}
          </View>
          <Text style={styles.partnerType}>{partner.type}</Text>
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="#FFD600" />
            <Text style={styles.ratingText}>
              {partner.rating} ({partner.reviewCount})
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(partner.status) }]}>
          <Text style={styles.statusText}>{partner.status}</Text>
        </View>
      </View>

      <Text style={styles.partnerDescription} numberOfLines={2}>
        {partner.description}
      </Text>

      <View style={styles.specialtiesContainer}>
        {partner.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyChip}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {partner.specialties.length > 3 && (
          <Text style={styles.moreText}>+{partner.specialties.length - 3} more</Text>
        )}
      </View>

      <View style={styles.partnerStats}>
        <View style={styles.statItem}>
          <FontAwesome name="handshake-o" size={14} color={COLORS.primary} />
          <Text style={styles.statText}>{partner.collaborations} projects</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="clock-o" size={14} color={COLORS.primary} />
          <Text style={styles.statText}>{partner.responseTime}</Text>
        </View>
        <View style={styles.statItem}>
          <FontAwesome name="map-marker" size={14} color={COLORS.primary} />
          <Text style={styles.statText}>{partner.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRequestCard = (request: PartnershipRequest) => (
    <View key={request.id} style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestPartnerName}>{request.partnerName}</Text>
          <Text style={styles.requestType}>{request.type}</Text>
          <Text style={styles.requestDate}>{new Date(request.date).toLocaleDateString()}</Text>
        </View>
        <View
          style={[
            styles.requestStatusBadge,
            { backgroundColor: getRequestStatusColor(request.status) },
          ]}
        >
          <Text style={styles.requestStatusText}>{request.status}</Text>
        </View>
      </View>

      <Text style={styles.requestMessage} numberOfLines={3}>
        {request.message}
      </Text>

      {request.status === 'Pending' && (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.acceptButton}>
            <FontAwesome name="check" size={16} color="#fff" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.declineButton}>
            <FontAwesome name="times" size={16} color="#fff" />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return COLORS.success;
      case 'Pending':
        return COLORS.warning;
      case 'Inactive':
        return COLORS.text.disabled;
      default:
        return COLORS.text.secondary;
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return COLORS.success;
      case 'Pending':
        return COLORS.warning;
      case 'Declined':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partnerships</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => console.log('Add Partner - Feature coming soon')}
        >
          <FontAwesome name="plus" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'partners' && styles.activeTab]}
          onPress={() => setActiveTab('partners')}
        >
          <Text style={[styles.tabText, activeTab === 'partners' && styles.activeTabText]}>
            Partners ({partners.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({partnershipRequests.filter(r => r.status === 'Pending').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'partners' ? (
          <>
            {/* Search and Filter */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <FontAwesome name="search" size={16} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#666"
                />
              </View>
            </View>

            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['All', 'Recycler', 'Business', 'Manufacturer'].map(filter => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, filterType === filter && styles.activeFilterChip]}
                    onPress={() => setFilterType(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filterType === filter && styles.activeFilterChipText,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Partners List */}
            <View style={styles.partnersList}>{filteredPartners.map(renderPartnerCard)}</View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome name="search" size={20} color={COLORS.primary} />
                  <Text style={styles.actionText}>Find Partners</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome name="handshake-o" size={20} color={COLORS.primary} />
                  <Text style={styles.actionText}>Send Invite</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome name="users" size={20} color={COLORS.primary} />
                  <Text style={styles.actionText}>Join Network</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome name="bar-chart" size={20} color={COLORS.primary} />
                  <Text style={styles.actionText}>Analytics</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Partnership Requests */}
            <View style={styles.requestsList}>
              <Text style={styles.sectionTitle}>Partnership Requests</Text>
              {partnershipRequests.map(renderRequestCard)}
            </View>
          </>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Partner Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedPartner && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackBtn}>
                <FontAwesome name="arrow-left" size={20} color="#386B5F" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Partner Details</Text>
              <TouchableOpacity style={styles.modalShareBtn}>
                <FontAwesome name="share" size={20} color="#386B5F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalPartnerHeader}>
                <Image source={selectedPartner.avatar} style={styles.modalPartnerAvatar} />
                <View style={styles.modalPartnerInfo}>
                  <Text style={styles.modalPartnerName}>{selectedPartner.name}</Text>
                  <Text style={styles.modalPartnerType}>{selectedPartner.type}</Text>
                  <View style={styles.modalRatingRow}>
                    <FontAwesome name="star" size={16} color="#FFD600" />
                    <Text style={styles.modalRatingText}>
                      {selectedPartner.rating} ({selectedPartner.reviewCount} reviews)
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.modalDescription}>{selectedPartner.description}</Text>

              <View style={styles.modalSpecialties}>
                <Text style={styles.modalSectionTitle}>Specialties</Text>
                <View style={styles.modalSpecialtiesList}>
                  {selectedPartner.specialties.map((specialty, index) => (
                    <View key={index} style={styles.modalSpecialtyChip}>
                      <Text style={styles.modalSpecialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton}>
                  <FontAwesome name="comment" size={16} color="#fff" />
                  <Text style={styles.modalActionText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton}>
                  <FontAwesome name="handshake-o" size={16} color="#fff" />
                  <Text style={styles.modalActionText}>Partner Request</Text>
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
  addBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#fff',
  },
  partnersList: {
    marginBottom: 24,
  },
  partnerCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginRight: 8,
  },
  partnerType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  partnerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  specialtyChip: {
    backgroundColor: '#E6F3EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  partnerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
  },
  requestsList: {
    marginBottom: 24,
  },
  requestCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestPartnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  requestType: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#666',
  },
  requestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  requestMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
  },
  declineButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 6,
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
  modalPartnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPartnerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  modalPartnerInfo: {
    flex: 1,
  },
  modalPartnerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalPartnerType: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  modalRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalSpecialties: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  modalSpecialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalSpecialtyChip: {
    backgroundColor: '#E6F3EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  modalSpecialtyText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
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
