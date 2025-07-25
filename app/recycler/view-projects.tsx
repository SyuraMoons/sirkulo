import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  endDate?: string;
  estimatedCompletion: string;
  budget: number;
  actualCost?: number;
  materials: {
    type: string;
    quantity: number;
    unit: string;
    processed: number;
  }[];
  team: {
    name: string;
    role: string;
    avatar?: any;
  }[];
  progress: number;
  location: string;
  client: string;
  environmentalImpact: {
    co2Saved: number;
    wasteProcessed: number;
    energySaved: number;
  };
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
  }[];
}

export default function ViewProjects() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Mock projects data
  const projects: Project[] = [
    {
      id: '1',
      title: 'Jakarta Plastic Recycling Initiative',
      description:
        'Large-scale plastic waste processing project focusing on PET bottles and packaging materials from commercial sources.',
      category: 'Plastic Processing',
      status: 'Active',
      priority: 'High',
      startDate: '2024-06-01',
      estimatedCompletion: '2024-09-30',
      budget: 150000000,
      actualCost: 89000000,
      materials: [
        { type: 'PET Bottles', quantity: 5000, unit: 'kg', processed: 3200 },
        { type: 'Plastic Packaging', quantity: 2500, unit: 'kg', processed: 1800 },
        { type: 'Mixed Plastics', quantity: 1500, unit: 'kg', processed: 900 },
      ],
      team: [
        {
          name: 'Ahmad Recycling',
          role: 'Project Lead',
          avatar: require('@/assets/images/icon.png'),
        },
        {
          name: 'Sari Waste Management',
          role: 'Operations',
          avatar: require('@/assets/images/icon.png'),
        },
        {
          name: 'Budi Processing',
          role: 'Quality Control',
          avatar: require('@/assets/images/icon.png'),
        },
      ],
      progress: 65,
      location: 'Jakarta Selatan',
      client: 'Jakarta Environmental Agency',
      environmentalImpact: {
        co2Saved: 12.5,
        wasteProcessed: 9000,
        energySaved: 8500,
      },
      milestones: [
        { id: '1', title: 'Material Collection Setup', completed: true, dueDate: '2024-06-15' },
        {
          id: '2',
          title: 'Processing Equipment Installation',
          completed: true,
          dueDate: '2024-07-01',
        },
        {
          id: '3',
          title: 'Quality Standards Implementation',
          completed: false,
          dueDate: '2024-08-15',
        },
        { id: '4', title: 'Final Processing & Delivery', completed: false, dueDate: '2024-09-30' },
      ],
    },
    {
      id: '2',
      title: 'Electronic Waste Recovery Program',
      description:
        'Comprehensive e-waste processing project targeting circuit boards, cables, and electronic components from corporate sources.',
      category: 'Electronic Processing',
      status: 'Planning',
      priority: 'Medium',
      startDate: '2024-08-01',
      estimatedCompletion: '2024-12-31',
      budget: 200000000,
      materials: [
        { type: 'Circuit Boards', quantity: 800, unit: 'kg', processed: 0 },
        { type: 'Cables & Wires', quantity: 1200, unit: 'kg', processed: 0 },
        { type: 'Metal Components', quantity: 600, unit: 'kg', processed: 0 },
      ],
      team: [
        {
          name: 'TechRecycle Solutions',
          role: 'Project Lead',
          avatar: require('@/assets/images/icon.png'),
        },
        {
          name: 'Digital Waste Experts',
          role: 'Technical Specialist',
          avatar: require('@/assets/images/icon.png'),
        },
      ],
      progress: 15,
      location: 'Jakarta Pusat',
      client: 'Corporate Technology Alliance',
      environmentalImpact: {
        co2Saved: 0,
        wasteProcessed: 0,
        energySaved: 0,
      },
      milestones: [
        { id: '1', title: 'Project Planning & Permits', completed: true, dueDate: '2024-07-15' },
        { id: '2', title: 'Equipment Procurement', completed: false, dueDate: '2024-08-15' },
        { id: '3', title: 'Facility Setup', completed: false, dueDate: '2024-09-01' },
        { id: '4', title: 'Processing Operations', completed: false, dueDate: '2024-10-01' },
      ],
    },
    {
      id: '3',
      title: 'Paper Mill Waste Processing',
      description:
        'Office paper and cardboard recycling project with focus on high-quality output for manufacturing.',
      category: 'Paper Processing',
      status: 'Completed',
      priority: 'Low',
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      estimatedCompletion: '2024-06-30',
      budget: 75000000,
      actualCost: 68000000,
      materials: [
        { type: 'Office Paper', quantity: 8000, unit: 'kg', processed: 8000 },
        { type: 'Cardboard', quantity: 4000, unit: 'kg', processed: 4000 },
        { type: 'Mixed Paper', quantity: 2000, unit: 'kg', processed: 2000 },
      ],
      team: [
        {
          name: 'Paper Solutions Inc',
          role: 'Project Lead',
          avatar: require('@/assets/images/icon.png'),
        },
        { name: 'Green Paper Co', role: 'Processing', avatar: require('@/assets/images/icon.png') },
      ],
      progress: 100,
      location: 'Jakarta Barat',
      client: 'Paper Manufacturing Corp',
      environmentalImpact: {
        co2Saved: 18.2,
        wasteProcessed: 14000,
        energySaved: 12000,
      },
      milestones: [
        { id: '1', title: 'Collection & Sorting', completed: true, dueDate: '2024-03-15' },
        { id: '2', title: 'Processing & Quality Check', completed: true, dueDate: '2024-05-15' },
        { id: '3', title: 'Final Delivery', completed: true, dueDate: '2024-06-30' },
      ],
    },
    {
      id: '4',
      title: 'Metal Scrap Recovery Initiative',
      description:
        'Industrial metal waste processing focusing on steel, aluminum, and copper recovery from automotive and construction sources.',
      category: 'Metal Processing',
      status: 'On Hold',
      priority: 'Medium',
      startDate: '2024-07-01',
      estimatedCompletion: '2024-11-30',
      budget: 180000000,
      materials: [
        { type: 'Steel Scrap', quantity: 3000, unit: 'kg', processed: 500 },
        { type: 'Aluminum', quantity: 1500, unit: 'kg', processed: 200 },
        { type: 'Copper Components', quantity: 800, unit: 'kg', processed: 100 },
      ],
      team: [
        {
          name: 'MetalWorks Recycling',
          role: 'Project Lead',
          avatar: require('@/assets/images/icon.png'),
        },
        {
          name: 'Industrial Recovery',
          role: 'Operations',
          avatar: require('@/assets/images/icon.png'),
        },
      ],
      progress: 25,
      location: 'Jakarta Timur',
      client: 'Industrial Development Authority',
      environmentalImpact: {
        co2Saved: 3.2,
        wasteProcessed: 800,
        energySaved: 1500,
      },
      milestones: [
        { id: '1', title: 'Site Preparation', completed: true, dueDate: '2024-07-15' },
        { id: '2', title: 'Equipment Installation', completed: false, dueDate: '2024-08-01' },
        { id: '3', title: 'Processing Operations', completed: false, dueDate: '2024-09-01' },
      ],
    },
  ];

  const statusOptions = ['All', 'Planning', 'Active', 'Completed', 'On Hold'];

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return COLORS.success;
      case 'Planning':
        return COLORS.info;
      case 'Completed':
        return COLORS.primary;
      case 'On Hold':
        return COLORS.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return COLORS.error;
      case 'Medium':
        return COLORS.warning;
      case 'Low':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderProjectCard = (project: Project) => (
    <TouchableOpacity
      key={project.id}
      style={styles.projectCard}
      onPress={() => {
        setSelectedProject(project);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectCategory}>{project.category}</Text>
        </View>
        <View style={styles.projectBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
            <Text style={styles.statusText}>{project.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.projectDescription} numberOfLines={2}>
        {project.description}
      </Text>

      <View style={styles.projectProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{project.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
        </View>
      </View>

      <View style={styles.projectDetails}>
        <View style={styles.projectMeta}>
          <FontAwesome name="map-marker" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{project.location}</Text>
        </View>
        <View style={styles.projectMeta}>
          <FontAwesome name="user" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{project.client}</Text>
        </View>
        <View style={styles.projectMeta}>
          <FontAwesome name="calendar" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            {new Date(project.estimatedCompletion).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.projectFooter}>
        <View style={styles.teamAvatars}>
          {project.team.slice(0, 3).map((member, index) => (
            <View key={index} style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}>
              <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
            </View>
          ))}
          {project.team.length > 3 && (
            <View style={[styles.avatar, styles.moreAvatar, { marginLeft: -8 }]}>
              <Text style={styles.avatarText}>+{project.team.length - 3}</Text>
            </View>
          )}
        </View>
        <View
          style={[styles.priorityBadge, { backgroundColor: getPriorityColor(project.priority) }]}
        >
          <Text style={styles.priorityText}>{project.priority}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Projects</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(!showFilters)}>
          <FontAwesome name="filter" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map(status => (
              <TouchableOpacity
                key={status}
                style={[styles.statusChip, selectedStatus === status && styles.activeStatusChip]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    selectedStatus === status && styles.activeStatusChipText,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredProjects.length} projects found</Text>
      </View>

      {/* Projects List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredProjects.map(renderProjectCard)}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedProject && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalBackBtn}
              >
                <FontAwesome name="arrow-left" size={20} color="#386B5F" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Project Details</Text>
              <TouchableOpacity style={styles.modalShareBtn}>
                <FontAwesome name="share" size={20} color="#386B5F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalProjectHeader}>
                <Text style={styles.modalProjectTitle}>{selectedProject.title}</Text>
                <Text style={styles.modalProjectCategory}>{selectedProject.category}</Text>
                <View style={styles.modalProjectBadges}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedProject.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{selectedProject.status}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(selectedProject.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{selectedProject.priority} Priority</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalProjectProgress}>
                <Text style={styles.modalSectionTitle}>Progress</Text>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Completion</Text>
                  <Text style={styles.progressPercentage}>{selectedProject.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${selectedProject.progress}%` }]} />
                </View>
              </View>

              <View style={styles.modalProjectInfo}>
                <Text style={styles.modalSectionTitle}>Project Information</Text>
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Client</Text>
                    <Text style={styles.modalInfoValue}>{selectedProject.client}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Location</Text>
                    <Text style={styles.modalInfoValue}>{selectedProject.location}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Start Date</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(selectedProject.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Est. Completion</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(selectedProject.estimatedCompletion).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalBudgetInfo}>
                <Text style={styles.modalSectionTitle}>Budget & Costs</Text>
                <View style={styles.budgetGrid}>
                  <View style={styles.budgetItem}>
                    <Text style={styles.budgetLabel}>Total Budget</Text>
                    <Text style={styles.budgetValue}>
                      Rp{selectedProject.budget.toLocaleString()}
                    </Text>
                  </View>
                  {selectedProject.actualCost && (
                    <View style={styles.budgetItem}>
                      <Text style={styles.budgetLabel}>Actual Cost</Text>
                      <Text style={styles.budgetValue}>
                        Rp{selectedProject.actualCost.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalMaterials}>
                <Text style={styles.modalSectionTitle}>Materials Processing</Text>
                {selectedProject.materials.map((material, index) => (
                  <View key={index} style={styles.materialItem}>
                    <View style={styles.materialHeader}>
                      <Text style={styles.materialType}>{material.type}</Text>
                      <Text style={styles.materialQuantity}>
                        {material.processed}/{material.quantity} {material.unit}
                      </Text>
                    </View>
                    <View style={styles.materialProgress}>
                      <View style={styles.materialProgressBar}>
                        <View
                          style={[
                            styles.materialProgressFill,
                            { width: `${(material.processed / material.quantity) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.materialProgressText}>
                        {Math.round((material.processed / material.quantity) * 100)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.modalEnvironmentalImpact}>
                <Text style={styles.modalSectionTitle}>Environmental Impact</Text>
                <View style={styles.impactGrid}>
                  <View style={styles.impactItem}>
                    <FontAwesome name="leaf" size={20} color={COLORS.success} />
                    <Text style={styles.impactValue}>
                      {selectedProject.environmentalImpact.co2Saved} tons
                    </Text>
                    <Text style={styles.impactLabel}>CO₂ Saved</Text>
                  </View>
                  <View style={styles.impactItem}>
                    <FontAwesome name="recycle" size={20} color={COLORS.info} />
                    <Text style={styles.impactValue}>
                      {selectedProject.environmentalImpact.wasteProcessed} kg
                    </Text>
                    <Text style={styles.impactLabel}>Waste Processed</Text>
                  </View>
                  <View style={styles.impactItem}>
                    <FontAwesome name="bolt" size={20} color={COLORS.warning} />
                    <Text style={styles.impactValue}>
                      {selectedProject.environmentalImpact.energySaved} kWh
                    </Text>
                    <Text style={styles.impactLabel}>Energy Saved</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalTeam}>
                <Text style={styles.modalSectionTitle}>Team Members</Text>
                {selectedProject.team.map((member, index) => (
                  <View key={index} style={styles.teamMember}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                  </View>
                ))}
              </View>
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
  filterBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
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
  filtersContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  activeStatusChip: {
    backgroundColor: COLORS.primary,
  },
  statusChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeStatusChipText: {
    color: '#fff',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  projectCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  projectBadges: {
    flexDirection: 'row',
    gap: 8,
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
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E6E6E6',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  projectDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatar: {
    backgroundColor: '#666',
  },
  avatarText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
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
  modalShareBtn: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalProjectHeader: {
    marginBottom: 20,
  },
  modalProjectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalProjectCategory: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  modalProjectBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  modalProjectProgress: {
    marginBottom: 20,
  },
  modalProjectInfo: {
    marginBottom: 20,
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
  modalBudgetInfo: {
    marginBottom: 20,
  },
  budgetGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  budgetItem: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  budgetLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  budgetValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalMaterials: {
    marginBottom: 20,
  },
  materialItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  materialType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  materialQuantity: {
    fontSize: 12,
    color: '#666',
  },
  materialProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  materialProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E6E6E6',
    borderRadius: 2,
  },
  materialProgressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 2,
  },
  materialProgressText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  modalEnvironmentalImpact: {
    marginBottom: 20,
  },
  impactGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginTop: 8,
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  modalTeam: {
    marginBottom: 20,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
  },
});
