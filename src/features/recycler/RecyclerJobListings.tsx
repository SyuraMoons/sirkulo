import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Job {
  id: string;
  title: string;
  description: string;
  materials: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  payment: number;
  location: string;
  deadline: string;
  requesterName: string;
  requesterRating: number;
  urgency: 'Low' | 'Medium' | 'High';
}

const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Custom Tote Bag from Plastic Bottles',
    description: 'Create a durable tote bag using recycled plastic bottles. Client wants a specific design with their logo.',
    materials: ['Plastic Bottles', 'Fabric Dye', 'Thread'],
    difficulty: 'Medium',
    estimatedTime: '3-4 days',
    payment: 250000,
    location: 'Jakarta Selatan',
    deadline: '2024-08-15',
    requesterName: 'Sarah M.',
    requesterRating: 4.8,
    urgency: 'Medium',
  },
  {
    id: '2',
    title: 'Decorative Plant Pots from Tin Cans',
    description: 'Transform old tin cans into beautiful decorative plant pots for a cafe interior.',
    materials: ['Tin Cans', 'Paint', 'Rope'],
    difficulty: 'Easy',
    estimatedTime: '1-2 days',
    payment: 150000,
    location: 'Jakarta Pusat',
    deadline: '2024-08-10',
    requesterName: 'Green Cafe',
    requesterRating: 4.9,
    urgency: 'High',
  },
  {
    id: '3',
    title: 'Furniture Set from Cardboard',
    description: 'Design and create a complete furniture set for a temporary exhibition using cardboard materials.',
    materials: ['Cardboard', 'Glue', 'Paint'],
    difficulty: 'Hard',
    estimatedTime: '1-2 weeks',
    payment: 750000,
    location: 'Jakarta Barat',
    deadline: '2024-08-25',
    requesterName: 'Art Gallery XYZ',
    requesterRating: 4.7,
    urgency: 'Low',
  },
  {
    id: '4',
    title: 'Jewelry from Electronic Waste',
    description: 'Create unique jewelry pieces using components from old electronics.',
    materials: ['Circuit Boards', 'Wire', 'Beads'],
    difficulty: 'Medium',
    estimatedTime: '2-3 days',
    payment: 300000,
    location: 'Jakarta Timur',
    deadline: '2024-08-12',
    requesterName: 'Tech Boutique',
    requesterRating: 4.6,
    urgency: 'Medium',
  },
];

interface RecyclerJobListingsProps {
  onJobSelect?: (jobId: string) => void;
}

export default function RecyclerJobListings({ onJobSelect }: RecyclerJobListingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [sortBy, setSortBy] = useState<'payment' | 'deadline' | 'urgency'>('payment');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return COLORS.text.secondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Low': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'High': return '#F44336';
      default: return COLORS.text.secondary;
    }
  };

  const filteredJobs = SAMPLE_JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || job.difficulty === selectedFilter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'payment':
        return b.payment - a.payment;
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'urgency':
        const urgencyOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      default:
        return 0;
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Handcraft Jobs</Text>
      <Text style={styles.subtitle}>Find recycling projects that match your skills</Text>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.text.secondary}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['All', 'Easy', 'Medium', 'Hard'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setSelectedFilter(filter as any)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.sortButton}>
          <FontAwesome name="sort" size={16} color={COLORS.primary} />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Job Listings */}
      <ScrollView style={styles.jobsList} showsVerticalScrollIndicator={false}>
        {filteredJobs.map((job) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => onJobSelect?.(job.id)}
          >
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleContainer}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View style={styles.jobBadges}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(job.difficulty) }]}>
                    <Text style={styles.badgeText}>{job.difficulty}</Text>
                  </View>
                  <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) }]}>
                    <Text style={styles.badgeText}>{job.urgency}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.jobPayment}>Rp{job.payment.toLocaleString()}</Text>
            </View>

            <Text style={styles.jobDescription} numberOfLines={2}>
              {job.description}
            </Text>

            <View style={styles.materialsContainer}>
              <Text style={styles.materialsLabel}>Materials:</Text>
              <View style={styles.materialsList}>
                {job.materials.slice(0, 3).map((material, index) => (
                  <View key={index} style={styles.materialChip}>
                    <Text style={styles.materialText}>{material}</Text>
                  </View>
                ))}
                {job.materials.length > 3 && (
                  <Text style={styles.moreText}>+{job.materials.length - 3} more</Text>
                )}
              </View>
            </View>

            <View style={styles.jobFooter}>
              <View style={styles.jobInfo}>
                <View style={styles.infoItem}>
                  <FontAwesome name="clock-o" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.infoText}>{job.estimatedTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <FontAwesome name="map-marker" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.infoText}>{job.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <FontAwesome name="calendar" size={14} color={COLORS.text.secondary} />
                  <Text style={styles.infoText}>Due: {new Date(job.deadline).toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.requesterInfo}>
                <Text style={styles.requesterName}>{job.requesterName}</Text>
                <View style={styles.ratingContainer}>
                  <FontAwesome name="star" size={12} color="#FFC107" />
                  <Text style={styles.ratingText}>{job.requesterRating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredJobs.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="briefcase" size={48} color={COLORS.text.secondary} />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterScroll: {
    flex: 1,
    marginRight: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  jobsList: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  jobBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  jobPayment: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  jobDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  materialsContainer: {
    marginBottom: 16,
  },
  materialsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  materialsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  materialChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  materialText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  moreText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  jobFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  jobInfo: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 6,
  },
  requesterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requesterName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});