import React, { useState } from 'react';
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
import { PROJECT_TEMPLATES, URGENCY_LEVELS, COLORS } from '@/src/constants/features';
import { ProjectRequestFormData } from '@/src/types/features';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function ProjectRequestCreator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectRequestFormData>({
    step: 1,
    title: '',
    description: '',
    concept: '',
    materialRequirements: '',
    references: [],
    deadline: '',
    urgency: 'moderate',
    budget: {
      min: '',
      max: '',
    },
  });

  const totalSteps = 5;

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

  const handleReferenceUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newReferences = result.assets.map(asset => asset.uri);
      updateFormData('references', [...formData.references, ...newReferences]);
    }
  };

  const removeReference = (index: number) => {
    const updatedReferences = formData.references.filter((_, i) => i !== index);
    updateFormData('references', updatedReferences);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Project Request Posted!',
      'Your recycling project request is now published. Recyclers will be notified and can submit proposals.',
      [
        {
          text: 'View Proposals',
          onPress: () => console.log('View Proposals - Feature coming soon'),
        },
        {
          text: 'Create Another',
          onPress: () => {
            setCurrentStep(1);
            setFormData({
              step: 1,
              title: '',
              description: '',
              concept: '',
              materialRequirements: '',
              references: [],
              deadline: '',
              urgency: 'moderate',
              budget: { min: '', max: '' },
            });
          },
        },
      ]
    );
  };

  const selectTemplate = (template: any) => {
    updateFormData('title', template.name);
    updateFormData('description', template.description);
    updateFormData('materialRequirements', template.materials.join(', '));
    nextStep();
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Post Project Request</Text>
      <Text style={styles.stepDescription}>
        Choose a template or start from scratch
      </Text>

      <TouchableOpacity 
        style={styles.customProjectButton}
        onPress={nextStep}
      >
        <FontAwesome name="plus-circle" size={24} color={COLORS.primary} />
        <Text style={styles.customProjectText}>Create Custom Project</Text>
      </TouchableOpacity>

      <Text style={styles.templatesTitle}>Or choose a template:</Text>

      <View style={styles.templatesGrid}>
        {PROJECT_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => selectTemplate(template)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateCategory}>{template.category}</Text>
            </View>
            <Text style={styles.templateDescription}>{template.description}</Text>
            <View style={styles.templateFooter}>
              <Text style={styles.templateTime}>{template.estimatedTime}</Text>
              <View style={[styles.complexityBadge, { 
                backgroundColor: template.complexity === 'simple' ? COLORS.success : COLORS.warning 
              }]}>
                <Text style={styles.complexityText}>{template.complexity}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Describe Your Idea</Text>
      <Text style={styles.stepDescription}>
        Detail your recycling concept and requirements
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Chair from Plastic Waste"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe what you want to create..."
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Recycling Concept</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Explain the transformation process and expected outcome..."
          multiline
          numberOfLines={4}
          value={formData.concept}
          onChangeText={(text) => updateFormData('concept', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Material Requirements</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="List required waste materials (plastic bottles, metal scraps, etc.)"
          multiline
          numberOfLines={3}
          value={formData.materialRequirements}
          onChangeText={(text) => updateFormData('materialRequirements', text)}
        />
      </View>

      <View style={styles.conceptTips}>
        <Text style={styles.tipsTitle}>💡 Tips for a great concept:</Text>
        <Text style={styles.tipsText}>• Be specific about the final product</Text>
        <Text style={styles.tipsText}>• Mention functional requirements</Text>
        <Text style={styles.tipsText}>• Include aesthetic preferences</Text>
        <Text style={styles.tipsText}>• Specify quality expectations</Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Upload References</Text>
      <Text style={styles.stepDescription}>
        Add inspiration photos and visual examples
      </Text>

      <TouchableOpacity style={styles.referenceUploadButton} onPress={handleReferenceUpload}>
        <FontAwesome name="image" size={24} color={COLORS.primary} />
        <Text style={styles.referenceUploadText}>Add Reference Images</Text>
      </TouchableOpacity>

      {formData.references.length > 0 && (
        <View style={styles.referenceGrid}>
          {formData.references.map((reference, index) => (
            <View key={index} style={styles.referenceItem}>
              <Image source={{ uri: reference }} style={styles.referenceImage} />
              <TouchableOpacity
                style={styles.removeReferenceButton}
                onPress={() => removeReference(index)}
              >
                <FontAwesome name="times" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View style={styles.referenceTypes}>
        <Text style={styles.sectionTitle}>Reference Types:</Text>
        
        <View style={styles.referenceTypeCard}>
          <FontAwesome name="camera" size={20} color={COLORS.primary} />
          <View style={styles.referenceTypeContent}>
            <Text style={styles.referenceTypeTitle}>Inspiration Photos</Text>
            <Text style={styles.referenceTypeDesc}>Examples of desired final product</Text>
          </View>
        </View>

        <View style={styles.referenceTypeCard}>
          <FontAwesome name="pencil" size={20} color={COLORS.primary} />
          <View style={styles.referenceTypeContent}>
            <Text style={styles.referenceTypeTitle}>Sketches & Drawings</Text>
            <Text style={styles.referenceTypeDesc}>Your own design ideas</Text>
          </View>
        </View>

        <View style={styles.referenceTypeCard}>
          <FontAwesome name="file-text-o" size={20} color={COLORS.primary} />
          <View style={styles.referenceTypeContent}>
            <Text style={styles.referenceTypeTitle}>Technical Specs</Text>
            <Text style={styles.referenceTypeDesc}>Dimensions and requirements</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 4: Set Deadline</Text>
      <Text style={styles.stepDescription}>
        Configure timeline and urgency level
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Deadline</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Select completion date"
          value={formData.deadline}
          onChangeText={(text) => updateFormData('deadline', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Urgency Level</Text>
        <View style={styles.urgencyGrid}>
          {URGENCY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.urgencyCard,
                formData.urgency === level.id && styles.selectedUrgency
              ]}
              onPress={() => updateFormData('urgency', level.id)}
            >
              <View style={[styles.urgencyDot, { backgroundColor: level.color }]} />
              <View style={styles.urgencyContent}>
                <Text style={[
                  styles.urgencyName,
                  formData.urgency === level.id && styles.selectedText
                ]}>
                  {level.name}
                </Text>
                <Text style={[
                  styles.urgencyDesc,
                  formData.urgency === level.id && styles.selectedDescText
                ]}>
                  {level.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Budget Range (Optional)</Text>
        <View style={styles.budgetRow}>
          <TextInput
            style={[styles.textInput, { flex: 1, marginRight: 12 }]}
            placeholder="Min budget"
            keyboardType="numeric"
            value={formData.budget?.min}
            onChangeText={(text) => updateFormData('budget', { ...formData.budget, min: text })}
          />
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Max budget"
            keyboardType="numeric"
            value={formData.budget?.max}
            onChangeText={(text) => updateFormData('budget', { ...formData.budget, max: text })}
          />
        </View>
      </View>

      <View style={styles.timelineTips}>
        <Text style={styles.tipsTitle}>⏰ Timeline Tips:</Text>
        <Text style={styles.tipsText}>• Allow extra time for complex projects</Text>
        <Text style={styles.tipsText}>• Consider material sourcing time</Text>
        <Text style={styles.tipsText}>• Factor in quality review periods</Text>
        <Text style={styles.tipsText}>• Be realistic about deadlines</Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 5: Wait for Recyclers</Text>
      <Text style={styles.stepDescription}>
        Your request is ready to be published
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{formData.title}</Text>
        <Text style={styles.summaryDescription}>{formData.description}</Text>
        
        <View style={styles.summaryRow}>
          <FontAwesome name="calendar" size={16} color={COLORS.text.secondary} />
          <Text style={styles.summaryText}>Deadline: {formData.deadline || 'Not specified'}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <FontAwesome name="clock-o" size={16} color={COLORS.text.secondary} />
          <Text style={styles.summaryText}>Urgency: {formData.urgency}</Text>
        </View>
        
        {formData.references.length > 0 && (
          <View style={styles.summaryRow}>
            <FontAwesome name="image" size={16} color={COLORS.text.secondary} />
            <Text style={styles.summaryText}>{formData.references.length} reference images</Text>
          </View>
        )}
      </View>

      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>What happens next?</Text>
        
        <View style={styles.nextStepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.nextStepText}>Your request will be published to the marketplace</Text>
        </View>
        
        <View style={styles.nextStepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.nextStepText}>Qualified recyclers will be notified</Text>
        </View>
        
        <View style={styles.nextStepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.nextStepText}>You'll receive proposals and can choose the best one</Text>
        </View>
        
        <View style={styles.nextStepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.nextStepText}>Work begins on your recycling project</Text>
        </View>
      </View>

      <View style={styles.notificationSettings}>
        <Text style={styles.settingsTitle}>Notification Preferences</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Email notifications for new proposals</Text>
          <View style={styles.settingToggle}>
            <FontAwesome name="check" size={16} color={COLORS.success} />
          </View>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Push notifications for messages</Text>
          <View style={styles.settingToggle}>
            <FontAwesome name="check" size={16} color={COLORS.success} />
          </View>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
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
            <Text style={styles.primaryNavButtonText}>Publish Request</Text>
            <FontAwesome name="send" size={16} color="#FFFFFF" />
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
  customProjectButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  customProjectText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
  templatesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  templatesGrid: {
    marginBottom: 24,
  },
  templateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    flex: 1,
  },
  templateCategory: {
    fontSize: 12,
    color: COLORS.primary,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'capitalize',
  },
  templateDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTime: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  complexityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
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
  conceptTips: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
  referenceUploadButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  referenceUploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  referenceItem: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 8,
    marginRight: '4%',
    position: 'relative',
  },
  referenceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeReferenceButton: {
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
  referenceTypes: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  referenceTypeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referenceTypeContent: {
    marginLeft: 16,
    flex: 1,
  },
  referenceTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  referenceTypeDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  urgencyGrid: {
    marginBottom: 16,
  },
  urgencyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedUrgency: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  urgencyDesc: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  selectedText: {
    color: COLORS.primary,
  },
  selectedDescText: {
    color: COLORS.text.primary,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineTips: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  nextStepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextStepText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  notificationSettings: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingText: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
  settingToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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