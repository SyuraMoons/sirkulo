import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const PURCHASES = [
  {
    id: '1',
    title: 'Tas dari Botol Plastik Daur Ulang',
    status: 'Dikirim',
    time: '1 hari lalu',
    price: 125000,
  },
  {
    id: '2',
    title: 'Review: EcoFurniture Co.',
    status: 'Dipublikasi',
    rating: 4,
    time: '3 hari lalu',
  },
  {
    id: '3',
    title: 'Lacak: Sepatu dari Ban Bekas',
    status: 'Dilihat',
    label: 'Transparan',
    time: '5 hari lalu',
  },
];

const ACHIEVEMENTS = [
  {
    id: '1',
    title: 'Eco Shopper',
    description: 'Buy 20+ eco products',
    icon: 'trophy',
    progress: 18,
    target: 20,
  },
  {
    id: '2',
    title: 'Planet Saver',
    description: 'Reduce 50kg CO2',
    icon: 'leaf',
    progress: 45.2,
    target: 50,
  },
  {
    id: '3',
    title: 'Business Supporter',
    description: 'Support 10+ businesses',
    icon: 'diamond',
    progress: 7,
    target: 10,
  },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('ringkasan');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <FontAwesome name="user" size={40} color="#386B5F" />
          </View>
          <Text style={styles.name}>John</Text>
          <Text style={styles.subtitle}>Conscious Consumer</Text>
          <Text style={styles.joinDate}>Bergabung sejak Januari 2024</Text>
        </View>

        {/* Environmental Impact */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <FontAwesome name="leaf" size={16} color="#386B5F" />
            <Text style={styles.impactTitle}>Environmental Impact</Text>
          </View>
          <View style={styles.impactStats}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>45.2kg</Text>
              <Text style={styles.impactLabel}>CO2 Dikurangi</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>7</Text>
              <Text style={styles.impactLabel}>Bisnis Didukung</Text>
            </View>
          </View>
        </View>

        {/* Stats Navigation */}
        <View style={styles.statsNav}>
          <TouchableOpacity 
            style={[styles.statsTab, activeTab === 'ringkasan' && styles.statsTabActive]}
            onPress={() => setActiveTab('ringkasan')}
          >
            <Text style={[styles.statsTabText, activeTab === 'ringkasan' && styles.statsTabTextActive]}>
              Ringkasan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statsTab, activeTab === 'purchases' && styles.statsTabActive]}
            onPress={() => setActiveTab('purchases')}
          >
            <Text style={[styles.statsTabText, activeTab === 'purchases' && styles.statsTabTextActive]}>
              Purchases
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.statsTab, activeTab === 'pencapaian' && styles.statsTabActive]}
            onPress={() => setActiveTab('pencapaian')}
          >
            <Text style={[styles.statsTabText, activeTab === 'pencapaian' && styles.statsTabTextActive]}>
              Pencapaian
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'pencapaian' ? (
          <View style={styles.achievementsList}>
            {ACHIEVEMENTS.map(achievement => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementHeader}>
                  <View style={styles.achievementIcon}>
                    <FontAwesome name={achievement.icon as any} size={24} color="#386B5F" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDesc}>{achievement.description}</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Progress</Text>
                  <Text style={styles.progressValue}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(achievement.progress / achievement.target) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        ) : activeTab === 'purchases' ? (
          <View style={styles.purchasesList}>
            {PURCHASES.map(item => (
              <View key={item.id} style={styles.purchaseItem}>
                <View style={styles.purchaseHeader}>
                  <Text style={styles.purchaseTitle}>{item.title}</Text>
                  {item.price && (
                    <Text style={styles.purchasePrice}>
                      Rp{item.price.toLocaleString()}
                    </Text>
                  )}
                </View>
                <View style={styles.purchaseFooter}>
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusBadge,
                      item.status === 'Dipublikasi' && styles.statusPublished,
                      item.status === 'Dikirim' && styles.statusShipped,
                      item.status === 'Dilihat' && styles.statusViewed,
                    ]}>
                      {item.status}
                    </Text>
                    <Text style={styles.purchaseTime}>{item.time}</Text>
                  </View>
                  {item.rating && (
                    <View style={styles.ratingContainer}>
                      <Text style={styles.ratingText}>{item.rating}</Text>
                      <FontAwesome name="star" size={16} color="#FFC107" />
                    </View>
                  )}
                  {item.label && (
                    <Text style={styles.transparentLabel}>{item.label}</Text>
                  )}
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Lihat Semua Aktivitas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <FontAwesome name="shopping-bag" size={24} color="#386B5F" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>18</Text>
                <Text style={styles.statsTitle}>Products Bought</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <FontAwesome name="building" size={24} color="#386B5F" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>7</Text>
                <Text style={styles.statsTitle}>Businesses{'\n'}Supported</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <FontAwesome name="line-chart" size={24} color="#386B5F" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>Rp1,850,000</Text>
                <Text style={styles.statsTitle}>Total Spent</Text>
              </View>
            </View>

            <View style={styles.statsCard}>
              <FontAwesome name="shield" size={24} color="#386B5F" />
              <View style={styles.statsTextContainer}>
                <Text style={styles.statsNumber}>156</Text>
                <Text style={styles.statsTitle}>Transparency Views</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="search" size={20} color="#386B5F" />
              <Text style={styles.actionButtonText}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <FontAwesome name="eye" size={20} color="#386B5F" />
              <Text style={styles.actionButtonText}>Trace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.settingsMenu}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="cog" size={20} color="#386B5F" />
              <Text style={styles.menuItemText}>Pengaturan Akun</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="bell" size={20} color="#386B5F" />
              <Text style={styles.menuItemText}>Notifikasi</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <FontAwesome name="question-circle" size={20} color="#386B5F" />
              <Text style={styles.menuItemText}>Bantuan & Dukungan</Text>
            </View>
            <FontAwesome name="chevron-right" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton}>
            <FontAwesome name="sign-out" size={20} color="#FF4B4B" />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 32, // Extra padding at bottom
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  impactCard: {
    backgroundColor: '#E6F3EC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#386B5F',
    marginLeft: 8,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#386B5F',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsNav: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    marginBottom: 16,
  },
  statsTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statsTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#386B5F',
  },
  statsTabText: {
    fontSize: 16,
    color: '#666',
  },
  statsTabTextActive: {
    color: '#386B5F',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  statsCard: {
    width: '48%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  statsTextContainer: {
    marginTop: 12,
  },
  statsTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#386B5F',
    marginLeft: 8,
  },
  settingsMenu: {
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF4B4B',
    marginLeft: 12,
  },
  purchasesList: {
    marginTop: 8,
  },
  purchaseItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  purchaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#386B5F',
  },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    backgroundColor: '#F5F6F8',
    color: '#666',
  },
  statusPublished: {
    backgroundColor: '#E6F3EC',
    color: '#386B5F',
  },
  statusShipped: {
    backgroundColor: '#F5F6F8',
    color: '#666',
  },
  statusViewed: {
    backgroundColor: '#F5F6F8',
    color: '#666',
  },
  purchaseTime: {
    fontSize: 12,
    color: '#999',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginRight: 4,
  },
  transparentLabel: {
    fontSize: 14,
    color: '#386B5F',
    fontWeight: '500',
  },
  viewAllButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    color: '#386B5F',
    fontWeight: '500',
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    marginBottom: 24,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#386B5F',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F6F8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#386B5F',
    borderRadius: 4,
  },
});