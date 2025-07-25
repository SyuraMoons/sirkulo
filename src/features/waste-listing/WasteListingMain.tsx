import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { WASTE_CATEGORIES, COLORS } from '@/src/constants/features';
import { router } from 'expo-router';

interface WasteListingMainProps {
  onStartListing: () => void;
}

export default function WasteListingMain({ onStartListing }: WasteListingMainProps) {
  const handleStartListing = () => {
    router.push('/waste-listing/create');
  };

  const handleQuickTemplate = (categoryId: string) => {
    router.push(`/waste-listing/create?template=${categoryId}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>List Your Waste</Text>
        <Text style={styles.subtitle}>
          Turn your waste into resources for the circular economy
        </Text>
      </View>

      {/* Quick Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={handleStartListing}>
        <View style={styles.startButtonContent}>
          <FontAwesome name="plus-circle" size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Create New Listing</Text>
        </View>
        <FontAwesome name="arrow-right" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Quick Templates */}
      <View style={styles.templatesSection}>
        <Text style={styles.sectionTitle}>Quick Start Templates</Text>
        <Text style={styles.sectionSubtitle}>
          Choose a category to get started quickly
        </Text>
        
        <View style={styles.templateGrid}>
          {WASTE_CATEGORIES.slice(0, 6).map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.templateCard}
              onPress={() => handleQuickTemplate(category.id)}
            >
              <View style={styles.templateIcon}>
                <FontAwesome 
                  name={category.icon as any} 
                  size={24} 
                  color={COLORS.primary} 
                />
              </View>
              <Text style={styles.templateName}>{category.name}</Text>
              <Text style={styles.templateCount}>
                {category.subcategories.length} types
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>Recent Listings</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityCard}>
          <FontAwesome name="clock-o" size={16} color={COLORS.text.secondary} />
          <Text style={styles.activityText}>
            You haven't created any listings yet
          </Text>
        </View>
      </View>

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        
        <TouchableOpacity style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <FontAwesome name="question-circle" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Listing Guidelines</Text>
            <Text style={styles.helpDescription}>
              Learn how to create effective waste listings
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpCard}>
          <View style={styles.helpIcon}>
            <FontAwesome name="phone" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Contact Support</Text>
            <Text style={styles.helpDescription}>
              Get help with your listing process
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Marketplace Overview</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,234</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>567</Text>
            <Text style={styles.statLabel}>Recyclers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
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
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  templatesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  templateCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  activitySection: {
    marginBottom: 32,
  },
  activityHeader: {
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
  },
  helpSection: {
    marginBottom: 32,
  },
  helpCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});