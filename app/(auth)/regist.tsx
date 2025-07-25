import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    gender: '',
    ageRange: '',
  });
  const router = useRouter();

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      // Validate basic info
      if (formData.firstName && formData.lastName && formData.email && formData.password) {
        setStep(2);
      }
    } else {
      // Validate preferences
      if (formData.gender && formData.ageRange) {
        // Handle registration
        router.replace('/(tabs)');
      }
    }
  };

  const selectAgeRange = (ageRange: string) => {
    setFormData({ ...formData, ageRange });
    setShowAgeDropdown(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <FontAwesome name="chevron-left" size={24} color="#222" />
      </TouchableOpacity>

      {step === 1 ? (
        <>
          <Text style={styles.title}>Create Account</Text>
          <TextInput
            style={styles.input}
            placeholder="Firstname"
            value={formData.firstName}
            onChangeText={text => setFormData({ ...formData, firstName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Lastname"
            value={formData.lastName}
            onChangeText={text => setFormData({ ...formData, lastName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Tell us About yourself</Text>
          <Text style={styles.subtitle}>Who do you shop for ?</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'Men' && styles.activeButton]}
              onPress={() => setFormData({ ...formData, gender: 'Men' })}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  formData.gender === 'Men' && styles.activeButtonText,
                ]}
              >
                Men
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, formData.gender === 'Women' && styles.activeButton]}
              onPress={() => setFormData({ ...formData, gender: 'Women' })}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  formData.gender === 'Women' && styles.activeButtonText,
                ]}
              >
                Women
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>How Old are you ?</Text>
          <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowAgeDropdown(true)}>
            <Text style={[styles.dropdownButtonText, formData.ageRange && styles.selectedText]}>
              {formData.ageRange || 'Age Range'}
            </Text>
            <FontAwesome name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.continueButton,
          step === 2 && styles.finishButton,
          ((step === 1 &&
            (!formData.firstName || !formData.lastName || !formData.email || !formData.password)) ||
            (step === 2 && (!formData.gender || !formData.ageRange))) &&
            styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={
          (step === 1 &&
            (!formData.firstName || !formData.lastName || !formData.email || !formData.password)) ||
          (step === 2 && (!formData.gender || !formData.ageRange))
        }
      >
        <Text
          style={[
            styles.continueButtonText,
            ((step === 1 &&
              (!formData.firstName ||
                !formData.lastName ||
                !formData.email ||
                !formData.password)) ||
              (step === 2 && (!formData.gender || !formData.ageRange))) &&
              styles.disabledButtonText,
          ]}
        >
          {step === 1 ? 'Continue' : 'Finish'}
        </Text>
      </TouchableOpacity>

      {/* Age Range Dropdown Modal */}
      <Modal
        visible={showAgeDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAgeDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Age Range</Text>
              <TouchableOpacity onPress={() => setShowAgeDropdown(false)}>
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {AGE_RANGES.map(age => (
                <TouchableOpacity
                  key={age}
                  style={[styles.modalOption, formData.ageRange === age && styles.selectedOption]}
                  onPress={() => selectAgeRange(age)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      formData.ageRange === age && styles.selectedOptionText,
                    ]}
                  >
                    {age}
                  </Text>
                  {formData.ageRange === age && (
                    <FontAwesome name="check" size={16} color="#386B5F" />
                  )}
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
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#222',
    marginBottom: 32,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  genderButton: {
    width: '48%',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#386B5F',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
  dropdownButton: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedText: {
    color: '#222',
  },
  continueButton: {
    backgroundColor: '#386B5F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  finishButton: {
    marginTop: 'auto',
  },
  disabledButton: {
    backgroundColor: '#E6E6E6',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  modalList: {
    maxHeight: 200,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
  },
  selectedOption: {
    backgroundColor: '#E6F3EC',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222',
  },
  selectedOptionText: {
    color: '#386B5F',
    fontWeight: '600',
  },
});
