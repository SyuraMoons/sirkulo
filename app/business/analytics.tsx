import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  wasteListings: {
    total: number;
    active: number;
    completed: number;
    revenue: number;
  };
  partnerships: {
    total: number;
    active: number;
    requests: number;
  };
  sustainability: {
    co2Reduced: number;
    materialsRecycled: number;
    circularityScore: number;
  };
  performance: {
    responseRate: number;
    completionRate: number;
    rating: number;
    reviews: number;
  };
}

export default function BusinessAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    wasteListings: {
      total: 47,
      active: 12,
      completed: 35,
      revenue: 2850000,
    },
    partnerships: {
      total: 15,
      active: 8,
      requests: 3,
    },
    sustainability: {
      co2Reduced: 1250.5,
      materialsRecycled: 2847.3,
      circularityScore: 87,
    },
    performance: {
      responseRate: 94,
      completionRate: 89,
      rating: 4.8,
      reviews: 127,
    },
  };

  const monthlyData = [
    { month: 'Jan', listings: 8, revenue: 450000, partnerships: 2 },
    { month: 'Feb', listings: 12, revenue: 680000, partnerships: 3 },
    { month: 'Mar', listings: 15, revenue: 890000, partnerships: 4 },
    { month: 'Apr', listings: 18, revenue: 1020000, partnerships: 3 },
    { month: 'May', listings: 22, revenue: 1150000, partnerships: 5 },
    { month: 'Jun', listings: 25, revenue: 1340000, partnerships: 6 },
  ];

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'quarter', 'year'].map(period => (
        <TouchableOpacity
          key={period}
          style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriod]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text style={[styles.periodText, selectedPeriod === period && styles.selectedPeriodText]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewMetrics = () => (
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <FontAwesome name="list" size={24} color={COLORS.primary} />
        <Text style={styles.metricValue}>{analyticsData.wasteListings.total}</Text>
        <Text style={styles.metricLabel}>Total Listings</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+15%</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="money" size={24} color={COLORS.success} />
        <Text style={styles.metricValue}>
          Rp{(analyticsData.wasteListings.revenue / 1000000).toFixed(1)}M
        </Text>
        <Text style={styles.metricLabel}>Revenue</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+23%</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="handshake-o" size={24} color={COLORS.info} />
        <Text style={styles.metricValue}>{analyticsData.partnerships.total}</Text>
        <Text style={styles.metricLabel}>Partnerships</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+8</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="star" size={24} color={COLORS.warning} />
        <Text style={styles.metricValue}>{analyticsData.performance.rating}</Text>
        <Text style={styles.metricLabel}>Rating</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+0.2</Text>
        </View>
      </View>
    </View>
  );

  const renderChart = () => {
    const maxValue = Math.max(...monthlyData.map(d => d.revenue));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Trend</Text>
        <View style={styles.chart}>
          <View style={styles.chartContainer}>
            {monthlyData.map((data, index) => {
              const height = (data.revenue / maxValue) * 150;
              return (
                <View key={data.month} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[styles.bar, { height: height, backgroundColor: COLORS.primary }]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.month}</Text>
                  <Text style={styles.barValue}>{(data.revenue / 1000000).toFixed(1)}M</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>

      <View style={styles.performanceList}>
        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Response Rate</Text>
          <View style={styles.performanceBarContainer}>
            <View style={styles.performanceBar}>
              <View
                style={[
                  styles.performanceBarFill,
                  { width: `${analyticsData.performance.responseRate}%` },
                ]}
              />
            </View>
            <Text style={styles.performanceValue}>{analyticsData.performance.responseRate}%</Text>
          </View>
        </View>

        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Completion Rate</Text>
          <View style={styles.performanceBarContainer}>
            <View style={styles.performanceBar}>
              <View
                style={[
                  styles.performanceBarFill,
                  { width: `${analyticsData.performance.completionRate}%` },
                ]}
              />
            </View>
            <Text style={styles.performanceValue}>{analyticsData.performance.completionRate}%</Text>
          </View>
        </View>

        <View style={styles.performanceItem}>
          <Text style={styles.performanceLabel}>Circularity Score</Text>
          <View style={styles.performanceBarContainer}>
            <View style={styles.performanceBar}>
              <View
                style={[
                  styles.performanceBarFill,
                  { width: `${analyticsData.sustainability.circularityScore}%` },
                ]}
              />
            </View>
            <Text style={styles.performanceValue}>
              {analyticsData.sustainability.circularityScore}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTopCategories = () => {
    const categories = [
      { name: 'Plastic Waste', percentage: 45, amount: '1,245kg', color: COLORS.primary },
      { name: 'Metal Scraps', percentage: 28, amount: '856kg', color: COLORS.info },
      { name: 'Paper Waste', percentage: 18, amount: '432kg', color: COLORS.warning },
      { name: 'Electronics', percentage: 9, amount: '313kg', color: COLORS.success },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Categories</Text>

        <View style={styles.categoriesList}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryStats}>
                <Text style={styles.categoryAmount}>{category.amount}</Text>
                <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => console.log('Export Report - Feature coming soon')}
      >
        <FontAwesome name="download" size={16} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Export Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => console.log('Schedule Report - Feature coming soon')}
      >
        <FontAwesome name="calendar" size={16} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Schedule Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => console.log('Share Analytics - Feature coming soon')}
      >
        <FontAwesome name="share" size={16} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Analytics</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <FontAwesome name="cog" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        {renderOverviewMetrics()}
        {renderChart()}
        {renderPerformanceMetrics()}
        {renderTopCategories()}
        {renderActionButtons()}

        <View style={{ height: 50 }} />
      </ScrollView>
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
  settingsBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
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
    color: '#666',
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 24,
  },
  chart: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '80%',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  performanceList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  performanceItem: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginBottom: 8,
  },
  performanceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  performanceBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    minWidth: 40,
  },
  categoriesList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 8,
  },
});
