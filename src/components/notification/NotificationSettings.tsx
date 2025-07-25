/**
 * Notification Settings Component
 * Allows users to configure notification preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNotification } from '../../hooks/useNotification';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  categories: {
    orders: boolean;
    messages: boolean;
    promotions: boolean;
    updates: boolean;
    security: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    categories: {
      orders: true,
      messages: true,
      promotions: false,
      updates: true,
      security: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    frequency: 'immediate',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getNotificationSettings, updateNotificationSettings } = useNotification();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await getNotificationSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateNotificationSettings(settings);
      Alert.alert('Success', 'Notification settings updated');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateCategorySetting = (category: keyof NotificationSettings['categories'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value,
      },
    }));
  };

  const updateQuietHours = (key: keyof NotificationSettings['quietHours'], value: any) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  const renderSettingItem = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        {icon && (
          <FontAwesome
            name={icon as any}
            size={20}
            color="#007AFF"
            style={styles.settingIcon}
          />
        )}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5E5', true: '#007AFF' }}
        thumbColor="#FFF"
      />
    </View>
  );

  const renderFrequencySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notification Frequency</Text>
      <View style={styles.frequencyContainer}>
        {[
          { value: 'immediate', label: 'Immediate' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.frequencyOption,
              settings.frequency === option.value && styles.frequencyOptionSelected,
            ]}
            onPress={() => updateSetting('frequency', option.value)}
          >
            <Text
              style={[
                styles.frequencyText,
                settings.frequency === option.value && styles.frequencyTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuietHours = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quiet Hours</Text>
      {renderSettingItem(
        'Enable Quiet Hours',
        'Disable notifications during specified hours',
        settings.quietHours.enabled,
        (value) => updateQuietHours('enabled', value),
        'moon-o'
      )}
      
      {settings.quietHours.enabled && (
        <View style={styles.timeContainer}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Start Time</Text>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={styles.timeText}>{settings.quietHours.startTime}</Text>
              <FontAwesome name="clock-o" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>End Time</Text>
            <TouchableOpacity style={styles.timeButton}>
              <Text style={styles.timeText}>{settings.quietHours.endTime}</Text>
              <FontAwesome name="clock-o" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Methods</Text>
        {renderSettingItem(
          'Push Notifications',
          'Receive notifications on your device',
          settings.pushNotifications,
          (value) => updateSetting('pushNotifications', value),
          'mobile'
        )}
        {renderSettingItem(
          'Email Notifications',
          'Receive notifications via email',
          settings.emailNotifications,
          (value) => updateSetting('emailNotifications', value),
          'envelope'
        )}
        {renderSettingItem(
          'SMS Notifications',
          'Receive notifications via text message',
          settings.smsNotifications,
          (value) => updateSetting('smsNotifications', value),
          'comment'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Categories</Text>
        {renderSettingItem(
          'Orders & Purchases',
          'Order confirmations, shipping updates',
          settings.categories.orders,
          (value) => updateCategorySetting('orders', value),
          'shopping-cart'
        )}
        {renderSettingItem(
          'Messages',
          'New messages and chat notifications',
          settings.categories.messages,
          (value) => updateCategorySetting('messages', value),
          'comments'
        )}
        {renderSettingItem(
          'Promotions',
          'Deals, discounts, and special offers',
          settings.categories.promotions,
          (value) => updateCategorySetting('promotions', value),
          'tag'
        )}
        {renderSettingItem(
          'App Updates',
          'New features and app improvements',
          settings.categories.updates,
          (value) => updateCategorySetting('updates', value),
          'refresh'
        )}
        {renderSettingItem(
          'Security',
          'Login alerts and security notifications',
          settings.categories.security,
          (value) => updateCategorySetting('security', value),
          'shield'
        )}
      </View>

      {renderFrequencySelector()}
      {renderQuietHours()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
    width: 24,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  frequencyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  frequencyTextSelected: {
    color: '#FFF',
  },
  timeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  timeItem: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});