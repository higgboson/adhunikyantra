import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';

export default function WiFiSetupScreen() {
  const [currentStep, setCurrentStep] = useState(2); // Step 2 = Enter WiFi
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const networks = ['HomeWiFi_5G', 'Office_Network', 'Guest_WiFi'];

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection
    setTimeout(() => {
      setIsConnecting(false);
      router.replace('/auth');
    }, 2000);
  };

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>⚡ ADHUNIK YANTRA</Text>
        </View>

        {/* Steps Indicator */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepComplete]}>
              <Text style={styles.stepCheck}>✓</Text>
            </View>
            <Text style={styles.stepLabel}>DEVICE</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, styles.stepActive]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={[styles.stepLabel, styles.stepLabelActive]}>ENTER WIFI</Text>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepLabel}>FINALIZE</Text>
          </View>
        </View>

        {/* WiFi Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.wifiIcon}>
            <Text style={styles.wifiText}>📶</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Connect Your Device</Text>
        <Text style={styles.subtitle}>
          Configure the wireless network for your hardware node.
        </Text>

        {/* Network Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>WIFI NETWORK NAME</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownPlaceholder}>
              {selectedNetwork || 'Select Network...'}
            </Text>
            <Text style={styles.dropdownIcon}>⌄</Text>
          </TouchableOpacity>

          {/* Network List */}
          {!selectedNetwork && (
            <View style={styles.networkList}>
              {networks.map((network) => (
                <TouchableOpacity
                  key={network}
                  style={styles.networkItem}
                  onPress={() => setSelectedNetwork(network)}
                >
                  <Text style={styles.networkText}>{network}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.card}>
          <Text style={styles.label}>WIFI PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <Text style={styles.lockIcon}>🔒</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="• • • • • • • • •"
              placeholderTextColor={Colors.TEXT_MUTED}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeIcon}>👁</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <View style={styles.checkmark} />
          <Text style={styles.securityText}>
            Your credentials are sent only to your device via a secure
            peer-to-peer encrypted channel.
          </Text>
        </View>

        {/* Connect Button */}
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnect}
          disabled={!selectedNetwork || !password || isConnecting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              selectedNetwork && password
                ? [Colors.ACCENT_GREEN, '#00DD77']
                : [Colors.BORDER_COLOR, Colors.BORDER_LIGHT]
            }
            style={styles.connectButtonGradient}
          >
            {isConnecting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.BG_PRIMARY} />
                <Text style={styles.connectButtonText}>CHECKING HARDWARE STATUS...</Text>
              </View>
            ) : (
              <Text style={styles.connectButtonText}>Connect Device to WiFi ⚡</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to Scanner */}
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>← BACK TO SCANNER</Text>
        </TouchableOpacity>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>🔴</Text>
            <Text style={styles.navLabel}>HOTSPOT</Text>
          </View>
          <View style={[styles.navItem, styles.navItemActive]}>
            <Text style={styles.navIcon}>🟢</Text>
            <Text style={styles.navLabel}>WIFI</Text>
          </View>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>⚡</Text>
            <Text style={styles.navLabel}>CIRCUITS</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 2,
    borderColor: Colors.BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepComplete: {
    backgroundColor: Colors.ACCENT_GREEN,
    borderColor: Colors.ACCENT_GREEN,
  },
  stepActive: {
    borderColor: Colors.ACCENT_GREEN,
    backgroundColor: Colors.ACCENT_GREEN,
  },
  stepCheck: {
    color: Colors.BG_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
  },
  stepNumber: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: Colors.ACCENT_GREEN,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  wifiIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 2,
    borderColor: Colors.ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  label: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
  },
  dropdownPlaceholder: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
  },
  dropdownIcon: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 20,
  },
  networkList: {
    marginTop: 12,
  },
  networkItem: {
    padding: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    marginBottom: 8,
  },
  networkText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
  },
  lockIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  securityNote: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.ACCENT_GREEN,
    marginRight: 12,
    marginTop: 2,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  connectButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  connectButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(19, 25, 41, 0.8)',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
    marginBottom: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navItemActive: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
  },
});
