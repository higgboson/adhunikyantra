import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const steps = ['Scan', 'Connect', 'Verify'];

export default function WifiSetupScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const scanAnim = useRef(new Animated.Value(1)).current;

  const networks = [
    { ssid: 'HomeWiFi_5G', strength: 95, secured: true },
    { ssid: 'HomeWiFi_2G', strength: 72, secured: true },
    { ssid: 'Neighbor_Net', strength: 45, secured: true },
    { ssid: 'GuestNetwork', strength: 60, secured: false },
  ];

  const handleSelectNetwork = (ssid: string) => {
    setSelectedNetwork(ssid);
    setStep(1);
  };

  const handleConnect = () => {
    if (!password) return;
    setConnecting(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => {
      setConnecting(false);
      setStep(2);
    }, 2500);
  };

  const handleFinish = () => {
    router.replace('/auth');
  };

  const getSignalIcon = (strength: number) => {
    if (strength > 75) return 'wifi';
    if (strength > 50) return 'wifi-outline';
    return 'wifi-outline';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 75) return Colors.ACCENT_GREEN;
    if (strength > 50) return Colors.WARNING_ORANGE;
    return Colors.DANGER_RED;
  };

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WiFi Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.stepper}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  i <= step && { backgroundColor: Colors.ACCENT_GREEN, borderColor: Colors.ACCENT_GREEN },
                  i === step && styles.stepActive,
                ]}
              >
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color="#000" />
                ) : (
                  <Text style={[styles.stepNum, i <= step && { color: '#000' }]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i <= step && { color: Colors.TEXT_PRIMARY }]}>{s}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < step && { backgroundColor: Colors.ACCENT_GREEN }]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {step === 0 && (
          <View>
            <Text style={styles.sectionTitle}>Available Networks</Text>
            {networks.map((net) => (
              <TouchableOpacity
                key={net.ssid}
                style={styles.networkCard}
                onPress={() => handleSelectNetwork(net.ssid)}
                activeOpacity={0.7}
              >
                <View style={styles.networkLeft}>
                  <Ionicons name={getSignalIcon(net.strength)} size={20} color={getSignalColor(net.strength)} />
                  <View style={styles.networkInfo}>
                    <Text style={styles.networkName}>{net.ssid}</Text>
                    <Text style={styles.networkMeta}>
                      {net.strength}% signal · {net.secured ? 'Secured' : 'Open'}
                    </Text>
                  </View>
                </View>
                <View style={styles.networkRight}>
                  {!net.secured && (
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>OPEN</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={Colors.TEXT_MUTED} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 1 && (
          <View style={styles.connectForm}>
            <View style={styles.selectedNetCard}>
              <Ionicons name="wifi" size={24} color={Colors.ACCENT_GREEN} />
              <Text style={styles.selectedNetName}>{selectedNetwork}</Text>
            </View>

            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter WiFi password"
                placeholderTextColor={Colors.TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={Colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleConnect}
              disabled={!password || connecting}
              activeOpacity={0.8}
              style={{ marginTop: 32 }}
            >
              <LinearGradient
                colors={password ? [Colors.ACCENT_GREEN, '#00DD77'] : [Colors.BORDER_COLOR, Colors.BORDER_LIGHT]}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionBtnText, { color: password ? '#000' : Colors.TEXT_MUTED }]}>
                  {connecting ? 'CONNECTING...' : 'CONNECT'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.successContent}>
            <Animated.View style={[styles.successIcon, { transform: [{ scale: scanAnim }] }]}>
              <Ionicons name="checkmark-circle" size={80} color={Colors.ACCENT_GREEN} />
            </Animated.View>
            <Text style={styles.successTitle}>Device Connected!</Text>
            <Text style={styles.successSub}>
              Adhunik Yantra is now linked to{'\n'}
              <Text style={{ color: Colors.ACCENT_GREEN }}>{selectedNetwork}</Text>
            </Text>

            <View style={styles.deviceInfoCard}>
              <View style={styles.deviceInfoRow}>
                <Text style={styles.deviceInfoLabel}>DEVICE ID</Text>
                <Text style={styles.deviceInfoValue}>AY-7711-X092</Text>
              </View>
              <View style={styles.deviceInfoRow}>
                <Text style={styles.deviceInfoLabel}>FIRMWARE</Text>
                <Text style={styles.deviceInfoValue}>v4.0.2-GENESIS</Text>
              </View>
              <View style={styles.deviceInfoRow}>
                <Text style={styles.deviceInfoLabel}>IP ADDRESS</Text>
                <Text style={styles.deviceInfoValue}>192.168.1.156</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleFinish} style={{ marginTop: 32 }} activeOpacity={0.8}>
              <LinearGradient colors={[Colors.ACCENT_GREEN, '#00DD77']} style={styles.actionBtn}>
                <Text style={[styles.actionBtnText, { color: '#000' }]}>CONTINUE TO LOGIN</Text>
                <Ionicons name="arrow-forward" size={18} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_PRIMARY,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActive: { shadowColor: Colors.ACCENT_GREEN, shadowRadius: 8, shadowOpacity: 0.5 },
  stepNum: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.TEXT_MUTED },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.BORDER_COLOR, marginHorizontal: 8, marginBottom: 18 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  networkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  networkLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  networkInfo: {},
  networkName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  networkMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED, marginTop: 2 },
  networkRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  openBadge: {
    backgroundColor: 'rgba(0,212,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: Colors.ACCENT_CYAN },
  connectForm: {},
  selectedNetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,255,136,0.08)',
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN + '40',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  selectedNetName: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.TEXT_PRIMARY,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  eyeBtn: { padding: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  actionBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: 1.5 },
  successContent: { alignItems: 'center', paddingTop: 24 },
  successIcon: { marginBottom: 24 },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  successSub: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  deviceInfoCard: {
    width: '100%',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    overflow: 'hidden',
  },
  deviceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  deviceInfoLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED, letterSpacing: 1 },
  deviceInfoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.ACCENT_CYAN },
});
