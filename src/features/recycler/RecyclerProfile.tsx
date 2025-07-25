import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  projectTitle: string;
  date: string;
  verified: boolean;
}

interface Project {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completedDate?: string;
  rating?: number;
  payment: number;
  materials: string[];
}

const SAMPLE_BADGES: Badge[] = [
  {
    id: '1',
    name: 'Master Craftsman',
    description: 'Complete 50+ projects with 4.5+ rating',
    icon: 'trophy',
    earned: true,
    earnedDate: '2024-06-15',
    rarity: 'Epic',
  },
  {
    id: '2',
    name: 'Eco Warrior',
    description: 'Recycle 100kg+ of waste materials',
    icon: 'leaf',
    earned: true,
    earnedDate: '2024-05-20',
    rarity: 'Rare',
  },
  {
    id: '3',
    name: 'Speed Demon',
    description: 'Complete 10 projects ahead of deadline',
    icon: 'bolt',
    earned: true,
    earnedDate: '2024-07-01',
    rarity: 'Rare',
  },
  {
    id: '4',
    name: 'Innovation King',
    description: 'Create 5 unique designs',
    icon: 'lightbulb-o',
    earned: false,
    rarity: 'Epic',
  },
  {
    id: '5',
    name: 'Legend',
    description: 'Achieve 100+ completed projects',
    icon: 'star',
    earned: false,
    rarity: 'Legendary',
  },
];

const SAMPLE_REVIEWS: Review[] = [
  {
    id: '1',
    customerName: 'Sarah M.',
    rating: 5,
    comment: 'Absolutely amazing work! The tote bag exceeded my expectations. Beautiful craftsmanship and delivered on time.',
    projectTitle: 'Custom Tote Bag from Plastic Bottles',
    date: '2024-07-20',
    verified: true,
  },
  {
    id: '2',
    customerName: 'Green Cafe',
    rating: 5,
    comment: 'Perfect plant pots for our cafe! Customers love them and they fit our eco-friendly theme perfectly.',
    projectTitle: 'Decorative Plant Pots from Tin Cans',
    date: '2024-07-18',
    verified: true,
  },
  {
    id: '3',
    customerName: 'Tech Boutique',
    rating: 4,
    comment: 'Creative jewelry designs! Minor delay in delivery but quality was excellent.',
    projectTitle: 'Jewelry from Electronic Waste',
    date: '2024-07-15',
    verified: true,
  },
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Custom Tote Bag from Plastic Bottles',
    status: 'Completed',
    completedDate: '2024-07-20',
    rating: 5,
    payment: 250000,
    materials: ['Plastic Bottles', 'Fabric Dye', 'Thread'],
  },
  {
    id: '2',
    title: 'Decorative Plant Pots from Tin Cans',
    status: 'Completed',
    completedDate: '2024-07-18',
    rating: 5,
    payment: 150000,
    materials: ['Tin Cans', 'Paint', 'Rope'],
  },
  {
    id: '3',
    title: 'Jewelry from Electronic Waste',
    status: 'In Progress',
    payment: 300000,
    materials: ['Circuit Boards', 'Wire', 'Beads'],
  },
];

export default function RecyclerProfile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'reviews' | 'projects'>('overview');

  const completedProjects = SAMPLE_PROJECTS.filter(p => p.status === 'Completed');
  const averageRating = completedProjects.reduce((sum, p) => sum + (p.rating || 0), 0) / completedProjects.length;
  const totalEarnings = completedProjects.reduce((sum, p) => sum + p.payment, 0);
  const earnedBadges = SAMPLE_BADGES.filter(b => b.earned);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#9CA3AF';
      case 'Rare': return '#3B82F6';
      case 'Epic': return '#8B5CF6';
      case 'Legendary': return '#F59E0B';
      default: return COLORS.text.secondary;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome
        key={i}
        name={i < rating ? 'star' : 'star-o'}
        size={14}
        color="#FFC107"
      />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="user" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>Alex Chen</Text>
        <Text style={styles.title}>Master Recycler</Text>
        <Text style={styles.joinDate}>Member since March 2024</Text>
        
        {/* Reputation Level */}
        <View style={styles.reputationContainer}>
          <View style={styles.reputationBadge}>
            <FontAwesome name="shield" size={16} color="#FFC107" />
            <Text style={styles.reputationLevel}>Level 8</Text>
          </View>
          <Text style={styles.reputationPoints}>2,450 Reputation Points</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedProjects.length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{earnedBadges.length}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>On Time</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'badges', label: 'Badges' },
          { key: 'reviews', label: 'Reviews' },
          { key: 'projects', label: 'Projects' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && (
          <View>
            {/* Rating Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rating Summary</Text>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingLeft}>
                  <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
                  <View style={styles.starsContainer}>
                    {renderStars(Math.round(averageRating))}
                  </View>
                  <Text style={styles.ratingCount}>Based on {SAMPLE_REVIEWS.length} reviews</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = SAMPLE_REVIEWS.filter(r => r.rating === star).length;
                    const percentage = (count / SAMPLE_REVIEWS.length) * 100;
                    return (
                      <View key={star} style={styles.ratingBar}>
                        <Text style={styles.ratingBarLabel}>{star}</Text>
                        <View style={styles.ratingBarTrack}>
                          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.ratingBarCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Recent Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <View style={styles.achievementsList}>
                {earnedBadges.slice(0, 3).map((badge) => (
                  <View key={badge.id} style={styles.achievementItem}>
                    <View style={[styles.badgeIcon, { backgroundColor: getRarityColor(badge.rarity) }]}>
                      <FontAwesome name={badge.icon as any} size={20} color="#fff" />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{badge.name}</Text>
                      <Text style={styles.achievementDate}>
                        Earned {new Date(badge.earnedDate!).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Dashboard Access */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dashboard Access</Text>
              <View style={styles.dashboardGrid}>
                <TouchableOpacity style={styles.dashboardCard}>
                  <FontAwesome name="bar-chart" size={24} color={COLORS.primary} />
                  <Text style={styles.dashboardCardTitle}>Analytics</Text>
                  <Text style={styles.dashboardCardDesc}>View performance metrics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dashboardCard}>
                  <FontAwesome name="dollar" size={24} color={COLORS.primary} />
                  <Text style={styles.dashboardCardTitle}>Earnings</Text>
                  <Text style={styles.dashboardCardDesc}>Track your income</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dashboardCard}>
                  <FontAwesome name="calendar" size={24} color={COLORS.primary} />
                  <Text style={styles.dashboardCardTitle}>Schedule</Text>
                  <Text style={styles.dashboardCardDesc}>Manage your projects</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dashboardCard}>
                  <FontAwesome name="cog" size={24} color={COLORS.primary} />
                  <Text style={styles.dashboardCardTitle}>Settings</Text>
                  <Text style={styles.dashboardCardDesc}>Configure preferences</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
          <View style={styles.badgesGrid}>
            {SAMPLE_BADGES.map((badge) => (
              <View key={badge.id} style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}>
                <View style={[
                  styles.badgeIconLarge,
                  { backgroundColor: badge.earned ? getRarityColor(badge.rarity) : '#E5E7EB' }
                ]}>
                  <FontAwesome 
                    name={badge.icon as any} 
                    size={32} 
                    color={badge.earned ? '#fff' : '#9CA3AF'} 
                  />
                </View>
                <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDescription, !badge.earned && styles.badgeDescriptionLocked]}>
                  {badge.description}
                </Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(badge.rarity) }]}>
                  <Text style={styles.rarityText}>{badge.rarity}</Text>
                </View>
                {badge.earned && badge.earnedDate && (
                  <Text style={styles.earnedDate}>
                    Earned {new Date(badge.earnedDate).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View>
            {SAMPLE_REVIEWS.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.customerName}</Text>
                    {review.verified && (
                      <FontAwesome name="check-circle" size={14} color="#10B981" />
                    )}
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewProject}>{review.projectTitle}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
                <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'projects' && (
          <View>
            {SAMPLE_PROJECTS.map((project) => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    project.status === 'Completed' && styles.statusCompleted,
                    project.status === 'In Progress' && styles.statusInProgress,
                    project.status === 'Pending' && styles.statusPending,
                  ]}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
                
                <View style={styles.projectMaterials}>
                  {project.materials.map((material, index) => (
                    <View key={index} style={styles.materialTag}>
                      <Text style={styles.materialTagText}>{material}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.projectFooter}>
                  <Text style={styles.projectPayment}>Rp{project.payment.toLocaleString()}</Text>
                  {project.rating && (
                    <View style={styles.projectRating}>
                      {renderStars(project.rating)}
                    </View>
                  )}
                  {project.completedDate && (
                    <Text style={styles.projectDate}>
                      Completed {new Date(project.completedDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.surface,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  reputationContainer: {
    alignItems: 'center',
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  reputationLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 6,
  },
  reputationPoints: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLeft: {
    alignItems: 'center',
    marginRight: 24,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  ratingBars: {
    flex: 1,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    width: 12,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 4,
  },
  ratingBarCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    width: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: '48%',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  dashboardCardDesc: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeCardLocked: {
    opacity: 0.6,
  },
  badgeIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeNameLocked: {
    color: COLORS.text.secondary,
  },
  badgeDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescriptionLocked: {
    color: '#9CA3AF',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  rarityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  earnedDate: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  reviewCard: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewProject: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  projectCard: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusInProgress: {
    backgroundColor: '#FEF3C7',
  },
  statusPending: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  projectMaterials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  materialTag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  materialTagText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectPayment: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  projectRating: {
    flexDirection: 'row',
  },
  projectDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});