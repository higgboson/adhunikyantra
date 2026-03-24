import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';
import { useAppStore } from '../store/appStore';

export default function DeviceNetworkScreen() {
  const { deviceInfo } = useAppStore();
  const [deviceName, setDeviceName] = useState('Adhunik Yantra — Home');
  const [expandedOffline, setExpandedOffline] = useState(false);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days} days, ${hours} hours`;
  };

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Device & Network</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator} />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Connected — Cloud Sync Active</Text>
              <Text style={styles.statusSubtitle}>
                Device is operating normally and streaming telemetry.
              </Text>
            </View>
            <View style={styles.statusIconContainer}>
              <Text style={styles.statusIcon}>✓</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>DEVICE ID</Text>
              <Text style={styles.metricValue}>1.1en</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>LAST DATA</Text>
              <Text style={styles.metricValue}>2 seconds ago</Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>LOCAL LATENCY</Text>
              <Text style={styles.metricValue}>15 ms</Text>
            </View>
          </View>
        </View>

        {/* Local Network Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>📡</Text>
            </View>
            <Text style={styles.sectionTitle}>Local Network Info</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SSID</Text>
              <Text style={styles.infoValue}>HomeWiFi_5G</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Signal Strength</Text>
              <Text style={styles.infoValue}>-40dB</Text>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📊 Open Local Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Connect to Different WiFi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>💻</Text>
            </View>
            <Text style={styles.sectionTitle}>System Information</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DEVICE NAME</Text>
              <Text style={styles.infoValue}>Adhunik Yantra — Home</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>HARDWARE ID</Text>
              <Text style={styles.infoValue}>
                {deviceInfo?.hardware_id || 'AY-7711-X092'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>UPTIME</Text>
              <Text style={styles.infoValue}>
                {deviceInfo?.uptime_seconds
                  ? formatUptime(deviceInfo.uptime_seconds)
                  : '14 days, 6 hours'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>SPIFFS/LOCAL STORAGE</Text>
              <Text style={styles.infoValue}>
                {deviceInfo?.spiffs_used_pct || 1}%
              </Text>
            </View>
          </View>
        </View>

        {/* Autonomous Offline Mode */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.expandableHeader}
            onPress={() => setExpandedOffline(!expandedOffline)}
          >
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>🔋</Text>
            </View>
            <Text style={styles.sectionTitle}>Autonomous Offline Mode</Text>
            <Text style={styles.expandIcon}>
              {expandedOffline ? '⌃' : '⌄'}
            </Text>
          </TouchableOpacity>

          {expandedOffline && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedText}>
                Even without internet, your device continues to detect, relay,
                and log faults. Real-time telemetry and circuit control remain
                fully operational — all data is stored locally and syncs when
                internet is restored.
              </Text>
            </View>
          )}
        </View>

        {/* Firmware Update */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.iconText}>⚙</Text>
            </View>
            <Text style={styles.sectionTitle}>Firmware Update</Text>
          </View>

          <View style={styles.firmwareCard}>
            <Text style={styles.firmwareStatus}>System is Up-to-Date</Text>
            <TouchableOpacity style={styles.updateButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.ACCENT_GREEN, '#00DD77']}
                style={styles.updateButtonGradient}
              >
                <Text style={styles.updateButtonText}>Update Firmware</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Device Configuration</Text>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configLabel}>DEVICE NAME</Text>
            <TextInput
              style={styles.configInput}
              value={deviceName}
              onChangeText={setDeviceName}
              placeholderTextColor={Colors.TEXT_MUTED}
            />
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/dashboard')}
        >
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📈</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚠</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🟢</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Settings</Text>
        </TouchableOpacity>
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
  backButton: {
    fontSize: 28,
    color: Colors.ACCENT_GREEN,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.ACCENT_GREEN,
    marginRight: 12,
    marginTop: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.ACCENT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 18,
    color: Colors.BG_PRIMARY,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  infoCard: {
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  actionButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  linkButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 13,
    color: Colors.ACCENT_CYAN,
  },
  expandableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandIcon: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 'auto',
  },
  expandedContent: {
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: Colors.ACCENT_CYAN,
    borderColor: Colors.BORDER_COLOR,
  },
  expandedText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  firmwareCard: {
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  firmwareStatus: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
  },
  configCard: {
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  configLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  configInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 12,
    backgroundColor: Colors.ACCENT_GREEN,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.BG_PRIMARY,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(19, 25, 41, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
    opacity: 0.5,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
  },
  navLabelActive: {
    color: Colors.ACCENT_GREEN,
  },
});
