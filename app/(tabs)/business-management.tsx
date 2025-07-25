import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface WasteListing {
  id: string;
  title: string;
  type: string;
  quantity: number;
  unit: string;
  price: number;
  status: 'Active' | 'Sold' | 'Expired' | 'Pending';
  datePosted: string;
  location: string;
  description: string;
  inquiries: number;
  views: number;
  buyer?: string;
  soldDate?: string;
  soldPrice?: number;
}

interface ProjectRequest {
  id: string;
  title: string;
  type: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  budget: number;
  deadline: string;
  description: string;
  proposals: number;
  selectedRecycler?: string;
  datePosted: string;
  location: string;
  requirements: string[];
}

interface Buyer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  totalPurchases: number;
  lastPurchase: string;
  status: 'Active' | 'Inactive';
  avatar?: any;
}

interface Job {
  id: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'Open' | 'Closed' | 'Draft' | 'On Hold';
  datePosted: string;
  deadline: string;
  description: string;
  requirements: string[];
  applications: number;
  views: number;
  experience: string;
  education: string;
  skills: string[];
}

export default function BusinessManagement() {
  const [activeTab, setActiveTab] = useState<'listings' | 'projects' | 'buyers' | 'jobs'>(
    'listings'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Mock data
  const wasteListings: WasteListing[] = [
    {
      id: '1',
      title: 'Office Paper Waste',
      type: 'Paper',
      quantity: 500,
      unit: 'kg',
      price: 2500,
      status: 'Active',
      datePosted: '2024-07-20',
      location: 'Jakarta Pusat',
      description: 'High-quality office paper from corporate offices. Clean and sorted.',
      inquiries: 8,
      views: 45,
    },
    {
      id: '2',
      title: 'Plastic Bottles Collection',
      type: 'Plastic',
      quantity: 200,
      unit: 'kg',
      price: 1800,
      status: 'Sold',
      datePosted: '2024-07-18',
      location: 'Jakarta Selatan',
      description: 'PET bottles from restaurant chains. Cleaned and ready for processing.',
      inquiries: 12,
      views: 67,
      buyer: 'EcoRecycle Solutions',
      soldDate: '2024-07-22',
      soldPrice: 1800,
    },
    {
      id: '3',
      title: 'Electronic Components',
      type: 'Electronic',
      quantity: 50,
      unit: 'kg',
      price: 15000,
      status: 'Pending',
      datePosted: '2024-07-25',
      location: 'Jakarta Timur',
      description: 'Circuit boards and electronic components from IT equipment.',
      inquiries: 3,
      views: 23,
    },
  ];

  const projectRequests: ProjectRequest[] = [
    {
      id: '1',
      title: 'Sustainable Packaging Initiative',
      type: 'Packaging',
      status: 'In Progress',
      budget: 50000000,
      deadline: '2024-09-30',
      description: 'Develop eco-friendly packaging solutions for our product line.',
      proposals: 8,
      selectedRecycler: 'GreenTech Solutions',
      datePosted: '2024-07-15',
      location: 'Jakarta',
      requirements: ['Biodegradable materials', 'Cost-effective', 'Scalable production'],
    },
    {
      id: '2',
      title: 'Waste Reduction Consultation',
      type: 'Consultation',
      status: 'Open',
      budget: 25000000,
      deadline: '2024-08-31',
      description: 'Need expert consultation on reducing waste in manufacturing process.',
      proposals: 5,
      datePosted: '2024-07-22',
      location: 'Jakarta',
      requirements: ['Manufacturing experience', 'Waste audit', 'Implementation plan'],
    },
    {
      id: '3',
      title: 'Recycling Program Setup',
      type: 'Program',
      status: 'Completed',
      budget: 75000000,
      deadline: '2024-07-30',
      description: 'Establish comprehensive recycling program for corporate offices.',
      proposals: 12,
      selectedRecycler: 'Corporate Recycling Inc',
      datePosted: '2024-06-10',
      location: 'Jakarta',
      requirements: ['Office setup', 'Staff training', 'Monthly reporting'],
    },
  ];

  const buyers: Buyer[] = [
    {
      id: '1',
      name: 'Ahmad Recycling',
      company: 'EcoRecycle Solutions',
      email: 'ahmad@ecorecycle.com',
      phone: '+62 812 3456 7890',
      totalPurchases: 12500000,
      lastPurchase: '2024-07-22',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Sari Waste Management',
      company: 'GreenTech Solutions',
      email: 'sari@greentech.com',
      phone: '+62 813 4567 8901',
      totalPurchases: 8750000,
      lastPurchase: '2024-07-20',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Budi Processing',
      company: 'Sustainable Materials Co',
      email: 'budi@sustainable.com',
      phone: '+62 814 5678 9012',
      totalPurchases: 5200000,
      lastPurchase: '2024-07-15',
      status: 'Inactive',
    },
  ];

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Sustainability Manager',
      department: 'Environmental',
      type: 'Full-time',
      location: 'Jakarta Pusat',
      salary: {
        min: 15000000,
        max: 25000000,
        currency: 'IDR',
      },
      status: 'Open',
      datePosted: '2024-07-20',
      deadline: '2024-08-20',
      description:
        'Lead our sustainability initiatives and develop environmental strategies for circular economy practices.',
      requirements: [
        "Bachelor's degree in Environmental Science or related field",
        '3+ years experience in sustainability management',
        'Knowledge of circular economy principles',
        'Strong analytical and communication skills',
      ],
      applications: 15,
      views: 89,
      experience: '3-5 years',
      education: "Bachelor's Degree",
      skills: ['Sustainability', 'Environmental Management', 'Data Analysis', 'Project Management'],
    },
    {
      id: '2',
      title: 'Waste Processing Technician',
      department: 'Operations',
      type: 'Full-time',
      location: 'Jakarta Timur',
      salary: {
        min: 8000000,
        max: 12000000,
        currency: 'IDR',
      },
      status: 'Open',
      datePosted: '2024-07-22',
      deadline: '2024-08-15',
      description:
        'Operate and maintain waste processing equipment, ensure quality control in recycling operations.',
      requirements: [
        'Technical diploma or equivalent',
        '2+ years experience in manufacturing/processing',
        'Knowledge of safety protocols',
        'Ability to work in shifts',
      ],
      applications: 8,
      views: 45,
      experience: '2-3 years',
      education: 'Diploma',
      skills: ['Equipment Operation', 'Quality Control', 'Safety Protocols', 'Technical Skills'],
    },
    {
      id: '3',
      title: 'Business Development Intern',
      department: 'Business Development',
      type: 'Internship',
      location: 'Jakarta Selatan',
      salary: {
        min: 3000000,
        max: 4000000,
        currency: 'IDR',
      },
      status: 'Closed',
      datePosted: '2024-07-10',
      deadline: '2024-07-25',
      description:
        'Support business development activities, market research, and partnership coordination.',
      requirements: [
        "Currently pursuing Bachelor's degree in Business or related field",
        'Strong communication skills',
        'Interest in sustainability and circular economy',
        'Proficiency in Microsoft Office',
      ],
      applications: 25,
      views: 120,
      experience: 'Entry Level',
      education: "Bachelor's Degree (In Progress)",
      skills: ['Market Research', 'Communication', 'Microsoft Office', 'Business Analysis'],
    },
    {
      id: '4',
      title: 'Environmental Compliance Officer',
      department: 'Legal & Compliance',
      type: 'Contract',
      location: 'Jakarta Barat',
      salary: {
        min: 12000000,
        max: 18000000,
        currency: 'IDR',
      },
      status: 'On Hold',
      datePosted: '2024-07-18',
      deadline: '2024-08-30',
      description:
        'Ensure compliance with environmental regulations, manage permits and reporting requirements.',
      requirements: [
        "Bachelor's degree in Law, Environmental Science, or related field",
        '3+ years experience in environmental compliance',
        'Knowledge of Indonesian environmental regulations',
        'Strong attention to detail',
      ],
      applications: 6,
      views: 32,
      experience: '3-5 years',
      education: "Bachelor's Degree",
      skills: ['Environmental Law', 'Compliance', 'Regulatory Knowledge', 'Documentation'],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
      case 'Open':
        return COLORS.success;
      case 'Sold':
      case 'Completed':
        return COLORS.primary;
      case 'In Progress':
        return COLORS.info;
      case 'Pending':
      case 'Draft':
        return COLORS.warning;
      case 'Expired':
      case 'Cancelled':
      case 'Inactive':
      case 'Closed':
      case 'On Hold':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const filteredListings = wasteListings.filter(
    listing =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projectRequests.filter(
    project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBuyers = buyers.filter(
    buyer =>
      buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(
    job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderListingCard = (listing: WasteListing) => (
    <TouchableOpacity
      key={listing.id}
      style={styles.card}
      onPress={() => {
        setSelectedItem(listing);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{listing.title}</Text>
          <Text style={styles.cardType}>{listing.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
          <Text style={styles.statusText}>{listing.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardMeta}>
          <FontAwesome name="balance-scale" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            {listing.quantity} {listing.unit}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="money" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>Rp{listing.price.toLocaleString()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="map-marker" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{listing.location}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <FontAwesome name="eye" size={12} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{listing.views}</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome name="comment" size={12} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{listing.inquiries}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{new Date(listing.datePosted).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderProjectCard = (project: ProjectRequest) => (
    <TouchableOpacity
      key={project.id}
      style={styles.card}
      onPress={() => {
        setSelectedItem(project);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{project.title}</Text>
          <Text style={styles.cardType}>{project.type}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardMeta}>
          <FontAwesome name="money" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>Rp{project.budget.toLocaleString()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="calendar" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{new Date(project.deadline).toLocaleDateString()}</Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="users" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{project.proposals} proposals</Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {project.description}
      </Text>

      <View style={styles.cardFooter}>
        {project.selectedRecycler && (
          <View style={styles.selectedRecycler}>
            <FontAwesome name="check-circle" size={12} color={COLORS.success} />
            <Text style={styles.selectedText}>{project.selectedRecycler}</Text>
          </View>
        )}
        <Text style={styles.dateText}>{new Date(project.datePosted).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderBuyerCard = (buyer: Buyer) => (
    <TouchableOpacity
      key={buyer.id}
      style={styles.card}
      onPress={() => {
        setSelectedItem(buyer);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.buyerInfo}>
          <View style={styles.buyerAvatar}>
            <Text style={styles.buyerAvatarText}>{buyer.name.charAt(0)}</Text>
          </View>
          <View style={styles.buyerDetails}>
            <Text style={styles.cardTitle}>{buyer.name}</Text>
            <Text style={styles.cardType}>{buyer.company}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(buyer.status) }]}>
          <Text style={styles.statusText}>{buyer.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardMeta}>
          <FontAwesome name="envelope" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{buyer.email}</Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="phone" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{buyer.phone}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.buyerStats}>
          <Text style={styles.purchaseAmount}>Rp{buyer.totalPurchases.toLocaleString()}</Text>
          <Text style={styles.purchaseLabel}>Total Purchases</Text>
        </View>
        <Text style={styles.dateText}>
          Last: {new Date(buyer.lastPurchase).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderJobCard = (job: Job) => (
    <TouchableOpacity
      key={job.id}
      style={styles.card}
      onPress={() => {
        setSelectedItem(job);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{job.title}</Text>
          <Text style={styles.cardType}>
            {job.department} • {job.type}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.cardMeta}>
          <FontAwesome name="map-marker" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{job.location}</Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="money" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            Rp{job.salary.min.toLocaleString()} - Rp{job.salary.max.toLocaleString()}
          </Text>
        </View>
        <View style={styles.cardMeta}>
          <FontAwesome name="calendar" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {job.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <FontAwesome name="eye" size={12} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{job.views}</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome name="users" size={12} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{job.applications} applications</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{new Date(job.datePosted).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Business Management</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeTab === 'listings') {
              router.push('/waste-listing/create');
            } else if (activeTab === 'projects') {
              router.push('/project-request/create');
            } else if (activeTab === 'jobs') {
              router.push('/job/create');
            }
          }}
        >
          <FontAwesome name="plus" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Waste
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
          onPress={() => setActiveTab('projects')}
        >
          <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
            Projects
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buyers' && styles.activeTab]}
          onPress={() => setActiveTab('buyers')}
        >
          <Text style={[styles.tabText, activeTab === 'buyers' && styles.activeTabText]}>
            Buyers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'jobs' && styles.activeTab]}
          onPress={() => setActiveTab('jobs')}
        >
          <Text style={[styles.tabText, activeTab === 'jobs' && styles.activeTabText]}>Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'listings' && filteredListings.map(renderListingCard)}
        {activeTab === 'projects' && filteredProjects.map(renderProjectCard)}
        {activeTab === 'buyers' && filteredBuyers.map(renderBuyerCard)}
        {activeTab === 'jobs' && filteredJobs.map(renderJobCard)}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedItem && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalBackBtn}
              >
                <FontAwesome name="arrow-left" size={20} color="#386B5F" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {activeTab === 'listings'
                  ? 'Listing Details'
                  : activeTab === 'projects'
                    ? 'Project Details'
                    : activeTab === 'buyers'
                      ? 'Buyer Details'
                      : 'Job Details'}
              </Text>
              <TouchableOpacity style={styles.modalEditBtn}>
                <FontAwesome name="edit" size={20} color="#386B5F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {activeTab === 'listings' && (
                <View>
                  <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalItemType}>{selectedItem.type}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Details</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Quantity</Text>
                        <Text style={styles.modalInfoValue}>
                          {selectedItem.quantity} {selectedItem.unit}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Price</Text>
                        <Text style={styles.modalInfoValue}>
                          Rp{selectedItem.price.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Location</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.location}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Status</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Performance</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Views</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.views}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Inquiries</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.inquiries}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                  </View>
                </View>
              )}

              {activeTab === 'projects' && (
                <View>
                  <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalItemType}>{selectedItem.type}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Project Details</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Budget</Text>
                        <Text style={styles.modalInfoValue}>
                          Rp{selectedItem.budget.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Deadline</Text>
                        <Text style={styles.modalInfoValue}>
                          {new Date(selectedItem.deadline).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Proposals</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.proposals}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Status</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Requirements</Text>
                    {selectedItem.requirements.map((req: string, index: number) => (
                      <View key={index} style={styles.requirementItem}>
                        <FontAwesome name="check" size={12} color={COLORS.success} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                  </View>
                </View>
              )}

              {activeTab === 'buyers' && (
                <View>
                  <Text style={styles.modalItemTitle}>{selectedItem.name}</Text>
                  <Text style={styles.modalItemType}>{selectedItem.company}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Contact Information</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Email</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.email}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Phone</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.phone}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Status</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Purchase History</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Total Purchases</Text>
                        <Text style={styles.modalInfoValue}>
                          Rp{selectedItem.totalPurchases.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Last Purchase</Text>
                        <Text style={styles.modalInfoValue}>
                          {new Date(selectedItem.lastPurchase).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === 'jobs' && (
                <View>
                  <Text style={styles.modalItemTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalItemType}>
                    {selectedItem.department} • {selectedItem.type}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Job Details</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Location</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.location}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Salary Range</Text>
                        <Text style={styles.modalInfoValue}>
                          Rp{selectedItem.salary.min.toLocaleString()} - Rp
                          {selectedItem.salary.max.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Experience</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.experience}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Education</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.education}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Deadline</Text>
                        <Text style={styles.modalInfoValue}>
                          {new Date(selectedItem.deadline).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Status</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.status}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Performance</Text>
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Views</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.views}</Text>
                      </View>
                      <View style={styles.modalInfoItem}>
                        <Text style={styles.modalInfoLabel}>Applications</Text>
                        <Text style={styles.modalInfoValue}>{selectedItem.applications}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Required Skills</Text>
                    <View style={styles.skillsContainer}>
                      {selectedItem.skills.map((skill: string, index: number) => (
                        <View key={index} style={styles.skillBadge}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Requirements</Text>
                    {selectedItem.requirements.map((req: string, index: number) => (
                      <View key={index} style={styles.requirementItem}>
                        <FontAwesome name="check" size={12} color={COLORS.success} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                  </View>
                </View>
              )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  buyerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buyerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buyerAvatarText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  buyerDetails: {
    flex: 1,
  },
  buyerStats: {
    alignItems: 'flex-start',
  },
  purchaseAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  purchaseLabel: {
    fontSize: 10,
    color: '#666',
  },
  selectedRecycler: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
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
  modalEditBtn: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalItemTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalItemType: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  modalInfoItem: {
    flex: 1,
    minWidth: '45%',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#E6F3EC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
