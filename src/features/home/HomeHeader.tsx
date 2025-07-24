import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { USER_MODES, UserMode } from '@/src/constants/chat';

export function ModeSwitcher({
  mode,
  setMode,
}: {
  mode: UserMode;
  setMode: (m: UserMode) => void;
}) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [buttonLayout, setButtonLayout] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = React.useRef(null);

  const handleButtonPress = () => {
    if (buttonRef.current) {
      (buttonRef.current as any)?.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setButtonLayout({ x, y, width, height });
          setModalVisible(true);
        }
      );
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

export default function HomeHeader({ mode, setMode }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>Good Morning!</Text>
          <Text style={styles.subtitle}>What would you like to do today?</Text>
        </View>
        <View style={styles.rightSection}>
          <ModeSwitcher mode={mode} setMode={setMode} />
        </View>
      </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 4,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
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
