import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  earned: boolean;
  progress: { current: number; target: number };
  earnedDate?: string;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  rating: number;
  projectsCompleted: number;
  joinDate: string;
}

interface Project {
  id: string;
  title: string;
  status: 'Completed' | 'In Progress' | 'Planning';
  completedDate?: string;
  impactMetrics: {
    co2Reduced: number;
    materialsRecycled: number;
  };
  partnersInvolved: number;
}

const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Carbon Saver',
    description: 'Reduced 1000kg CO2',
    category: 'environmental',
    icon: 'leaf',
    earned: true,
    progress: { current: 1250, target: 1000 },
    earnedDate: '2024-06-15',
  },
  {
    id: '2',
    title: 'Recycling Champion',
    description: 'Processed 2500kg materials',
    category: 'efficiency',
    icon: 'trophy',
    earned: true,
    progress: { current: 2847, target: 2500 },
    earnedDate: '2024-07-01',
  },
  {
    id: '3',
    title: 'Innovation Leader',
    description: 'Complete 10 projects',
    category: 'innovation',
    icon: 'lightbulb-o',
    earned: false,
    progress: { current: 8, target: 10 },
  },
];

const SAMPLE_PARTNERS: Partner[] = [
  {
    id: '1',
    name: 'EcoRecycle Solutions',
    type: 'Recycling Partner',
    rating: 4.8,
    projectsCompleted: 5,
    joinDate: '2024-03-15',
  },
  {
    id: '2',
    name: 'Green Materials Co.',
    type: 'Supplier',
    rating: 4.9,
    projectsCompleted: 3,
    joinDate: '2024-04-20',
  },
  {
    id: '3',
    name: 'Sustainable Logistics',
    type: 'Logistics Partner',
    rating: 4.7,
    projectsCompleted: 7,
    joinDate: '2024-02-10',
  },
];

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Plastic Bottle to Textile Initiative',
    status: 'Completed',
    completedDate: '2024-07-20',
    impactMetrics: {
      co2Reduced: 450,
      materialsRecycled: 1200,
    },
    partnersInvolved: 3,
  },
  {
    id: '2',
    title: 'Electronic Waste Recovery Program',
    status: 'In Progress',
    impactMetrics: {
      co2Reduced: 200,
      materialsRecycled: 800,
    },
    partnersInvolved: 2,
  },
  {
    id: '3',
    title: 'Community Composting Network',
    status: 'Planning',
    impactMetrics: {
      co2Reduced: 0,
      materialsRecycled: 0,
    },
    partnersInvolved: 1,
  },
];

export default function BusinessProfile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'partners' | 'projects'>(
    'overview'
  );

  // Calculate stats
  const completedProjects = SAMPLE_PROJECTS.filter(p => p.status === 'Completed');
  const totalCO2Reduced = SAMPLE_PROJECTS.reduce((sum, p) => sum + p.impactMetrics.co2Reduced, 0);
  const totalMaterialsRecycled = SAMPLE_PROJECTS.reduce(
    (sum, p) => sum + p.impactMetrics.materialsRecycled,
    0
  );
  const earnedAchievements = SAMPLE_ACHIEVEMENTS.filter(a => a.earned);
  const averagePartnerRating =
    SAMPLE_PARTNERS.reduce((sum, p) => sum + p.rating, 0) / SAMPLE_PARTNERS.length;

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out EcoTech Solutions on Sirkulo! We've reduced ${totalCO2Reduced}kg of CO2 and recycled ${totalMaterialsRecycled}kg of materials. Join us in building a circular economy! 🌱`,
        url: 'https://sirkulo.app/business/ecotech-solutions',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FontAwesome key={i} name={i < rating ? 'star' : 'star-o'} size={14} color="#FFC107" />
    ));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="building" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>EcoTech Solutions</Text>
        <Text style={styles.title}>Sustainable Business</Text>
        <Text style={styles.joinDate}>Member since March 2024</Text>

        {/* Verification Badge */}
        <View style={styles.verificationContainer}>
          <View style={styles.verificationBadge}>
            <FontAwesome name="check-circle" size={16} color="#10B981" />
            <Text style={styles.verificationLevel}>Verified Business</Text>
          </View>
          <Text style={styles.certificationText}>ISO 14001 Certified</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedProjects.length}</Text>
          <Text style={styles.statLabel}>Projects</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCO2Reduced}kg</Text>
          <Text style={styles.statLabel}>CO2 Reduced</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{SAMPLE_PARTNERS.length}</Text>
          <Text style={styles.statLabel}>Partners</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{averagePartnerRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'impact', label: 'Impact' },
          { key: 'partners', label: 'Partners' },
          { key: 'projects', label: 'Projects' },
        ].map(tab => (
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
            {/* Business Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatItem}>
                    <FontAwesome name="leaf" size={24} color="#10B981" />
                    <Text style={styles.summaryStatValue}>{totalCO2Reduced}kg</Text>
                    <Text style={styles.summaryStatLabel}>CO2 Prevented</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <FontAwesome name="recycle" size={24} color="#3B82F6" />
                    <Text style={styles.summaryStatValue}>{totalMaterialsRecycled}kg</Text>
                    <Text style={styles.summaryStatLabel}>Materials Recycled</Text>
                  </View>
                </View>
                <View style={styles.recyclingRate}>
                  <Text style={styles.recyclingRateLabel}>Recycling Efficiency</Text>
                  <View style={styles.recyclingRateBar}>
                    <View style={[styles.recyclingRateFill, { width: '87%' }]} />
                  </View>
                  <Text style={styles.recyclingRateText}>87%</Text>
                </View>
              </View>
            </View>

            {/* Recent Achievements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <View style={styles.achievementsList}>
                {earnedAchievements.map(achievement => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <FontAwesome
                        name={achievement.icon as any}
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.title}</Text>
                      <Text style={styles.achievementDate}>
                        Earned {new Date(achievement.earnedDate!).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Business Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Business Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionCard}>
                  <FontAwesome name="plus" size={24} color={COLORS.primary} />
                  <Text style={styles.actionCardTitle}>New Project</Text>
                  <Text style={styles.actionCardDesc}>Start sustainability initiative</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <FontAwesome name="handshake-o" size={24} color={COLORS.primary} />
                  <Text style={styles.actionCardTitle}>Find Partners</Text>
                  <Text style={styles.actionCardDesc}>Connect with eco businesses</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard}>
                  <FontAwesome name="bar-chart" size={24} color={COLORS.primary} />
                  <Text style={styles.actionCardTitle}>Analytics</Text>
                  <Text style={styles.actionCardDesc}>View impact reports</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionCard} onPress={handleShareProfile}>
                  <FontAwesome name="share" size={24} color={COLORS.primary} />
                  <Text style={styles.actionCardTitle}>Share Profile</Text>
                  <Text style={styles.actionCardDesc}>Promote your impact</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'impact' && (
          <View>
            {/* Environmental Impact */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
              <View style={styles.impactGrid}>
                <View style={styles.impactCard}>
                  <FontAwesome name="leaf" size={32} color="#10B981" />
                  <Text style={styles.impactValue}>{totalCO2Reduced}kg</Text>
                  <Text style={styles.impactLabel}>CO2 Emissions Prevented</Text>
                  <Text style={styles.impactEquivalent}>≈ 56 trees planted</Text>
                </View>
                <View style={styles.impactCard}>
                  <FontAwesome name="recycle" size={32} color="#3B82F6" />
                  <Text style={styles.impactValue}>{totalMaterialsRecycled}kg</Text>
                  <Text style={styles.impactLabel}>Materials Recycled</Text>
                  <Text style={styles.impactEquivalent}>≈ 2,847 bottles saved</Text>
                </View>
              </View>
            </View>

            {/* Material Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Material Breakdown</Text>
              {[
                { material: 'Plastic', amount: 1245, percentage: 44, color: '#10B981' },
                { material: 'Metal', amount: 856, percentage: 30, color: '#3B82F6' },
                { material: 'Paper', amount: 433, percentage: 15, color: '#F59E0B' },
                { material: 'Electronic', amount: 313, percentage: 11, color: '#8B5CF6' },
              ].map((item, index) => (
                <View key={index} style={styles.materialItem}>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialName}>{item.material}</Text>
                    <Text style={styles.materialAmount}>{item.amount}kg</Text>
                  </View>
                  <View style={styles.materialProgress}>
                    <View style={styles.materialBar}>
                      <View
                        style={[
                          styles.materialBarFill,
                          { width: `${item.percentage}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.materialPercentage}>{item.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'partners' && (
          <View>
            {SAMPLE_PARTNERS.map(partner => (
              <View key={partner.id} style={styles.partnerCard}>
                <View style={styles.partnerHeader}>
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <Text style={styles.partnerType}>{partner.type}</Text>
                  </View>
                  <View style={styles.partnerRating}>
                    {renderStars(Math.round(partner.rating))}
                    <Text style={styles.ratingValue}>{partner.rating}</Text>
                  </View>
                </View>
                <View style={styles.partnerStats}>
                  <Text style={styles.partnerStat}>
                    {partner.projectsCompleted} projects completed
                  </Text>
                  <Text style={styles.partnerStat}>
                    Partner since {new Date(partner.joinDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'projects' && (
          <View>
            {SAMPLE_PROJECTS.map(project => (
              <View key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      project.status === 'Completed' && styles.statusCompleted,
                      project.status === 'In Progress' && styles.statusInProgress,
                      project.status === 'Planning' && styles.statusPlanning,
                    ]}
                  >
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>

                <View style={styles.projectMetrics}>
                  <View style={styles.projectMetric}>
                    <FontAwesome name="leaf" size={16} color="#10B981" />
                    <Text style={styles.metricText}>{project.impactMetrics.co2Reduced}kg CO2</Text>
                  </View>
                  <View style={styles.projectMetric}>
                    <FontAwesome name="recycle" size={16} color="#3B82F6" />
                    <Text style={styles.metricText}>
                      {project.impactMetrics.materialsRecycled}kg recycled
                    </Text>
                  </View>
                  <View style={styles.projectMetric}>
                    <FontAwesome name="users" size={16} color="#8B5CF6" />
                    <Text style={styles.metricText}>{project.partnersInvolved} partners</Text>
                  </View>
                </View>

                {project.completedDate && (
                  <Text style={styles.projectDate}>
                    Completed {new Date(project.completedDate).toLocaleDateString()}
                  </Text>
                )}
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
  verificationContainer: {
    alignItems: 'center',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  verificationLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  certificationText: {
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
    fontSize: 20,
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
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  recyclingRate: {
    alignItems: 'center',
  },
  recyclingRateLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  recyclingRateBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  recyclingRateFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  recyclingRateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
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
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3EC',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  actionCardDesc: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  impactEquivalent: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  materialAmount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  materialProgress: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  materialBar: {
    width: 60,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 4,
  },
  materialBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  materialPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  partnerCard: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  partnerType: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  partnerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  partnerStats: {
    gap: 4,
  },
  partnerStat: {
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
  statusPlanning: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  projectMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  projectMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  metricText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  projectDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
});
