import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const onboardingPages = [
  {
    title: 'MONITOR EVERY\nCIRCUIT',
    description:
      'Adhunik Yantra watches your home circuits 24/7, detecting faults before they become fires. Per-circuit current, voltage, and temperature monitoring with instant alerts.',
    illustration: '⚡',
  },
  {
    title: 'PREVENT\nELECTRICAL FIRES',
    description:
      'Advanced fault detection identifies overloads, short circuits, earth leakage, and thermal hotspots in real-time. Automatic circuit isolation protects your home.',
    illustration: '🔥',
  },
  {
    title: 'SAVE ENERGY\nSMART WAY',
    description:
      'AI-powered energy coaching learns your usage patterns and alerts you to wasteful consumption. Track costs, optimize usage, extend appliance lifespan.',
    illustration: '💡',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = async () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/wifi-setup');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/wifi-setup');
  };

  const page = onboardingPages[currentPage];

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>⚡ ADHUNIK YANTRA</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.circuitBoard}>
            <Text style={styles.illustration}>{page.illustration}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{page.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{page.description}</Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingPages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextButton}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Colors.ACCENT_GREEN, '#00DD77']}
          style={styles.nextButtonGradient}
        >
          <Text style={styles.nextButtonText}>
            {currentPage === onboardingPages.length - 1 ? 'GET STARTED' : 'NEXT'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation Preview */}
      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>🟢 Dashboard</Text>
        <Text style={styles.navItem}>🟢 Devices</Text>
        <Text style={styles.navItem}>🟢 Analytics</Text>
        <Text style={styles.navItem}>🟢 Alerts</Text>
        <Text style={styles.navItem}>🟢 Settings</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 2,
  },
  skipButton: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustrationContainer: {
    width: width * 0.85,
    height: 280,
    marginBottom: 40,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circuitBoard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    fontSize: 100,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 44,
  },
  description: {
    fontSize: 15,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.BORDER_COLOR,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.ACCENT_GREEN,
  },
  nextButton: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(19, 25, 41, 0.8)',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
  },
  navItem: {
    fontSize: 9,
    color: Colors.TEXT_MUTED,
  },
});
