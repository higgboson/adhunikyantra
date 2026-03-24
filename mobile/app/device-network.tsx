import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const deviceInfo = {
  firmware: 'v4.0.2-GENESIS',
  hardware: 'AY-7711-X092',
  uptime: '14 days 3h',
  wifi: 'HomeWiFi_5G',
  ip: '192.168.1.156',
  signal: -48,
  storage: 1,
  lastSeen: 'Just now',
};

export default function DeviceNetworkScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRestore, setAutoRestore] = useState(false);
  const [cloudSync, setCloudSync] = useState(true);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const signalStrength = Math.min(100, Math.round(((deviceInfo.signal + 100) / 70) * 100));
  const signalColor = signalStrength > 70 ? Colors.ACCENT_GREEN : signalStrength > 40 ? Colors.WARNING_ORANGE : Colors.DANGER_RED;

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device & Network</Text>
        <View style={styles.liveDot}>
          <View style={styles.liveDotInner} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={styles.deviceIconWrap}>
              <Ionicons name="hardware-chip-outline" size={28} color={Colors.ACCENT_GREEN} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Adhunik Yantra</Text>
              <Text style={styles.statusSub}>{deviceInfo.hardware}</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          </View>

          <View style={styles.uptimeRow}>
            <Ionicons name="time-outline" size={14} color={Colors.TEXT_MUTED} />
            <Text style={styles.uptimeText}>Uptime: {deviceInfo.uptime}</Text>
            <Text style={styles.lastSeenText}>Last seen: {deviceInfo.lastSeen}</Text>
          </View>
        </View>

        {/* Network Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NETWORK</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="wifi" size={16} color={Colors.ACCENT_CYAN} />
                <Text style={styles.infoLabelText}>WiFi Network</Text>
              </View>
              <Text style={styles.infoValue}>{deviceInfo.wifi}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="globe-outline" size={16} color={Colors.ACCENT_CYAN} />
                <Text style={styles.infoLabelText}>IP Address</Text>
              </View>
              <Text style={styles.infoValue}>{deviceInfo.ip}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="cellular-outline" size={16} color={signalColor} />
                <Text style={styles.infoLabelText}>Signal Strength</Text>
              </View>
              <View style={styles.signalRight}>
                <Text style={[styles.infoValue, { color: signalColor }]}>{deviceInfo.signal} dBm</Text>
                <View style={styles.signalBarTrack}>
                  <View style={[styles.signalBarFill, { width: `${signalStrength}%` as any, backgroundColor: signalColor }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Firmware Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FIRMWARE</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="code-slash-outline" size={16} color={Colors.ACCENT_CYAN} />
                <Text style={styles.infoLabelText}>Version</Text>
              </View>
              <Text style={styles.infoValue}>{deviceInfo.firmware}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="save-outline" size={16} color={Colors.ACCENT_CYAN} />
                <Text style={styles.infoLabelText}>Storage Used</Text>
              </View>
              <Text style={styles.infoValue}>{deviceInfo.storage}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <TouchableOpacity style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="cloud-download-outline" size={16} color={Colors.ACCENT_GREEN} />
                <Text style={[styles.infoLabelText, { color: Colors.ACCENT_GREEN }]}>Check for Updates</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.infoCard}>
            {[
              {
                icon: 'notifications-outline' as const,
                label: 'Push Notifications',
                sub: 'Fault and alert notifications',
                val: notificationsEnabled,
                set: setNotificationsEnabled,
              },
              {
                icon: 'flash-outline' as const,
                label: 'Auto-Restore Power',
                sub: 'Restore after resolved faults',
                val: autoRestore,
                set: setAutoRestore,
              },
              {
                icon: 'cloud-outline' as const,
                label: 'Cloud Sync',
                sub: 'Sync data to Adhunik cloud',
                val: cloudSync,
                set: setCloudSync,
              },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Ionicons name={s.icon} size={18} color={Colors.TEXT_SECONDARY} />
                    <View>
                      <Text style={styles.toggleLabel}>{s.label}</Text>
                      <Text style={styles.toggleSub}>{s.sub}</Text>
                    </View>
                  </View>
                  <Switch
                    value={s.val}
                    onValueChange={s.set}
                    trackColor={{ false: Colors.BORDER_LIGHT, true: Colors.ACCENT_GREEN + '70' }}
                    thumbColor={s.val ? Colors.ACCENT_GREEN : Colors.TEXT_MUTED}
                  />
                </View>
                {i < arr.length - 1 && <View style={styles.infoDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.DANGER_RED + 'AA' }]}>DANGER ZONE</Text>
          <View style={styles.dangerCard}>
            <TouchableOpacity style={styles.dangerRow}>
              <View style={styles.dangerLeft}>
                <Ionicons name="refresh-outline" size={18} color={Colors.WARNING_ORANGE} />
                <Text style={styles.dangerText}>Factory Reset Device</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
            <View style={styles.infoDivider} />
            <TouchableOpacity style={styles.dangerRow}>
              <View style={styles.dangerLeft}>
                <Ionicons name="unlink-outline" size={18} color={Colors.DANGER_RED} />
                <Text style={[styles.dangerText, { color: Colors.DANGER_RED }]}>Remove Device</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          </View>
        </View>
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
  headerTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  liveDot: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.ACCENT_GREEN,
  },
  content: { paddingHorizontal: 20, gap: 16 },
  statusCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN + '30',
    gap: 14,
  },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deviceIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.ACCENT_GREEN + '15',
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: { flex: 1 },
  statusTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  statusSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED, marginTop: 3 },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.ACCENT_GREEN + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.ACCENT_GREEN },
  onlineText: { fontSize: 11, fontFamily: 'Inter_700Bold', color: Colors.ACCENT_GREEN },
  uptimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    padding: 10,
  },
  uptimeText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.TEXT_SECONDARY, flex: 1 },
  lastSeenText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  infoCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabelText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.TEXT_SECONDARY },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  infoDivider: { height: 1, backgroundColor: Colors.BORDER_COLOR, marginHorizontal: 16 },
  signalRight: { alignItems: 'flex-end', gap: 4 },
  signalBarTrack: {
    width: 80,
    height: 4,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 2,
    overflow: 'hidden',
  },
  signalBarFill: { height: 4, borderRadius: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.TEXT_PRIMARY },
  toggleSub: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED, marginTop: 2 },
  dangerCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.DANGER_RED + '30',
    overflow: 'hidden',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dangerText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.WARNING_ORANGE },
});
