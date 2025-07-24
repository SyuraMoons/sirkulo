import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import HomeHeader from '@/src/features/home/HomeHeader';
import CraftsSection from '@/src/features/home/CraftsSection';
import { useNavigation } from 'expo-router';
import Banner from '@/assets/images/Banner.png';
import { UserMode } from '@/src/constants/chat';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabOneScreen() {
  const [mode, setMode] = useState<UserMode>('Customer');
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HomeHeader mode={mode} setMode={setMode} />
      {mode === 'Customer' && (
        <>
          {/* Search Bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.filterBtn}>
              <FontAwesome name="sliders" size={20} color="#386B5F" />
            </TouchableOpacity>
          </View>
          {/* Banner */}
          <View style={styles.bannerContainer}>
            <Image source={Banner} style={styles.bannerImage} resizeMode="cover" />
          </View>
          <CraftsSection />
        </>
      )}
      {mode === 'Recycler' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Recycler Home (Coming Soon)</Text>
        </View>
      )}
      {mode === 'Business' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Business Home (Coming Soon)</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 0,
  },
  filterBtn: {
    backgroundColor: '#EAF7F1',
    borderRadius: 16,
    padding: 8,
  },
  bannerContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F5F6F8',
  },
  bannerImage: {
    width: '100%',
    height: 150,
    borderRadius: 16,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  placeholderText: {
    fontSize: 22,
    color: '#386B5F',
    fontWeight: '600',
  },
});
