import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { COLORS } from '@/src/constants/features';

interface Job {
  id: string;
  title: string;
  description: string;
  materials: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  payment: number;
  location: string;
  deadline: string;
  requesterName: string;
  requesterRating: number;
  urgency: 'Low' | 'Medium' | 'High';
}

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

const SAMPLE_JOBS: Job[] = [
  {
    id: '1',
    title: 'Custom Tote Bag from Plastic Bottles',
    description:
      'Create a durable tote bag using recycled plastic bottles. Client wants a specific design with their logo.',
    materials: ['Plastic Bottles', 'Fabric Dye', 'Thread'],
    difficulty: 'Medium',
    estimatedTime: '3-4 days',
    payment: 250000,
    location: 'Jakarta Selatan',
    deadline: '2024-08-15',
    requesterName: 'Sarah M.',
    requesterRating: 4.8,
    urgency: 'Medium',
  },
  {
    id: '2',
    title: 'Decorative Plant Pots from Tin Cans',
    description: 'Transform old tin cans into beautiful decorative plant pots for a cafe interior.',
    materials: ['Tin Cans', 'Paint', 'Rope'],
    difficulty: 'Easy',
    estimatedTime: '1-2 days',
    payment: 150000,
    location: 'Jakarta Pusat',
    deadline: '2024-08-10',
    requesterName: 'Green Cafe',
    requesterRating: 4.9,
    urgency: 'High',
  },
  {
    id: '3',
    title: 'Furniture Set from Cardboard',
    description:
      'Design and create a complete furniture set for a temporary exhibition using cardboard materials.',
    materials: ['Cardboard', 'Glue', 'Paint'],
    difficulty: 'Hard',
    estimatedTime: '1-2 weeks',
    payment: 750000,
    location: 'Jakarta Barat',
    deadline: '2024-08-25',
    requesterName: 'Art Gallery XYZ',
    requesterRating: 4.7,
    urgency: 'Low',
  },
  {
    id: '4',
    title: 'Jewelry from Electronic Waste',
    description: 'Create unique jewelry pieces using components from old electronics.',
    materials: ['Circuit Boards', 'Wire', 'Beads'],
    difficulty: 'Medium',
    estimatedTime: '2-3 days',
    payment: 300000,
    location: 'Jakarta Timur',
    deadline: '2024-08-12',
    requesterName: 'Tech Boutique',
    requesterRating: 4.6,
    urgency: 'Medium',
  },
];

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatVisible, setChatVisible] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm interested in this job. Can you provide more details?",
      sent: true,
      time: '10:30',
    },
    {
      id: 2,
      text: 'Hello! Thanks for your interest. What would you like to know?',
      sent: false,
      time: '10:35',
    },
  ]);

  // Find the job by ID
  const job = SAMPLE_JOBS.find(item => item.id === id);

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'Hard':
        return '#F44336';
      default:
        return COLORS.text.secondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Low':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'High':
        return '#F44336';
      default:
        return COLORS.text.secondary;
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: chatMessages.length + 1,
        text: newMessage,
        sent: true,
        time: new Date().toLocaleTimeString().slice(0, 5),
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage('');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FontAwesome
        key={i}
        name={i < Math.round(rating) ? 'star' : 'star-o'}
        size={16}
        color="#FFD600"
        style={{ marginRight: 2 }}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#386B5F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.chatBtn} onPress={() => setChatVisible(true)}>
          <FontAwesome name="comment" size={20} color="#386B5F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(job.difficulty) },
                ]}
              >
                <Text style={styles.badgeText}>{job.difficulty}</Text>
              </View>
              <View
                style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) }]}
              >
                <Text style={styles.badgeText}>{job.urgency}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.payment}>Rp{job.payment.toLocaleString()}</Text>
        </View>

        {/* Job Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <FontAwesome name="clock-o" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{job.estimatedTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesome name="map-marker" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{job.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesome name="calendar" size={16} color={COLORS.text.secondary} />
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={styles.infoValue}>{new Date(job.deadline).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Materials</Text>
          <View style={styles.materialsList}>
            {job.materials.map((material, index) => (
              <View key={index} style={styles.materialChip}>
                <FontAwesome name="check" size={12} color="#4CAF50" />
                <Text style={styles.materialText}>{material}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Requester Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requester</Text>
          <View style={styles.requesterCard}>
            <View style={styles.requesterInfo}>
              <FontAwesome name="user-circle" size={40} color="#386B5F" />
              <View style={styles.requesterDetails}>
                <Text style={styles.requesterName}>{job.requesterName}</Text>
                <View style={styles.ratingContainer}>
                  {renderStars(job.requesterRating)}
                  <Text style={styles.ratingText}>{job.requesterRating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.contactBtn} onPress={() => setChatVisible(true)}>
              <FontAwesome name="comment" size={16} color="#fff" />
              <Text style={styles.contactBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.floatingButton}>
        <TouchableOpacity style={styles.applyBtn}>
          <FontAwesome name="handshake-o" size={20} color="#fff" />
          <Text style={styles.applyBtnText}>Apply for Job</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Modal */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatVisible(false)}
      >
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setChatVisible(false)} style={styles.chatBackBtn}>
              <FontAwesome name="arrow-left" size={20} color="#386B5F" />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>{job.requesterName}</Text>
              <Text style={styles.chatHeaderSubtitle}>Job: {job.title}</Text>
            </View>
          </View>

          <ScrollView style={styles.messagesList}>
            {chatMessages.map((message: Message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.sent ? styles.sentMessage : styles.receivedMessage,
                ]}
              >
                <Text style={[styles.messageText, !message.sent && styles.receivedMessageText]}>
                  {message.text}
                </Text>
                <Text style={[styles.messageTime, !message.sent && styles.receivedMessageTime]}>
                  {message.time}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <FontAwesome name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#386B5F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  chatBtn: {
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  jobHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  titleSection: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  payment: {
    fontSize: 28,
    fontWeight: '700',
    color: '#386B5F',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  materialsList: {
    gap: 8,
  },
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  materialText: {
    fontSize: 14,
    color: '#666',
  },
  requesterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requesterDetails: {
    marginLeft: 12,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#386B5F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  contactBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    padding: 4,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#386B5F',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Chat Modal Styles
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    backgroundColor: '#fff',
  },
  chatBackBtn: {
    marginRight: 16,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#386B5F',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F6F8',
  },
  messageText: {
    fontSize: 14,
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  receivedMessageText: {
    color: '#222',
  },
  receivedMessageTime: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#386B5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
