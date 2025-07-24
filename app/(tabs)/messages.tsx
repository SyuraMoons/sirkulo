import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from 'expo-router';

const CHATS = [
  {
    id: '1',
    name: 'Budi Santoso',
    lastMessage: 'Apakah botol kaca masih tersedia?',
    time: '10:30',
    online: true,
  },
  {
    id: '2',
    name: 'Siti Aminah',
    lastMessage: 'Saya tertarik dengan vas bunga Anda',
    time: '09:15',
    online: false,
  },
  {
    id: '3',
    name: 'Dedi Cahyono',
    lastMessage: 'Bisa dikirim ke alamat saya?',
    time: 'Kemarin',
    online: false,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.searchContainer}>
          <TextInput 
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView style={styles.chatList}>
        {CHATS.map(chat => (
          <TouchableOpacity 
            key={chat.id}
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${chat.id}`)}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarIcon}>
                <FontAwesome name="user-circle" size={40} color="#386B5F" />
              </View>
              {chat.online && <View style={styles.onlineBadge} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 45, // Add top padding to account for status bar
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#386B5F',
    marginBottom: 12,
  },
  searchContainer: {
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  avatarContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E6F3EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
});