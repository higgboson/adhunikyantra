import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { mockFirebase } from '@/services/mockFirebase';
import { useAppStore } from '@/store/appStore';
import { DEVICE_ID } from '@/constants/circuit';
import type { LiveData, CircuitData } from '@/types/firebase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const NAV_ITEMS = [
  { icon: 'time-outline' as const, label: 'History', route: '/history' as const },
  { icon: 'warning-outline' as const, label: 'Alerts', route: '/alerts' as const },
  { icon: 'flash-outline' as const, label: 'Control', route: '/circuit-analyser' as const },
  { icon: 'settings-outline' as const, label: 'Settings', route: '/device-network' as const },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { liveData, circuits, setLiveData, setCircuitData } = useAppStore();
  const [activeFault, setActiveFault] = useState<any>(null);

  const bottomPad = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 16);
  const navHeight = 70 + bottomPad;

  useEffect(() => {
    const unsubLive = mockFirebase.onValue(`devices/${DEVICE_ID}/live`, (data) => {
      if (data) setLiveData(data);
    });

    const unsubCircuits = [1, 2, 3, 4].map((num) =>
      mockFirebase.onValue(`devices/${DEVICE_ID}/circuits/circuit_${num}`, (data) => {
        if (data) setCircuitData(`circuit_${num}`, data);
      })
    );

    const unsubFaults = mockFirebase.onValue(
      `devices/${DEVICE_ID}/faults/active`,
      (faults) => {
        if (faults && Object.keys(faults).length > 0) {
          setActiveFault(Object.values(faults)[0]);
        } else {
          setActiveFault(null);
        }
      }
    );

    return () => {
      unsubLive();
      unsubCircuits.forEach((u) => u());
      unsubFaults();
    };
  }, []);

  const getCircuitStatus = (circuit: CircuitData) => {
    if (!circuit) return 'UNKNOWN';
    if (circuit.fault_active) return 'FAULT';
    if (!circuit.relay_state) return 'STANDBY';
    if (circuit.current_a > 5) return 'HEAVY LOAD';
    if (circuit.current_a > 1) return 'CONNECTED';
    return 'IDLE';
  };

  const getCircuitStatusColor = (circuit: CircuitData) => {
    if (!circuit) return Colors.TEXT_MUTED;
    if (circuit.fault_active) return Colors.DANGER_RED;
    if (!circuit.relay_state) return Colors.TEXT_MUTED;
    if (circuit.current_a > 5) return Colors.WARNING_ORANGE;
    return Colors.ACCENT_GREEN;
  };

  const getStatusMessage = (circuit: CircuitData) => {
    if (!circuit) return '';
    if (circuit.fault_active) return '⚠ FAULT DETECTED';
    if (!circuit.relay_state && !circuit.ewma_trained) return '🔄 LEARNING BASELINE...';
    if (circuit.current_a > circuit.ewma_baseline * 1.2) return '⚠ HIGHER THAN USUAL';
    return '✓ NORMAL PATTERN';
  };

  const getCurrentBarWidth = (circuit: CircuitData) => {
    if (!circuit) return 0;
    const maxA = 8;
    return Math.min((circuit.current_a / maxA) * 100, 100);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authenticated');
    mockFirebase.stopDataGenerator();
    router.replace('/auth');
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: navHeight + 16 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <View>
            <Text style={styles.headerTitle}>⚡ ADHUNIK YANTRA</Text>
            <Text style={styles.headerSub}>SECURE NODE: 77.102.AX</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/alerts')}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.TEXT_PRIMARY} />
              {activeFault && <View style={styles.badgeDot} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={Colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Fault Banner */}
        {activeFault && (
          <TouchableOpacity
            style={styles.faultBanner}
            onPress={() => router.push('/fault-detail')}
            activeOpacity={0.8}
          >
            <View style={styles.faultBannerLeft}>
              <Ionicons name="alert-circle" size={20} color={Colors.DANGER_RED} />
              <View>
                <Text style={styles.faultBannerTitle}>ACTIVE FAULT DETECTED</Text>
                <Text style={styles.faultBannerSub}>
                  {activeFault.type?.toUpperCase()} · {activeFault.circuit?.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.DANGER_RED} />
          </TouchableOpacity>
        )}

        {/* Live Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.mainMetric}>
              <Text style={styles.mainMetricLabel}>TOTAL LOAD</Text>
              <Text style={styles.mainMetricValue}>
                {liveData?.total_power_w?.toFixed(0) || '0'}
                <Text style={styles.mainMetricUnit}> W</Text>
              </Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            {[
              { label: 'VOLTAGE', value: `${liveData?.voltage_v?.toFixed(1) || '230.0'}V`, icon: 'flash-outline' as const, color: Colors.ACCENT_GREEN },
              { label: 'LEAKAGE', value: `${liveData?.leakage_ma?.toFixed(1) || '0.3'}mA`, icon: 'shield-outline' as const, color: Colors.ACCENT_CYAN },
              { label: 'TEMP', value: `${liveData?.ambient_temp_c?.toFixed(1) || '24.5'}°C`, icon: 'thermometer-outline' as const, color: Colors.WARNING_ORANGE },
              { label: 'HUMIDITY', value: `${liveData?.ambient_humidity || '52'}%`, icon: 'water-outline' as const, color: Colors.ACCENT_CYAN },
            ].map((m) => (
              <View key={m.label} style={styles.metricChip}>
                <Ionicons name={m.icon} size={14} color={m.color} />
                <Text style={styles.metricChipLabel}>{m.label}</Text>
                <Text style={[styles.metricChipValue, { color: m.color }]}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CIRCUIT MONITOR</Text>
          <TouchableOpacity onPress={() => router.push('/motor-health')}>
            <Text style={styles.sectionLink}>Motor Health →</Text>
          </TouchableOpacity>
        </View>

        {/* Circuit Cards */}
        {[1, 2, 3, 4].map((num) => {
          const circuit = circuits[`circuit_${num}`];
          if (!circuit) return null;
          const status = getCircuitStatus(circuit);
          const statusColor = getCircuitStatusColor(circuit);
          const barWidth = getCurrentBarWidth(circuit);
          const barColor =
            circuit.fault_active
              ? Colors.DANGER_RED
              : circuit.current_a > 5
              ? Colors.WARNING_ORANGE
              : Colors.ACCENT_GREEN;

          return (
            <TouchableOpacity
              key={num}
              style={[
                styles.circuitCard,
                circuit.fault_active && styles.circuitCardFault,
              ]}
              onPress={() => circuit.fault_active && router.push('/fault-detail')}
              activeOpacity={0.8}
            >
              <View style={[styles.circuitIndicator, { backgroundColor: statusColor }]} />
              <View style={styles.circuitContent}>
                <View style={styles.circuitTop}>
                  <View style={styles.circuitLeft}>
                    <Text style={styles.circuitName}>{circuit.name}</Text>
                    <View style={[styles.statusBadge, { borderColor: statusColor + '40', backgroundColor: statusColor + '14' }]}>
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{status}</Text>
                    </View>
                  </View>
                  <View style={styles.circuitRight}>
                    <Text style={[styles.circuitCurrent, { color: statusColor }]}>
                      {circuit.current_a.toFixed(1)}A
                    </Text>
                    <Text style={styles.circuitPower}>{circuit.power_w}W</Text>
                  </View>
                </View>

                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${barWidth}%` as any, backgroundColor: barColor }]} />
                </View>

                <View style={styles.circuitFooter}>
                  <Text style={[styles.circuitMsg, { color: circuit.fault_active ? Colors.DANGER_RED : Colors.TEXT_MUTED }]}>
                    {getStatusMessage(circuit)}
                  </Text>
                  <Text style={styles.circuitTemp}>
                    <Ionicons name="thermometer-outline" size={11} color={Colors.TEXT_MUTED} /> {circuit.temp_c}°C
                  </Text>
                </View>

                {!circuit.ewma_trained && (
                  <View style={styles.trainingBar}>
                    <View style={[styles.trainingFill, { width: `${circuit.ewma_training_pct}%` as any }]} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: bottomPad, height: navHeight }]}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => router.push(item.route)}
            activeOpacity={0.7}
          >
            <Ionicons name={item.icon} size={22} color={Colors.TEXT_SECONDARY} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
    marginTop: 3,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.DANGER_RED,
    borderWidth: 1.5,
    borderColor: Colors.BG_PRIMARY,
  },
  faultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,51,85,0.12)',
    borderWidth: 1,
    borderColor: Colors.DANGER_RED + '60',
  },
  faultBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faultBannerTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.DANGER_RED,
    letterSpacing: 0.5,
  },
  faultBannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  mainMetric: {},
  mainMetricLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  mainMetricValue: {
    fontSize: 40,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_PRIMARY,
  },
  mainMetricUnit: {
    fontSize: 20,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,255,136,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN + '40',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.ACCENT_GREEN,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricChip: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    padding: 10,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  metricChipLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
  },
  metricChipValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  sectionLink: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.ACCENT_CYAN,
  },
  circuitCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    overflow: 'hidden',
  },
  circuitCardFault: {
    borderColor: Colors.DANGER_RED + '60',
    backgroundColor: 'rgba(255,51,85,0.06)',
  },
  circuitIndicator: {
    width: 4,
  },
  circuitContent: { flex: 1, padding: 14 },
  circuitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  circuitLeft: { gap: 6 },
  circuitName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_PRIMARY,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  circuitRight: { alignItems: 'flex-end' },
  circuitCurrent: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  circuitPower: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
  },
  barTrack: {
    height: 4,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  circuitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circuitMsg: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  circuitTemp: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
  },
  trainingBar: {
    height: 2,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  trainingFill: {
    height: 2,
    backgroundColor: Colors.ACCENT_CYAN,
    borderRadius: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(13,18,30,0.96)',
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
    paddingTop: 10,
  },
  navItem: { alignItems: 'center', gap: 4, paddingHorizontal: 12 },
  navLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
  },
});
