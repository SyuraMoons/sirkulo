import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Operation {
  id: string;
  name: string;
  type: 'Collection' | 'Processing' | 'Storage' | 'Transport' | 'Quality Control';
  status: 'Active' | 'Scheduled' | 'Completed' | 'Paused' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startTime: string;
  endTime?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  location: string;
  assignedTo: string[];
  materials: {
    type: string;
    quantity: number;
    unit: string;
    processed?: number;
  }[];
  equipment: string[];
  notes?: string;
  completionPercentage: number;
  qualityScore?: number;
  costs: {
    labor: number;
    equipment: number;
    materials: number;
    transport: number;
  };
}

interface NewOperation {
  name: string;
  type: string;
  priority: string;
  location: string;
  estimatedDuration: string;
  assignedTo: string;
  materials: string;
  equipment: string;
  notes: string;
}

export default function OperationManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [newOperationModalVisible, setNewOperationModalVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newOperation, setNewOperation] = useState<NewOperation>({
    name: '',
    type: 'Collection',
    priority: 'Medium',
    location: '',
    estimatedDuration: '',
    assignedTo: '',
    materials: '',
    equipment: '',
    notes: '',
  });

  // Mock operations data
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: '1',
      name: 'Plastic Collection - Jakarta Selatan',
      type: 'Collection',
      status: 'Active',
      priority: 'High',
      startTime: '2024-07-25T08:00:00',
      estimatedDuration: 6,
      actualDuration: 4.5,
      location: 'Jakarta Selatan District',
      assignedTo: ['Ahmad Collection Team', 'Sari Transport'],
      materials: [
        { type: 'PET Bottles', quantity: 500, unit: 'kg', processed: 320 },
        { type: 'Plastic Bags', quantity: 200, unit: 'kg', processed: 150 },
      ],
      equipment: ['Collection Truck', 'Sorting Equipment', 'Weighing Scale'],
      notes: 'Priority collection from commercial sources',
      completionPercentage: 75,
      qualityScore: 8.5,
      costs: {
        labor: 500000,
        equipment: 200000,
        materials: 50000,
        transport: 300000,
      },
    },
    {
      id: '2',
      name: 'E-Waste Processing Line Setup',
      type: 'Processing',
      status: 'Scheduled',
      priority: 'Medium',
      startTime: '2024-07-26T09:00:00',
      estimatedDuration: 8,
      location: 'Main Processing Facility',
      assignedTo: ['TechRecycle Team', 'Quality Control'],
      materials: [
        { type: 'Circuit Boards', quantity: 100, unit: 'kg' },
        { type: 'Cables', quantity: 150, unit: 'kg' },
      ],
      equipment: ['Disassembly Station', 'Component Separator', 'Testing Equipment'],
      notes: 'Setup new processing line for electronic components',
      completionPercentage: 0,
      costs: {
        labor: 800000,
        equipment: 1500000,
        materials: 100000,
        transport: 0,
      },
    },
    {
      id: '3',
      name: 'Paper Material Quality Check',
      type: 'Quality Control',
      status: 'Completed',
      priority: 'Low',
      startTime: '2024-07-24T10:00:00',
      endTime: '2024-07-24T14:00:00',
      estimatedDuration: 4,
      actualDuration: 4,
      location: 'Quality Control Lab',
      assignedTo: ['Quality Team A'],
      materials: [
        { type: 'Office Paper', quantity: 1000, unit: 'kg', processed: 1000 },
        { type: 'Cardboard', quantity: 500, unit: 'kg', processed: 500 },
      ],
      equipment: ['Testing Equipment', 'Moisture Meter', 'Contamination Scanner'],
      notes: 'Batch quality verification completed successfully',
      completionPercentage: 100,
      qualityScore: 9.2,
      costs: {
        labor: 300000,
        equipment: 100000,
        materials: 25000,
        transport: 0,
      },
    },
    {
      id: '4',
      name: 'Metal Scrap Storage Organization',
      type: 'Storage',
      status: 'Paused',
      priority: 'Medium',
      startTime: '2024-07-25T13:00:00',
      estimatedDuration: 5,
      actualDuration: 2,
      location: 'Warehouse B',
      assignedTo: ['Storage Team', 'Inventory Control'],
      materials: [
        { type: 'Steel Scrap', quantity: 800, unit: 'kg', processed: 300 },
        { type: 'Aluminum', quantity: 400, unit: 'kg', processed: 150 },
      ],
      equipment: ['Forklift', 'Storage Racks', 'Inventory Scanner'],
      notes: 'Paused due to equipment maintenance',
      completionPercentage: 40,
      costs: {
        labor: 400000,
        equipment: 150000,
        materials: 0,
        transport: 0,
      },
    },
    {
      id: '5',
      name: 'Processed Material Transport',
      type: 'Transport',
      status: 'Active',
      priority: 'Critical',
      startTime: '2024-07-25T14:00:00',
      estimatedDuration: 3,
      actualDuration: 1.5,
      location: 'Multiple Locations',
      assignedTo: ['Transport Team A', 'Logistics Coordinator'],
      materials: [
        { type: 'Recycled Plastic Pellets', quantity: 300, unit: 'kg', processed: 150 },
        { type: 'Processed Paper', quantity: 500, unit: 'kg', processed: 250 },
      ],
      equipment: ['Transport Truck', 'Loading Equipment', 'GPS Tracker'],
      notes: 'Urgent delivery to manufacturing partner',
      completionPercentage: 50,
      qualityScore: 8.8,
      costs: {
        labor: 200000,
        equipment: 100000,
        materials: 0,
        transport: 400000,
      },
    },
  ]);

  const statusOptions = ['All', 'Active', 'Scheduled', 'Completed', 'Paused', 'Cancelled'];
  const typeOptions = ['Collection', 'Processing', 'Storage', 'Transport', 'Quality Control'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  const filteredOperations = operations.filter(operation => {
    const matchesSearch =
      operation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operation.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || operation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return COLORS.success;
      case 'Scheduled':
        return COLORS.info;
      case 'Completed':
        return COLORS.primary;
      case 'Paused':
        return COLORS.warning;
      case 'Cancelled':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '#FF4444';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Collection':
        return 'truck';
      case 'Processing':
        return 'cogs';
      case 'Storage':
        return 'archive';
      case 'Transport':
        return 'truck';
      case 'Quality Control':
        return 'check-circle';
      default:
        return 'circle';
    }
  };

  const handleCreateOperation = () => {
    if (!newOperation.name || !newOperation.location || !newOperation.estimatedDuration) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const operation: Operation = {
      id: (operations.length + 1).toString(),
      name: newOperation.name,
      type: newOperation.type as any,
      status: 'Scheduled',
      priority: newOperation.priority as any,
      startTime: new Date().toISOString(),
      estimatedDuration: parseFloat(newOperation.estimatedDuration),
      location: newOperation.location,
      assignedTo: newOperation.assignedTo
        .split(',')
        .map(s => s.trim())
        .filter(s => s),
      materials: newOperation.materials
        .split(',')
        .map(m => ({
          type: m.trim(),
          quantity: 0,
          unit: 'kg',
        }))
        .filter(m => m.type),
      equipment: newOperation.equipment
        .split(',')
        .map(e => e.trim())
        .filter(e => e),
      notes: newOperation.notes,
      completionPercentage: 0,
      costs: {
        labor: 0,
        equipment: 0,
        materials: 0,
        transport: 0,
      },
    };

    setOperations([operation, ...operations]);
    setNewOperationModalVisible(false);
    setNewOperation({
      name: '',
      type: 'Collection',
      priority: 'Medium',
      location: '',
      estimatedDuration: '',
      assignedTo: '',
      materials: '',
      equipment: '',
      notes: '',
    });
    Alert.alert('Success', 'Operation created successfully');
  };

  const handleUpdateOperationStatus = (operationId: string, newStatus: string) => {
    setOperations(
      operations.map(op => (op.id === operationId ? { ...op, status: newStatus as any } : op))
    );
    Alert.alert('Success', `Operation status updated to ${newStatus}`);
  };

  const renderOperationCard = (operation: Operation) => (
    <TouchableOpacity
      key={operation.id}
      style={styles.operationCard}
      onPress={() => {
        setSelectedOperation(operation);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.operationHeader}>
        <View style={styles.operationTypeIcon}>
          <FontAwesome name={getTypeIcon(operation.type)} size={16} color={COLORS.primary} />
        </View>
        <View style={styles.operationInfo}>
          <Text style={styles.operationName}>{operation.name}</Text>
          <Text style={styles.operationType}>{operation.type}</Text>
        </View>
        <View style={styles.operationBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(operation.status) }]}>
            <Text style={styles.statusText}>{operation.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.operationProgress}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{operation.completionPercentage}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${operation.completionPercentage}%` }]} />
        </View>
      </View>

      <View style={styles.operationDetails}>
        <View style={styles.operationMeta}>
          <FontAwesome name="map-marker" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{operation.location}</Text>
        </View>
        <View style={styles.operationMeta}>
          <FontAwesome name="clock-o" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>
            {operation.actualDuration || operation.estimatedDuration}h
          </Text>
        </View>
        <View style={styles.operationMeta}>
          <FontAwesome name="users" size={12} color={COLORS.text.secondary} />
          <Text style={styles.metaText}>{operation.assignedTo.length} assigned</Text>
        </View>
      </View>

      <View style={styles.operationFooter}>
        <View
          style={[styles.priorityBadge, { backgroundColor: getPriorityColor(operation.priority) }]}
        >
          <Text style={styles.priorityText}>{operation.priority}</Text>
        </View>
        {operation.qualityScore && (
          <View style={styles.qualityScore}>
            <FontAwesome name="star" size={12} color={COLORS.warning} />
            <Text style={styles.qualityText}>{operation.qualityScore}/10</Text>
          </View>
        )}
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
        <Text style={styles.headerTitle}>Operation Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setNewOperationModalVisible(true)}>
          <FontAwesome name="plus" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesome name="search" size={16} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search operations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
          <FontAwesome name="filter" size={16} color="#386B5F" />
        </TouchableOpacity>
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
        <Text style={styles.resultsText}>{filteredOperations.length} operations found</Text>
      </View>

      {/* Operations List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredOperations.map(renderOperationCard)}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        {selectedOperation && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalBackBtn}
              >
                <FontAwesome name="arrow-left" size={20} color="#386B5F" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Operation Details</Text>
              <TouchableOpacity style={styles.modalEditBtn}>
                <FontAwesome name="edit" size={20} color="#386B5F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.modalOperationHeader}>
                <Text style={styles.modalOperationName}>{selectedOperation.name}</Text>
                <Text style={styles.modalOperationType}>{selectedOperation.type}</Text>
                <View style={styles.modalOperationBadges}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedOperation.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{selectedOperation.status}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(selectedOperation.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{selectedOperation.priority} Priority</Text>
                  </View>
                </View>
              </View>

              {selectedOperation.status === 'Active' && (
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.warning }]}
                    onPress={() => handleUpdateOperationStatus(selectedOperation.id, 'Paused')}
                  >
                    <FontAwesome name="pause" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => handleUpdateOperationStatus(selectedOperation.id, 'Completed')}
                  >
                    <FontAwesome name="check" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedOperation.status === 'Paused' && (
                <View style={styles.quickActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => handleUpdateOperationStatus(selectedOperation.id, 'Active')}
                  >
                    <FontAwesome name="play" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
                    onPress={() => handleUpdateOperationStatus(selectedOperation.id, 'Cancelled')}
                  >
                    <FontAwesome name="times" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalOperationProgress}>
                <Text style={styles.modalSectionTitle}>Progress</Text>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Overall Completion</Text>
                  <Text style={styles.progressPercentage}>
                    {selectedOperation.completionPercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${selectedOperation.completionPercentage}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.modalOperationInfo}>
                <Text style={styles.modalSectionTitle}>Operation Information</Text>
                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Location</Text>
                    <Text style={styles.modalInfoValue}>{selectedOperation.location}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Start Time</Text>
                    <Text style={styles.modalInfoValue}>
                      {new Date(selectedOperation.startTime).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Duration</Text>
                    <Text style={styles.modalInfoValue}>
                      {selectedOperation.actualDuration || selectedOperation.estimatedDuration}h
                    </Text>
                  </View>
                  {selectedOperation.qualityScore && (
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Quality Score</Text>
                      <Text style={styles.modalInfoValue}>{selectedOperation.qualityScore}/10</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalCostInfo}>
                <Text style={styles.modalSectionTitle}>Cost Breakdown</Text>
                <View style={styles.costGrid}>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>Labor</Text>
                    <Text style={styles.costValue}>
                      Rp{selectedOperation.costs.labor.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>Equipment</Text>
                    <Text style={styles.costValue}>
                      Rp{selectedOperation.costs.equipment.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>Materials</Text>
                    <Text style={styles.costValue}>
                      Rp{selectedOperation.costs.materials.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text style={styles.costLabel}>Transport</Text>
                    <Text style={styles.costValue}>
                      Rp{selectedOperation.costs.transport.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.totalCost}>
                  <Text style={styles.totalCostLabel}>Total Cost</Text>
                  <Text style={styles.totalCostValue}>
                    Rp
                    {Object.values(selectedOperation.costs)
                      .reduce((a, b) => a + b, 0)
                      .toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.modalMaterials}>
                <Text style={styles.modalSectionTitle}>Materials</Text>
                {selectedOperation.materials.map((material, index) => (
                  <View key={index} style={styles.materialItem}>
                    <View style={styles.materialHeader}>
                      <Text style={styles.materialType}>{material.type}</Text>
                      <Text style={styles.materialQuantity}>
                        {material.processed || 0}/{material.quantity} {material.unit}
                      </Text>
                    </View>
                    {material.processed !== undefined && (
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
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.modalTeam}>
                <Text style={styles.modalSectionTitle}>Assigned Team</Text>
                {selectedOperation.assignedTo.map((member, index) => (
                  <View key={index} style={styles.teamMember}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{member.charAt(0)}</Text>
                    </View>
                    <Text style={styles.memberName}>{member}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalEquipment}>
                <Text style={styles.modalSectionTitle}>Equipment</Text>
                <View style={styles.equipmentList}>
                  {selectedOperation.equipment.map((equipment, index) => (
                    <View key={index} style={styles.equipmentItem}>
                      <FontAwesome name="wrench" size={14} color={COLORS.primary} />
                      <Text style={styles.equipmentText}>{equipment}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {selectedOperation.notes && (
                <View style={styles.modalNotes}>
                  <Text style={styles.modalSectionTitle}>Notes</Text>
                  <Text style={styles.notesText}>{selectedOperation.notes}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* New Operation Modal */}
      <Modal
        visible={newOperationModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNewOperationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setNewOperationModalVisible(false)}
              style={styles.modalBackBtn}
            >
              <FontAwesome name="times" size={20} color="#386B5F" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Operation</Text>
            <TouchableOpacity style={styles.modalSaveBtn} onPress={handleCreateOperation}>
              <FontAwesome name="check" size={20} color="#386B5F" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Operation Name *</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.name}
                onChangeText={text => setNewOperation({ ...newOperation, name: text })}
                placeholder="Enter operation name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {typeOptions.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionChip,
                      newOperation.type === type && styles.activeOptionChip,
                    ]}
                    onPress={() => setNewOperation({ ...newOperation, type })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        newOperation.type === type && styles.activeOptionChipText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Priority</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {priorityOptions.map(priority => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.optionChip,
                      newOperation.priority === priority && styles.activeOptionChip,
                    ]}
                    onPress={() => setNewOperation({ ...newOperation, priority })}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        newOperation.priority === priority && styles.activeOptionChipText,
                      ]}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Location *</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.location}
                onChangeText={text => setNewOperation({ ...newOperation, location: text })}
                placeholder="Enter location"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Estimated Duration (hours) *</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.estimatedDuration}
                onChangeText={text => setNewOperation({ ...newOperation, estimatedDuration: text })}
                placeholder="Enter duration in hours"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Assigned To (comma separated)</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.assignedTo}
                onChangeText={text => setNewOperation({ ...newOperation, assignedTo: text })}
                placeholder="Enter team members"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Materials (comma separated)</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.materials}
                onChangeText={text => setNewOperation({ ...newOperation, materials: text })}
                placeholder="Enter materials"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Equipment (comma separated)</Text>
              <TextInput
                style={styles.formInput}
                value={newOperation.equipment}
                onChangeText={text => setNewOperation({ ...newOperation, equipment: text })}
                placeholder="Enter equipment"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newOperation.notes}
                onChangeText={text => setNewOperation({ ...newOperation, notes: text })}
                placeholder="Enter additional notes"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
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
  addBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
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
  filterToggle: {
    padding: 12,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
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
  operationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  operationTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  operationInfo: {
    flex: 1,
  },
  operationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  operationType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  operationBadges: {
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
  operationProgress: {
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
  operationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  operationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  operationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  qualityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityText: {
    fontSize: 12,
    color: '#666',
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
  modalSaveBtn: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalOperationHeader: {
    marginBottom: 20,
  },
  modalOperationName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  modalOperationType: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  modalOperationBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  modalOperationProgress: {
    marginBottom: 20,
  },
  modalOperationInfo: {
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
  modalCostInfo: {
    marginBottom: 20,
  },
  costGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  costItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  costLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  costValue: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
  },
  totalCostLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  totalCostValue: {
    fontSize: 16,
    color: '#fff',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  modalEquipment: {
    marginBottom: 20,
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  equipmentText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
  },
  modalNotes: {
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  // Form Styles
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  activeOptionChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeOptionChipText: {
    color: '#fff',
  },
});
