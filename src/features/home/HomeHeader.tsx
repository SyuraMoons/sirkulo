import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { USER_MODES, UserMode } from '@/src/constants/chat';

interface MeasurableView extends View {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
}

export function ModeSwitcher({
  mode,
  setMode,
}: {
  mode: UserMode;
  setMode: (m: UserMode) => void;
}) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [buttonLayout, setButtonLayout] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = React.useRef<MeasurableView>(null);

  const handleButtonPress = () => {
    if (buttonRef.current) {
      type MeasureCallback = (x: number, y: number, width: number, height: number) => void;
      const measureCallback: MeasureCallback = (x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setModalVisible(true);
      };
      buttonRef.current.measureInWindow(measureCallback);
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity ref={buttonRef} style={styles.modeButton} onPress={handleButtonPress}>
        <Text style={styles.modeText}>{mode}</Text>
        <FontAwesome name="chevron-down" size={16} color="#386B5F" style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalContent,
              {
                position: 'absolute',
                top: buttonLayout.y + buttonLayout.height + 8,
                left: buttonLayout.x,
                minWidth: buttonLayout.width,
              },
            ]}
          >
            {USER_MODES.map(modeOption => (
              <TouchableOpacity
                key={modeOption}
                style={styles.modalItem}
                onPress={() => {
                  setMode(modeOption);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[styles.modalItemText, modeOption === mode && styles.selectedModeText]}
                >
                  {modeOption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface HomeHeaderProps {
  mode: UserMode;
  setMode: (mode: UserMode) => void;
}

// Mock notification data
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Project Request',
    message: 'You have received a new recycling project request',
    time: '2 minutes ago',
    read: false,
    type: 'project',
  },
  {
    id: '2',
    title: 'Waste Listing Updated',
    message: 'Your plastic waste listing has been updated',
    time: '1 hour ago',
    read: false,
    type: 'listing',
  },
  {
    id: '3',
    title: 'Partnership Approved',
    message: 'Your partnership request with EcoRecycle has been approved',
    time: '3 hours ago',
    read: true,
    type: 'partnership',
  },
  {
    id: '4',
    title: 'Payment Received',
    message: 'You have received payment for completed project',
    time: '1 day ago',
    read: true,
    type: 'payment',
  },
];

export default function HomeHeader({ mode, setMode }: HomeHeaderProps) {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationPress = () => {
    setNotificationModalVisible(true);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project':
        return 'lightbulb-o';
      case 'listing':
        return 'list';
      case 'partnership':
        return 'handshake-o';
      case 'payment':
        return 'dollar';
      default:
        return 'bell';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Left Section - Welcome Text */}
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>
            Welcome back, <Text style={styles.greenText}>John</Text>
          </Text>
        </View>

        {/* Middle Section - Mode Switcher Dropdown */}
        <View style={styles.middleSection}>
          <ModeSwitcher mode={mode} setMode={setMode} />
        </View>

        {/* Right Section - Notification */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <FontAwesome name="bell" size={20} color="#386B5F" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Modal */}
      <Modal
        visible={notificationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationModalVisible(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContent}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <View style={styles.notificationHeaderActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllAsRead}>
                    <Text style={styles.markAllReadText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setNotificationModalVisible(false)}
                >
                  <FontAwesome name="times" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.notificationList}>
              {notifications.map(notification => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.read && styles.unreadNotification]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={styles.notificationIconContainer}>
                    <FontAwesome
                      name={getNotificationIcon(notification.type) as any}
                      size={16}
                      color="#386B5F"
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationItemTitle,
                        !notification.read && styles.unreadText,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationItemMessage}>{notification.message}</Text>
                    <Text style={styles.notificationItemTime}>{notification.time}</Text>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  leftSection: {
    flex: 1,
  },
  middleSection: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  greenText: {
    color: '#386B5F',
    fontWeight: '700',
  },
  // Customer Mode Button Styles
  customerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  customerButtonText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 16,
  },
  // Notification Button Styles
  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF4B4B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notificationModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  notificationHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadText: {
    color: '#386B5F',
    fontWeight: '600',
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  notificationList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  unreadNotification: {
    backgroundColor: '#F8FFFE',
  },
  notificationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  notificationItemMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationItemTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#386B5F',
    marginTop: 8,
  },
  // Legacy styles for ModeSwitcher (keeping for potential future use)
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modeText: {
    color: '#386B5F',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  selectedModeText: {
    color: '#386B5F',
    fontWeight: '600',
  },
});
