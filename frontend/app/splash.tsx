import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';
import { useAppStore } from '../store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, hasCompletedOnboarding } = useAppStore();

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('onboarding_complete');
      const authenticated = await AsyncStorage.getItem('authenticated');

      setTimeout(() => {
        if (authenticated === 'true') {
          router.replace('/dashboard');
        } else if (onboarded === 'true') {
          router.replace('/auth');
        } else {
          router.replace('/onboarding');
        }
      }, 2000);
    } catch (error) {
      console.error('Error checking initial route:', error);
      setTimeout(() => router.replace('/onboarding'), 2000);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {/* Lightning bolt icon */}
        <View style={styles.houseIcon}>
          <View style={styles.houseOutline} />
          <Text style={styles.boltIcon}>⚡</Text>
        </View>

        <Text style={styles.title}>ADHUNIK{' '}YANTRA</Text>
        <Text style={styles.subtitle}>SMART HOME. SAFE HOME.</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.loadingBar} />
        <Text style={styles.footerText}>INITIALIZING CORE SYSTEMS</Text>
        <Text style={styles.versionText}>SECURE NODE: 77.102.AX{' '.repeat(20)}v4.0.2-GENESIS</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  houseIcon: {
    width: 120,
    height: 80,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  houseOutline: {
    width: 120,
    height: 80,
    borderWidth: 3,
    borderColor: Colors.ACCENT_GREEN,
    borderTopWidth: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    position: 'absolute',
    bottom: 0,
  },
  boltIcon: {
    fontSize: 48,
    color: Colors.ACCENT_GREEN,
    textShadowColor: Colors.ACCENT_GREEN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 4,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    width: width * 0.8,
  },
  loadingBar: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  footerText: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
  },
});
