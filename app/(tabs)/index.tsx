import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import HomeHeader from '@/src/features/home/HomeHeader';
import CraftsSection from '@/src/features/home/CraftsSection';

import RecyclerJobListings from '@/src/features/recycler/RecyclerJobListings';
import { useNavigation } from 'expo-router';
import { useUserMode } from '@/src/contexts/UserModeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { COLORS } from '@/src/constants/features';

export default function TabOneScreen() {
  const { mode, setMode } = useUserMode();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const renderBusinessHome = () => (
    <View style={styles.modeContainer}>
      <Text style={styles.modeTitle}>Business Dashboard</Text>

      {/* Quick Actions for Businesses */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/waste-listing/create')}
        >
          <FontAwesome name="plus" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>List Waste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/project-request/create')}
        >
          <FontAwesome name="lightbulb-o" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Request Project</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/business/analytics')}
        >
          <FontAwesome name="bar-chart" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/business/partnerships')}
        >
          <FontAwesome name="handshake-o" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Partnerships</Text>
        </TouchableOpacity>
      </View>

      {/* Business Overview Section */}
      <View style={styles.businessOverviewSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <TouchableOpacity onPress={() => console.log('View Details - Feature coming soon')}>
            <Text style={styles.viewAllText}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewCards}>
          <View style={styles.overviewCard}>
            <FontAwesome name="recycle" size={20} color={COLORS.success} />
            <Text style={styles.overviewCardValue}>2.4kg</Text>
            <Text style={styles.overviewCardLabel}>Materials Listed</Text>
          </View>

          <View style={styles.overviewCard}>
            <FontAwesome name="lightbulb-o" size={20} color={COLORS.warning} />
            <Text style={styles.overviewCardValue}>3</Text>
            <Text style={styles.overviewCardLabel}>Active Projects</Text>
          </View>

          <View style={styles.overviewCard}>
            <FontAwesome name="users" size={20} color={COLORS.info} />
            <Text style={styles.overviewCardValue}>5</Text>
            <Text style={styles.overviewCardLabel}>Partners</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Section */}
      <View style={styles.recentActivitySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => console.log('View All - Feature coming soon')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <FontAwesome name="plus" size={16} color={COLORS.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>New waste listing created</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <FontAwesome name="handshake-o" size={16} color={COLORS.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Partnership request received</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <FontAwesome name="check" size={16} color={COLORS.success} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Project proposal approved</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderRecyclerHome = () => (
    <View style={styles.modeContainer}>
      <Text style={styles.modeTitle}>Recycler Dashboard</Text>

      {/* Quick Actions for Recyclers */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/recycler/browse-waste')}
        >
          <FontAwesome name="search" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Browse Waste</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/recycler/view-projects')}
        >
          <FontAwesome name="lightbulb-o" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>View Projects</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/recycler/operation-management')}
        >
          <FontAwesome name="cog" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Operations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/business/analytics')}
        >
          <FontAwesome name="bar-chart" size={24} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Job Listings Section */}
      <View style={styles.jobListingsSection}>
        <RecyclerJobListings />
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <FontAwesome name="clock-o" size={16} color={COLORS.text.secondary} />
          <Text style={styles.activityText}>
            No recent activity. Start browsing job opportunities.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HomeHeader mode={mode} setMode={setMode} />

      {mode === 'Customer' && (
        <>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.filterBtn}>
              <FontAwesome name="sliders" size={20} color="#386B5F" />
            </TouchableOpacity>
          </View>

          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image
              source={require('@/assets/images/Banner.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          <CraftsSection />
        </>
      )}

      {mode === 'Recycler' && renderRecyclerHome()}

      {mode === 'Business' && renderBusinessHome()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 0,
  },
  filterBtn: {
    backgroundColor: '#EAF7F1',
    borderRadius: 16,
    padding: 8,
  },
  bannerContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F5F6F8',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  modeContainer: {
    flex: 1,
    marginTop: 8,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
  },
  activitySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
  wasteListingSection: {
    marginBottom: 32,
  },
  jobListingsSection: {
    marginBottom: 32,
  },
  projectRequestSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  projectRequestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectRequestContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  projectRequestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  projectRequestDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  // Business Overview Section Styles
  businessOverviewSection: {
    marginBottom: 24,
  },
  overviewCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6F3EC',
  },
  overviewCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  overviewCardLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Recent Activity Section Styles
  recentActivitySection: {
    marginBottom: 24,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6F3EC',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 22,
    color: '#386B5F',
    fontWeight: '600',
  },
});
