import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppStore } from '@/store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const glowAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
        ])
      ),
      Animated.timing(barAnim, {
        toValue: 1,
        duration: 2000,
        delay: 400,
        useNativeDriver: false,
      }),
    ]).start();

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
      }, 2600);
    } catch {
      setTimeout(() => router.replace('/onboarding'), 2600);
    }
  };

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.iconWrapper, { opacity: glowAnim }]}>
          <View style={styles.iconRing}>
            <Ionicons name="flash" size={52} color={Colors.ACCENT_GREEN} />
          </View>
        </Animated.View>

        <Text style={styles.title}>ADHUNIK{'\n'}YANTRA</Text>
        <Text style={styles.subtitle}>SMART HOME. SAFE HOME.</Text>
      </Animated.View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              {
                width: barAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.footerText}>INITIALIZING CORE SYSTEMS</Text>
        <Text style={styles.versionText}>SECURE NODE: 77.102.AX · v4.0.2-GENESIS</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginBottom: 36,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,255,136,0.08)',
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: 'Inter_700Bold',
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 4,
    textAlign: 'center',
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  barTrack: {
    width: width * 0.7,
    height: 2,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  barFill: {
    height: 2,
    backgroundColor: Colors.ACCENT_GREEN,
    borderRadius: 1,
  },
  footerText: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 2,
    marginBottom: 6,
    fontFamily: 'Inter_500Medium',
  },
  versionText: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
    fontFamily: 'Inter_400Regular',
  },
});
