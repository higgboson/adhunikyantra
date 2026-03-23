import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';
import { useAppStore } from '../store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockFirebase } from '../services/mockFirebase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated } = useAppStore();

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(async () => {
      await AsyncStorage.setItem('authenticated', 'true');
      setAuthenticated(true);
      mockFirebase.startDataGenerator();
      setIsLoading(false);
      router.replace('/dashboard');
    }, 1500);
  };

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <Text style={styles.logoText}>ADHUNIK YANTRA</Text>
            <Text style={styles.logoSubtext}>SMART HOME. SAFE HOME.</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your smart home</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="dev.adhunik@example.com"
                placeholderTextColor={Colors.TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••••"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>👁</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  email && password
                    ? [Colors.ACCENT_GREEN, '#00DD77']
                    : [Colors.BORDER_COLOR, Colors.BORDER_LIGHT]
                }
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up */}
            <TouchableOpacity>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
                <Text style={styles.signUpLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Secure Node: 77.102.AX • v4.0.2-GENESIS
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 2,
    borderColor: Colors.ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 4,
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 2,
  },
  card: {
    marginHorizontal: 24,
    padding: 24,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    padding: 16,
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.ACCENT_CYAN,
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.BORDER_COLOR,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.TEXT_MUTED,
    fontSize: 14,
  },
  signUpText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  signUpLink: {
    color: Colors.ACCENT_GREEN,
    fontWeight: '600',
  },
  footer: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    textAlign: 'center',
    marginTop: 32,
  },
});
