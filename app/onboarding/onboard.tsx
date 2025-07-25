import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: 1,
    title: 'Welcome to Sirkulo',
    subtitle: 'Transform waste into valuable resources',
    description:
      'Join our sustainable community and make a positive impact on the environment while earning rewards.',
    icon: 'recycle',
  },
  {
    id: 2,
    title: 'Discover Eco-Products',
    subtitle: 'Shop sustainable and recycled goods',
    description:
      'Find amazing products made from recycled materials and support eco-friendly businesses.',
    icon: 'leaf',
  },
  {
    id: 3,
    title: 'Connect & Trade',
    subtitle: 'Buy, sell, and exchange sustainably',
    description:
      'Connect with like-minded people, trade recyclables, and build a greener future together.',
    icon: 'handshake-o',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen with logo for 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const skipOnboarding = () => {
    router.replace('/(auth)/login');
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('@/assets/images/sirkulo.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </View>
    );
  }

  const slide = ONBOARDING_SLIDES[currentSlide];

  if (!slide) {
    return null; // or some fallback UI
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome
            name={slide.icon as keyof typeof FontAwesome.glyphMap}
            size={80}
            color="#386B5F"
          />
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.paginationDot, index === currentSlide && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
          <Text style={styles.nextButtonText}>
            {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <FontAwesome name="arrow-right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#386B5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: width * 0.6,
    height: width * 0.6 * 0.3, // Adjust aspect ratio as needed
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E6F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#386B5F',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E6E6',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#386B5F',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#386B5F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
