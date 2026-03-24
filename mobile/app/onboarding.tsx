import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const pages = [
  {
    icon: 'flash' as const,
    iconColor: Colors.ACCENT_GREEN,
    title: 'Real-Time\nMonitoring',
    description:
      'Monitor voltage, current, and power consumption across all your home circuits — live, every 2 seconds.',
  },
  {
    icon: 'shield-checkmark' as const,
    iconColor: Colors.ACCENT_CYAN,
    title: 'Smart Fault\nDetection',
    description:
      'Automatic isolation of overloads and short circuits in under 100ms. Your home stays safe 24/7.',
  },
  {
    icon: 'analytics' as const,
    iconColor: Colors.WARNING_ORANGE,
    title: 'Energy\nIntelligence',
    description:
      'EWMA-based learning tracks your usage patterns and alerts you when something is out of the ordinary.',
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleNext = async () => {
    if (currentPage < pages.length - 1) {
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
      setCurrentPage((p) => p + 1);
    } else {
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/wifi-setup');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/wifi-setup');
  };

  const page = pages[currentPage];

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.logo}>⚡ ADHUNIK YANTRA</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipBtn}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { transform: [{ translateX: slideAnim }] }]}>
        <View style={[styles.iconContainer, { borderColor: page.iconColor }]}>
          <View style={[styles.iconBg, { backgroundColor: `${page.iconColor}18` }]}>
            <Ionicons name={page.icon} size={64} color={page.iconColor} />
          </View>
        </View>

        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.description}>{page.description}</Text>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.dots}>
          {pages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentPage && styles.dotActive,
                i === currentPage && { backgroundColor: page.iconColor },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={[page.iconColor, page.iconColor + 'CC']}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {currentPage === pages.length - 1 ? 'GET STARTED' : 'NEXT'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  logo: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 2,
  },
  skipBtn: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontFamily: 'Inter_500Medium',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    borderRadius: 60,
    borderWidth: 2,
    padding: 4,
    marginBottom: 48,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_PRIMARY,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.BORDER_LIGHT,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginBottom: 8,
  },
  nextBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#000',
    letterSpacing: 1.5,
  },
});
