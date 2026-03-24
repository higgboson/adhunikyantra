import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/appStore';
import { mockFirebase } from '@/services/mockFirebase';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthenticated } = useAppStore();

  const isValid = email.length > 3 && password.length > 0;

  const handleLogin = async () => {
    if (!isValid) return;
    setIsLoading(true);
    setTimeout(async () => {
      await AsyncStorage.setItem('authenticated', 'true');
      setAuthenticated(true);
      mockFirebase.startDataGenerator();
      setIsLoading(false);
      router.replace('/dashboard');
    }, 1500);
  };

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoBlock}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={32} color={Colors.ACCENT_GREEN} />
            </View>
            <Text style={styles.logoText}>ADHUNIK YANTRA</Text>
            <Text style={styles.logoSub}>SMART HOME. SAFE HOME.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSub}>Sign in to access your smart home panel</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Colors.TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@adhunik.io"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.TEXT_MUTED} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.TEXT_MUTED}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={!isValid || isLoading}
              activeOpacity={0.8}
              style={{ marginTop: 8 }}
            >
              <LinearGradient
                colors={isValid ? [Colors.ACCENT_GREEN, '#00DD77'] : [Colors.BORDER_COLOR, Colors.BORDER_LIGHT]}
                style={styles.loginBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={[styles.loginBtnText, { color: isValid ? '#000' : Colors.TEXT_MUTED }]}>
                    SIGN IN
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoBtn} onPress={handleLogin}>
              <Ionicons name="play-circle-outline" size={18} color={Colors.ACCENT_CYAN} />
              <Text style={styles.demoBtnText}>Continue with Demo Account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Secure Node: 77.102.AX · v4.0.2-GENESIS</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24 },
  logoBlock: { alignItems: 'center', marginBottom: 36 },
  logoIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: Colors.ACCENT_GREEN,
    backgroundColor: 'rgba(0,255,136,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 5,
    marginBottom: 6,
  },
  logoSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 3,
  },
  card: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  cardTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 6,
  },
  cardSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_SECONDARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  eyeBtn: { padding: 6 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.ACCENT_CYAN },
  loginBtn: {
    height: 52,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 2 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.BORDER_COLOR },
  dividerText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.ACCENT_CYAN + '40',
    borderRadius: 50,
    backgroundColor: 'rgba(0,212,255,0.06)',
  },
  demoBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.ACCENT_CYAN },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
    marginTop: 24,
  },
});
