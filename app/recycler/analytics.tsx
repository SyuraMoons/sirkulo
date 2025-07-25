import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

const { width } = Dimensions.get('window');

interface RecyclerAnalyticsData {
  jobsCompleted: {
    total: number;
    thisMonth: number;
    avgRating: number;
    earnings: number;
  };
  materials: {
    totalProcessed: number;
    categories: {
      plastic: number;
      metal: number;
      paper: number;
      electronic: number;
    };
  };
  sustainability: {
    co2Prevented: number;
    wasteReduced: number;
    circularityContribution: number;
  };
  performance: {
    responseTime: number; // hours
    completionRate: number; // percentage
    clientSatisfaction: number; // rating
    repeatClients: number; // percentage
  };
}

export default function RecyclerAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock analytics data for recyclers
  const analyticsData: RecyclerAnalyticsData = {
    jobsCompleted: {
      total: 127,
      thisMonth: 18,
      avgRating: 4.7,
      earnings: 15750000,
    },
    materials: {
      totalProcessed: 3247.8,
      categories: {
        plastic: 1456.2,
        metal: 987.4,
        paper: 543.1,
        electronic: 261.1,
      },
    },
    sustainability: {
      co2Prevented: 2134.5,
      wasteReduced: 3247.8,
      circularityContribution: 92,
    },
    performance: {
      responseTime: 1.2,
      completionRate: 94,
      clientSatisfaction: 4.7,
      repeatClients: 68,
    },
  };

  const monthlyJobs = [
    { month: 'Jan', jobs: 12, earnings: 1850000, materials: 287.5 },
    { month: 'Feb', jobs: 15, earnings: 2100000, materials: 342.1 },
    { month: 'Mar', jobs: 18, earnings: 2450000, materials: 398.7 },
    { month: 'Apr', jobs: 22, earnings: 2800000, materials: 456.3 },
    { month: 'May', jobs: 19, earnings: 2650000, materials: 423.8 },
    { month: 'Jun', jobs: 21, earnings: 2900000, materials: 489.2 },
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
        <FontAwesome name="check-circle" size={24} color={COLORS.success} />
        <Text style={styles.metricValue}>{analyticsData.jobsCompleted.total}</Text>
        <Text style={styles.metricLabel}>Jobs Completed</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+{analyticsData.jobsCompleted.thisMonth} this month</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="money" size={24} color={COLORS.success} />
        <Text style={styles.metricValue}>
          Rp{(analyticsData.jobsCompleted.earnings / 1000000).toFixed(1)}M
        </Text>
        <Text style={styles.metricLabel}>Total Earnings</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+18%</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="recycle" size={24} color={COLORS.info} />
        <Text style={styles.metricValue}>
          {analyticsData.materials.totalProcessed.toFixed(1)}kg
        </Text>
        <Text style={styles.metricLabel}>Materials Processed</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+12%</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <FontAwesome name="star" size={24} color={COLORS.warning} />
        <Text style={styles.metricValue}>{analyticsData.jobsCompleted.avgRating}</Text>
        <Text style={styles.metricLabel}>Avg Rating</Text>
        <View style={styles.metricTrend}>
          <FontAwesome name="arrow-up" size={12} color={COLORS.success} />
          <Text style={styles.trendText}>+0.3</Text>
        </View>
      </View>
    </View>
  );

  const renderJobsChart = () => {
    const maxJobs = Math.max(...monthlyJobs.map(d => d.jobs));

    return (
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Jobs Completed Trend</Text>
        <View style={styles.chart}>
          <View style={styles.chartContainer}>
            {monthlyJobs.map((data, index) => {
              const height = (data.jobs / maxJobs) * 120;
              return (
                <View key={data.month} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View
                      style={[styles.bar, { height: height, backgroundColor: COLORS.success }]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{data.month}</Text>
                  <Text style={styles.barValue}>{data.jobs}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderMaterialBreakdown = () => {
    const materials = [
      {
        name: 'Plastic',
        amount: analyticsData.materials.categories.plastic,
        color: COLORS.primary,
        percentage: 45,
      },
      {
        name: 'Metal',
        amount: analyticsData.materials.categories.metal,
        color: COLORS.info,
        percentage: 30,
      },
      {
        name: 'Paper',
        amount: analyticsData.materials.categories.paper,
        color: COLORS.warning,
        percentage: 17,
      },
      {
        name: 'Electronic',
        amount: analyticsData.materials.categories.electronic,
        color: COLORS.error,
        percentage: 8,
      },
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Material Processing Breakdown</Text>

        <View style={styles.materialsList}>
          {materials.map((material, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialInfo}>
                <View style={[styles.materialDot, { backgroundColor: material.color }]} />
                <Text style={styles.materialName}>{material.name}</Text>
              </View>
              <View style={styles.materialStats}>
                <Text style={styles.materialAmount}>{material.amount.toFixed(1)}kg</Text>
                <View style={styles.materialProgressBar}>
                  <View
                    style={[
                      styles.materialProgress,
                      { width: `${material.percentage}%`, backgroundColor: material.color },
                    ]}
                  />
                </View>
                <Text style={styles.materialPercentage}>{material.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Performance Metrics</Text>

      <View style={styles.performanceGrid}>
        <View style={styles.performanceCard}>
          <FontAwesome name="clock-o" size={20} color={COLORS.primary} />
          <Text style={styles.performanceValue}>{analyticsData.performance.responseTime}h</Text>
          <Text style={styles.performanceLabel}>Avg Response Time</Text>
        </View>

        <View style={styles.performanceCard}>
          <FontAwesome name="check" size={20} color={COLORS.success} />
          <Text style={styles.performanceValue}>{analyticsData.performance.completionRate}%</Text>
          <Text style={styles.performanceLabel}>Completion Rate</Text>
        </View>

        <View style={styles.performanceCard}>
          <FontAwesome name="heart" size={20} color={COLORS.error} />
          <Text style={styles.performanceValue}>
            {analyticsData.performance.clientSatisfaction}
          </Text>
          <Text style={styles.performanceLabel}>Client Satisfaction</Text>
        </View>

        <View style={styles.performanceCard}>
          <FontAwesome name="refresh" size={20} color={COLORS.info} />
          <Text style={styles.performanceValue}>{analyticsData.performance.repeatClients}%</Text>
          <Text style={styles.performanceLabel}>Repeat Clients</Text>
        </View>
      </View>
    </View>
  );

  const renderSustainabilityImpact = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🌱 Environmental Impact</Text>

      <View style={styles.sustainabilityCard}>
        <View style={styles.impactRow}>
          <FontAwesome name="leaf" size={24} color={COLORS.success} />
          <View style={styles.impactInfo}>
            <Text style={styles.impactValue}>
              {analyticsData.sustainability.co2Prevented.toFixed(1)}kg
            </Text>
            <Text style={styles.impactLabel}>CO2 Emissions Prevented</Text>
          </View>
        </View>

        <View style={styles.impactRow}>
          <FontAwesome name="recycle" size={24} color={COLORS.info} />
          <View style={styles.impactInfo}>
            <Text style={styles.impactValue}>
              {analyticsData.sustainability.wasteReduced.toFixed(1)}kg
            </Text>
            <Text style={styles.impactLabel}>Waste Diverted from Landfill</Text>
          </View>
        </View>

        <View style={styles.impactRow}>
          <FontAwesome name="globe" size={24} color={COLORS.primary} />
          <View style={styles.impactInfo}>
            <Text style={styles.impactValue}>
              {analyticsData.sustainability.circularityContribution}%
            </Text>
            <Text style={styles.impactLabel}>Circularity Contribution Score</Text>
          </View>
        </View>
      </View>

      <View style={styles.equivalentsContainer}>
        <Text style={styles.equivalentsTitle}>Environmental Equivalents:</Text>
        <View style={styles.equivalentsList}>
          <View style={styles.equivalentItem}>
            <FontAwesome name="tree" size={16} color={COLORS.success} />
            <Text style={styles.equivalentText}>95 trees saved</Text>
          </View>
          <View style={styles.equivalentItem}>
            <FontAwesome name="car" size={16} color={COLORS.info} />
            <Text style={styles.equivalentText}>4,680 km not driven</Text>
          </View>
          <View style={styles.equivalentItem}>
            <FontAwesome name="home" size={16} color={COLORS.warning} />
            <Text style={styles.equivalentText}>5.8 months of energy</Text>
          </View>
        </View>
      </View>
    </View>
  );

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
        onPress={() => console.log('Share Impact - Feature coming soon')}
      >
        <FontAwesome name="share" size={16} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Share Impact</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => console.log('Set Goals - Feature coming soon')}
      >
        <FontAwesome name="bullseye" size={16} color={COLORS.primary} />
        <Text style={styles.actionButtonText}>Set Goals</Text>
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
        <Text style={styles.headerTitle}>Recycler Analytics</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <FontAwesome name="cog" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPeriodSelector()}
        {renderOverviewMetrics()}
        {renderJobsChart()}
        {renderMaterialBreakdown()}
        {renderPerformanceMetrics()}
        {renderSustainabilityImpact()}
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
    fontSize: 10,
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
    height: 160,
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
  materialsList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  materialDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },
  materialStats: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  materialAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  materialProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 2,
  },
  materialProgress: {
    height: '100%',
    borderRadius: 2,
  },
  materialPercentage: {
    fontSize: 10,
    color: '#666',
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  performanceCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sustainabilityCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactInfo: {
    marginLeft: 16,
    flex: 1,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
  },
  equivalentsContainer: {
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    padding: 16,
  },
  equivalentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  equivalentsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  equivalentItem: {
    alignItems: 'center',
    flex: 1,
  },
  equivalentText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
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
