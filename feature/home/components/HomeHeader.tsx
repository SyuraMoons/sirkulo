import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const MODES = ['Customer', 'Recycler', 'Business'];

export function ModeSwitcher({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [buttonLayout, setButtonLayout] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = React.useRef(null);
  
  const handleButtonPress = () => {
    if (buttonRef.current) {
      buttonRef.current.measureInWindow((x, y, width, height) => {
        setButtonLayout({ x, y, width, height });
        setModalVisible(true);
      });
    } else {
      setModalVisible(true);
    }
  };

  return (
    <>
      <TouchableOpacity 
        ref={buttonRef}
        style={styles.modeButton} 
        onPress={handleButtonPress} 
        activeOpacity={0.8}
      >
        <Text style={styles.modeButtonText}>{mode}</Text>
        <FontAwesome name="chevron-down" size={14} color="#222" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)} 
          activeOpacity={1}
        >
          <View style={[styles.modalContent]}>
            <FlatList
              data={MODES}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, item === mode && styles.modalItemActive]}
                  onPress={() => {
                    setMode(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, item === mode && styles.modalItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function HomeHeader({ mode, setMode }: { mode: string; setMode: (m: string) => void }) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>John</Text>
      </View>
      <View style={styles.centerSection}>
        <ModeSwitcher mode={mode} setMode={setMode} />
      </View>
      <View style={styles.rightSection}>
        <View style={styles.bellCircle}>
          <FontAwesome name="bell" size={20} color="#386B5F" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingBottom: 0,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 0,
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: 0,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#5A6475',
    marginBottom: 0,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#386B5F',
    marginBottom: 0,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 0,
    elevation: 0,
    minWidth: 0,
    justifyContent: 'center',
  },
  modeButtonText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#222',
    paddingHorizontal: 2,
  },
  bellCircle: {
    backgroundColor: '#E6F3EC',
    borderRadius: 999,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 0,
    minWidth: 120,
    alignItems: 'stretch',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalItemActive: {
    backgroundColor: '#E6F3EC',
  },
  modalItemText: {
    fontSize: 16,
    color: '#386B5F',
    fontWeight: '500',
    textAlign: 'center',
  },
  modalItemTextActive: {
    fontWeight: '700',
    color: '#222',
  },
});