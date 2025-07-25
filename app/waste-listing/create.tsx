import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  WASTE_CATEGORIES,
  QUALITY_GRADES,
  QUANTITY_UNITS,
  URGENCY_LEVELS,
  COLORS,
} from '@/src/constants/features';
import { WasteListingFormData } from '@/src/types/features';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function WasteListingCreator() {
  const { template } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WasteListingFormData>({
    step: 1,
    title: '',
    category: (template as string) || '',
    subcategory: '',
    description: '',
    quantity: {
      amount: '',
      unit: 'kg',
    },
    location: {
      address: '',
      accessInfo: '',
    },
    photos: [],
    availability: {
      startDate: '',
      timeWindows: [],
    },
    pricing: {
      basePrice: '',
      negotiable: true,
    },
  });

  const totalSteps = 7;

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      updateFormData('step', currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateFormData('step', currentStep - 1);
    }
  };

  const handlePhotoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map(asset => asset.uri);
      updateFormData('photos', [...formData.photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', updatedPhotos);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Success!',
      'Your waste listing has been created and is now live on the marketplace.',
      [
        {
          text: 'View Listing',
          onPress: () => console.log('View Listing - Feature coming soon'),
        },
        {
          text: 'Create Another',
          onPress: () => {
            setCurrentStep(1);
            setFormData({
              step: 1,
              title: '',
              category: '',
              subcategory: '',
              description: '',
              quantity: { amount: '', unit: 'kg' },
              location: { address: '', accessInfo: '' },
              photos: [],
              availability: { startDate: '', timeWindows: [] },
              pricing: { basePrice: '', negotiable: true },
            });
          },
        },
      ]
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / totalSteps) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Initiate New Listing</Text>
      <Text style={styles.stepDescription}>Let's start by setting up your waste listing</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Listing Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Clean Plastic Bottles for Recycling"
          value={formData.title}
          onChangeText={text => updateFormData('title', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.typeGrid}>
          {['Sale', 'Donation', 'Processing'].map(type => (
            <TouchableOpacity key={type} style={styles.typeCard}>
              <Text style={styles.typeText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe your waste materials..."
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={text => updateFormData('description', text)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Choose Category</Text>
      <Text style={styles.stepDescription}>Select the appropriate category for your waste</Text>

      <View style={styles.categoryGrid}>
        {WASTE_CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, formData.category === category.id && styles.selectedCard]}
            onPress={() => updateFormData('category', category.id)}
          >
            <FontAwesome
              name={category.icon as any}
              size={24}
              color={formData.category === category.id ? '#FFFFFF' : COLORS.primary}
            />
            <Text
              style={[
                styles.categoryName,
                formData.category === category.id && styles.selectedText,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.category && (
        <View style={styles.subcategorySection}>
          <Text style={styles.label}>Subcategory</Text>
          <View style={styles.subcategoryList}>
            {WASTE_CATEGORIES.find(c => c.id === formData.category)?.subcategories.map(sub => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subcategoryItem,
                  formData.subcategory === sub.id && styles.selectedSubcategory,
                ]}
                onPress={() => updateFormData('subcategory', sub.id)}
              >
                <Text
                  style={[
                    styles.subcategoryText,
                    formData.subcategory === sub.id && styles.selectedText,
                  ]}
                >
                  {sub.name}
                </Text>
                <Text style={styles.subcategoryDesc}>{sub.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Quantity & Location</Text>
      <Text style={styles.stepDescription}>Enter details about amount and location</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantity</Text>
        <View style={styles.quantityRow}>
          <TextInput
            style={[styles.textInput, { flex: 1, marginRight: 12 }]}
            placeholder="Amount"
            keyboardType="numeric"
            value={formData.quantity.amount}
            onChangeText={text =>
              updateFormData('quantity', { ...formData.quantity, amount: text })
            }
          />
          <View style={styles.unitPicker}>
            <Text style={styles.unitText}>{formData.quantity.unit}</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pickup Location</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter full address"
          value={formData.location.address}
          onChangeText={text => updateFormData('location', { ...formData.location, address: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Access Information</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Loading dock, parking, special instructions..."
          multiline
          numberOfLines={3}
          value={formData.location.accessInfo}
          onChangeText={text =>
            updateFormData('location', { ...formData.location, accessInfo: text })
          }
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 4: Add Photos</Text>
      <Text style={styles.stepDescription}>Add visual representation for better clarity</Text>

      <TouchableOpacity style={styles.photoUploadButton} onPress={handlePhotoUpload}>
        <FontAwesome name="camera" size={24} color={COLORS.primary} />
        <Text style={styles.photoUploadText}>Add Photos</Text>
      </TouchableOpacity>

      {formData.photos.length > 0 && (
        <View style={styles.photoGrid}>
          {formData.photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(index)}>
                <FontAwesome name="times" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.photoTips}>
        <Text style={styles.tipsTitle}>Photo Tips:</Text>
        <Text style={styles.tipsText}>• Take clear, well-lit photos</Text>
        <Text style={styles.tipsText}>• Show different angles</Text>
        <Text style={styles.tipsText}>• Include close-ups of quality</Text>
        <Text style={styles.tipsText}>• Maximum 10 photos</Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 5: Availability & Pricing</Text>
      <Text style={styles.stepDescription}>Set when it's available and pricing if desired</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Available From</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Select date"
          value={formData.availability.startDate}
          onChangeText={text =>
            updateFormData('availability', { ...formData.availability, startDate: text })
          }
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Urgency Level</Text>
        <View style={styles.urgencyGrid}>
          {URGENCY_LEVELS.map(level => (
            <TouchableOpacity key={level.id} style={styles.urgencyCard}>
              <View style={[styles.urgencyDot, { backgroundColor: level.color }]} />
              <Text style={styles.urgencyText}>{level.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Pricing (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter price or leave blank for free"
          keyboardType="numeric"
          value={formData.pricing.basePrice}
          onChangeText={text => updateFormData('pricing', { ...formData.pricing, basePrice: text })}
        />

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() =>
            updateFormData('pricing', {
              ...formData.pricing,
              negotiable: !formData.pricing.negotiable,
            })
          }
        >
          <View style={[styles.checkbox, formData.pricing.negotiable && styles.checkedBox]}>
            {formData.pricing.negotiable && <FontAwesome name="check" size={12} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxText}>Price is negotiable</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep6 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 6: Review & Publish</Text>
      <Text style={styles.stepDescription}>Review your listing before making it live</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>{formData.title}</Text>
        <Text style={styles.reviewCategory}>
          {WASTE_CATEGORIES.find(c => c.id === formData.category)?.name}
        </Text>
        <Text style={styles.reviewQuantity}>
          {formData.quantity.amount} {formData.quantity.unit}
        </Text>
        <Text style={styles.reviewLocation}>{formData.location.address}</Text>
        {formData.photos.length > 0 && (
          <Text style={styles.reviewPhotos}>{formData.photos.length} photos attached</Text>
        )}
      </View>

      <View style={styles.finalOptions}>
        <TouchableOpacity style={styles.optionButton}>
          <FontAwesome name="eye" size={16} color={COLORS.primary} />
          <Text style={styles.optionText}>Preview Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton}>
          <FontAwesome name="bell" size={16} color={COLORS.primary} />
          <Text style={styles.optionText}>Notification Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <FontAwesome name="check-circle" size={64} color={COLORS.success} />
              <Text style={styles.successTitle}>Listing Created!</Text>
              <Text style={styles.successText}>
                Your waste listing is now live on the marketplace
              </Text>
              <TouchableOpacity style={styles.successButton} onPress={handleSubmit}>
                <Text style={styles.successButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return renderStep1();
    }
  };

  return (
    <View style={styles.container}>
      {renderProgressBar()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.navigationBar}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            <FontAwesome name="arrow-left" size={16} color={COLORS.primary} />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        {currentStep < totalSteps ? (
          <TouchableOpacity style={styles.primaryNavButton} onPress={nextStep}>
            <Text style={styles.primaryNavButtonText}>Next</Text>
            <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryNavButton} onPress={handleSubmit}>
            <Text style={styles.primaryNavButtonText}>Publish</Text>
            <FontAwesome name="check" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    padding: 16,
    paddingTop: 60,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    marginBottom: 100,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  subcategorySection: {
    marginTop: 24,
  },
  subcategoryList: {
    marginTop: 8,
  },
  subcategoryItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSubcategory: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  subcategoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subcategoryDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPicker: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  photoUploadButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 8,
    marginRight: '4%',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTips: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  urgencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  urgencyCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  reviewCategory: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 4,
  },
  reviewQuantity: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  reviewLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  reviewPhotos: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  finalOptions: {
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 12,
  },
  successContainer: {
    alignItems: 'center',
    padding: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 8,
  },
  primaryNavButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryNavButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
