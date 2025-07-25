import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BUSINESS_ACHIEVEMENT_CATEGORIES, COLORS } from '@/src/constants/features';
import { router } from 'expo-router';

export default function BusinessDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data - in real app this would come from API
  const impactStats = {
    totalCO2Reduced: 1250.5,
    totalRecycled: 2847.3,
    businessesSupported: 15,
    projectsCompleted: 8,
  };

  const materialBreakdown = [
    { material: 'Plastic', amount: 1245.2, percentage: 43.7, icon: 'recycle', color: '#4CAF50' },
    { material: 'Metal', amount: 856.1, percentage: 30.1, icon: 'cog', color: '#2196F3' },
    { material: 'Paper', amount: 432.8, percentage: 15.2, icon: 'file-text-o', color: '#FF9800' },
    { material: 'Electronic', amount: 313.2, percentage: 11.0, icon: 'mobile', color: '#9C27B0' },
  ];

  const achievements = [
    {
      id: '1',
      title: 'Carbon Saver',
      description: 'Reduced 1000kg CO2',
      category: 'environmental',
      icon: 'leaf',
      earned: true,
      progress: { current: 1250, target: 1000 },
    },
    {
      id: '2',
      title: 'Recycling Champion',
      description: 'Processed 2500kg materials',
      category: 'efficiency',
      icon: 'trophy',
      earned: true,
      progress: { current: 2847, target: 2500 },
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

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: 'Check out my sustainability impact on Sirkulo! I\'ve reduced 1,250kg of CO2 and recycled 2,847kg of materials. Join me in building a circular economy! 🌱',
        url: 'https://sirkulo.app/profile/business-123',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderImpactStatistics = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Impact Statistics</Text>
        <TouchableOpacity onPress={() => console.log('Impact details - Feature coming soon')}>
          <Text style={styles.viewAllText}>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.impactGrid}>
        <View style={styles.impactCard}>
          <FontAwesome name="leaf" size={24} color={COLORS.success} />
          <Text style={styles.impactValue}>{impactStats.totalCO2Reduced}kg</Text>
          <Text style={styles.impactLabel}>CO2 Reduced</Text>
          <View style={styles.impactTrend}>
            <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
            <Text style={styles.trendText}>+12.5%</Text>
          </View>
        </View>

        <View style={styles.impactCard}>
          <FontAwesome name="recycle" size={24} color={COLORS.info} />
          <Text style={styles.impactValue}>{impactStats.totalRecycled}kg</Text>
          <Text style={styles.impactLabel}>Total Recycled</Text>
          <View style={styles.impactTrend}>
            <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
            <Text style={styles.trendText}>+8.3%</Text>
          </View>
        </View>

        <View style={styles.impactCard}>
          <FontAwesome name="handshake-o" size={24} color={COLORS.warning} />
          <Text style={styles.impactValue}>{impactStats.businessesSupported}</Text>
          <Text style={styles.impactLabel}>Partners</Text>
          <View style={styles.impactTrend}>
            <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
            <Text style={styles.trendText}>+3</Text>
          </View>
        </View>

        <View style={styles.impactCard}>
          <FontAwesome name="check-circle" size={24} color="#9C27B0" />
          <Text style={styles.impactValue}>{impactStats.projectsCompleted}</Text>
          <Text style={styles.impactLabel}>Projects Done</Text>
          <View style={styles.impactTrend}>
            <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
            <Text style={styles.trendText}>+2</Text>
          </View>
        </View>
      </View>

      <View style={styles.periodSelector}>
        {['week', 'month', 'year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriod
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              selectedPeriod === period && styles.selectedPeriodText
            ]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTotalRecycled = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Material Breakdown</Text>
      
      <View style={styles.totalRecycledCard}>
        <View style={styles.totalRecycledHeader}>
          <Text style={styles.totalRecycledValue}>{impactStats.totalRecycled}kg</Text>
          <Text style={styles.totalRecycledLabel}>Total Materials Recycled</Text>
        </View>
        
        <View style={styles.recyclingRate}>
          <View style={styles.recyclingRateBar}>
            <View style={[styles.recyclingRateFill, { width: '87%' }]} />
          </View>
          <Text style={styles.recyclingRateText}>87% Recycling Rate</Text>
        </View>
      </View>

      <View style={styles.materialList}>
        {materialBreakdown.map((material, index) => (
          <View key={index} style={styles.materialItem}>
            <View style={styles.materialIcon}>
              <FontAwesome name={material.icon as any} size={20} color={material.color} />
            </View>
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{material.material}</Text>
              <Text style={styles.materialAmount}>{material.amount}kg</Text>
            </View>
            <View style={styles.materialPercentage}>
              <Text style={styles.percentageText}>{material.percentage}%</Text>
              <View style={styles.materialBar}>
                <View 
                  style={[
                    styles.materialBarFill, 
                    { width: `${material.percentage}%`, backgroundColor: material.color }
                  ]} 
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCO2Reduced = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Carbon Impact</Text>
      
      <View style={styles.carbonCard}>
        <View style={styles.carbonHeader}>
          <FontAwesome name="leaf" size={32} color={COLORS.success} />
          <View style={styles.carbonValues}>
            <Text style={styles.carbonValue}>{impactStats.totalCO2Reduced}kg</Text>
            <Text style={styles.carbonLabel}>CO2 Emissions Prevented</Text>
          </View>
        </View>
        
        <View style={styles.carbonEquivalents}>
          <View style={styles.equivalentItem}>
            <FontAwesome name="tree" size={16} color={COLORS.success} />
            <Text style={styles.equivalentText}>56 trees planted</Text>
          </View>
          <View style={styles.equivalentItem}>
            <FontAwesome name="car" size={16} color={COLORS.success} />
            <Text style={styles.equivalentText}>2,741 km not driven</Text>
          </View>
          <View style={styles.equivalentItem}>
            <FontAwesome name="home" size={16} color={COLORS.success} />
            <Text style={styles.equivalentText}>3.2 months of energy</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.carbonDetailsButton}>
        <Text style={styles.carbonDetailsText}>View Carbon Calculator</Text>
        <FontAwesome name="calculator" size={16} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderBadgesEarned = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <TouchableOpacity onPress={() => console.log('Achievements - Feature coming soon')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.achievementsList}>
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <FontAwesome 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.earned ? COLORS.primary : COLORS.text.disabled} 
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.earned && styles.disabledText
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <View style={styles.achievementProgress}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(achievement.progress.current / achievement.progress.target) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {achievement.progress.current}/{achievement.progress.target}
                </Text>
              </View>
            </View>
            {achievement.earned && (
              <View style={styles.earnedBadge}>
                <FontAwesome name="check" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderPublicProfile = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Public Profile</Text>
      
      <View style={styles.publicProfileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <FontAwesome name="building" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>EcoTech Solutions</Text>
            <Text style={styles.profileType}>Sustainable Business</Text>
            <View style={styles.verifiedBadge}>
              <FontAwesome name="check-circle" size={12} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>4.8</Text>
            <Text style={styles.profileStatLabel}>Rating</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>127</Text>
            <Text style={styles.profileStatLabel}>Reviews</Text>
          </View>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatValue}>89%</Text>
            <Text style={styles.profileStatLabel}>Success Rate</Text>
          </View>
        </View>
      </View>

      <View style={styles.shareOptions}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareProfile}>
          <FontAwesome name="share" size={16} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>Share Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <FontAwesome name="qrcode" size={16} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <FontAwesome name="edit" size={16} color={COLORS.primary} />
          <Text style={styles.shareButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Dashboard</Text>
        <Text style={styles.subtitle}>Track your sustainability impact and manage operations</Text>
      </View>

      {renderImpactStatistics()}
      {renderTotalRecycled()}
      {renderCO2Reduced()}
      {renderBadgesEarned()}
      {renderPublicProfile()}

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => console.log('Create Project - Feature coming soon')}
          >
            <FontAwesome name="plus" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>New Project</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => console.log('Find Partners - Feature coming soon')}
          >
            <FontAwesome name="handshake-o" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Find Partners</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => console.log('View Reports - Feature coming soon')}
          >
            <FontAwesome name="bar-chart" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => console.log('Sustainability - Feature coming soon')}
          >
            <FontAwesome name="leaf" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Sustainability</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  impactCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  impactTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedPeriod: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  totalRecycledCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  totalRecycledHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalRecycledValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  totalRecycledLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  recyclingRate: {
    alignItems: 'center',
  },
  recyclingRateBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  recyclingRateFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  recyclingRateText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  materialList: {
    marginTop: 8,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  materialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  materialPercentage: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  materialBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  materialBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  carbonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  carbonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  carbonValues: {
    marginLeft: 16,
    flex: 1,
  },
  carbonValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 4,
  },
  carbonLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  carbonEquivalents: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  equivalentItem: {
    alignItems: 'center',
    flex: 1,
  },
  equivalentText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  carbonDetailsButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carbonDetailsText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginRight: 8,
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  disabledText: {
    color: COLORS.text.disabled,
  },
  earnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicProfileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 8,
  },
  quickActions: {
    marginBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: COLORS.surface,
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
});