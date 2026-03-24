import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { mockFirebase } from '../services/mockFirebase';
import { useAppStore } from '../store/appStore';
import { DEVICE_ID } from '../constants/circuit';
import type { LiveData, CircuitData } from '../types/firebase';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { liveData, circuits, setLiveData, setCircuitData } = useAppStore();
  const [activeFault, setActiveFault] = useState<any>(null);

  useEffect(() => {
    // Subscribe to live data
    const unsubLive = mockFirebase.onValue(
      `devices/${DEVICE_ID}/live`,
      (data) => {
        setLiveData(data);
      }
    );

    // Subscribe to all circuits
    const unsubCircuits = [1, 2, 3, 4].map((num) =>
      mockFirebase.onValue(
        `devices/${DEVICE_ID}/circuits/circuit_${num}`,
        (data) => {
          setCircuitData(`circuit_${num}`, data);
        }
      )
    );

    // Subscribe to active faults
    const unsubFaults = mockFirebase.onValue(
      `devices/${DEVICE_ID}/faults/active`,
      (faults) => {
        if (faults && Object.keys(faults).length > 0) {
          const firstFault = Object.values(faults)[0] as any;
          setActiveFault(firstFault);
        } else {
          setActiveFault(null);
        }
      }
    );

    return () => {
      unsubLive();
      unsubCircuits.forEach((unsub) => unsub());
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

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚡ ADHUNIK YANTRA</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>⚙</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Data Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.mainMetric}>
            <Text style={styles.mainMetricLabel}>TOTAL LOAD</Text>
            <Text style={styles.mainMetricValue}>
              {liveData?.total_power_w?.toFixed(0) || '0'}
              <Text style={styles.mainMetricUnit}> W</Text>
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>VOLTAGE</Text>
              <Text style={styles.metricValue}>
                {liveData?.voltage_v?.toFixed(0) || '0'}
                <Text style={styles.metricUnit}> V</Text>
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>LEAKAGE</Text>
              <Text style={styles.metricValue}>
                {liveData?.leakage_ma?.toFixed(1) || '0'}
                <Text style={styles.metricUnit}> mA</Text>
              </Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>AMBIENT</Text>
              <Text style={styles.metricValue}>
                {liveData?.ambient_temp_c?.toFixed(1) || '0'}
                <Text style={styles.metricUnit}> °C</Text>
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>HUMIDITY</Text>
              <Text style={styles.metricValue}>
                {liveData?.ambient_humidity?.toFixed(0) || '0'}
                <Text style={styles.metricUnit}> %</Text>
              </Text>
            </View>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>STABLE SYSTEM</Text>
          </View>
        </View>

        {/* Fault Banner */}
        {activeFault && (
          <TouchableOpacity 
            style={styles.faultBanner} 
            activeOpacity={0.8}
            onPress={() => router.push('/fault-detail')}
          >
            <View style={styles.faultIcon}>
              <Text style={styles.faultIconText}>⚠</Text>
            </View>
            <View style={styles.faultContent}>
              <Text style={styles.faultTitle}>OVERLOAD</Text>
              <Text style={styles.faultSubtitle}>
                {circuits.circuit_1?.name || 'Circuit 1'} — {activeFault.measured_value}A
              </Text>
            </View>
            <View style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>DETAILS</Text>
            </View>
            <TouchableOpacity style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Circuit Status Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Circuit Status</Text>
          <Text style={styles.sectionSubtitle}>(4)</Text>
          <TouchableOpacity>
            <Text style={styles.expandButton}>EXPAND ALL</Text>
          </TouchableOpacity>
        </View>

        {/* Circuit Cards */}
        {[1, 2, 3, 4].map((num) => {
          const circuitKey = `circuit_${num}`;
          const circuit = circuits[circuitKey];
          if (!circuit) return null;

          const status = getCircuitStatus(circuit);
          const statusColor = getCircuitStatusColor(circuit);
          const isFault = circuit.fault_active;
          const isStandby = !circuit.relay_state;

          return (
            <View
              key={circuitKey}
              style={[
                styles.circuitCard,
                isFault && styles.circuitCardFault,
              ]}
            >
              {/* Circuit Header */}
              <View style={styles.circuitHeader}>
                <View style={styles.circuitIconContainer}>
                  <Text style={styles.circuitIcon}>
                    {isFault ? '⚠' : isStandby ? '⏸' : '⚡'}
                  </Text>
                </View>
                <View style={styles.circuitInfo}>
                  <Text style={styles.circuitName}>{circuit.name}</Text>
                  <Text
                    style={[
                      styles.circuitStatus,
                      { color: statusColor },
                    ]}
                  >
                    {status}
                  </Text>
                </View>
                <View
                  style={[
                    styles.relayIndicator,
                    circuit.relay_state && styles.relayIndicatorOn,
                  ]}
                />
              </View>

              {/* Circuit Metrics */}
              <View style={styles.circuitMetrics}>
                <View style={styles.circuitMetricItem}>
                  <Text style={styles.circuitMetricLabel}>AMPS</Text>
                  <Text style={styles.circuitMetricValue}>
                    {circuit.current_a.toFixed(1)}
                    <Text style={styles.circuitMetricUnit}>A</Text>
                  </Text>
                </View>

                <View style={styles.circuitMetricItem}>
                  <Text style={styles.circuitMetricLabel}>WATTS</Text>
                  <Text style={styles.circuitMetricValue}>
                    {circuit.power_w.toFixed(0)}
                    <Text style={styles.circuitMetricUnit}>W</Text>
                  </Text>
                </View>

                <View style={styles.circuitMetricItem}>
                  <Text style={styles.circuitMetricLabel}>TEMP</Text>
                  <Text style={styles.circuitMetricValue}>
                    {circuit.temp_c.toFixed(0)}
                    <Text style={styles.circuitMetricUnit}>°C</Text>
                  </Text>
                </View>
              </View>

              {/* Status Message */}
              <View style={styles.circuitStatusBar}>
                <Text
                  style={[
                    styles.circuitStatusMessage,
                    { color: statusColor },
                  ]}
                >
                  {getStatusMessage(circuit)}
                </Text>
                <TouchableOpacity>
                  <Text style={styles.expandIcon}>=</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🟢</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
          <Text style={styles.navIcon}>📉</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚠</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎮</Text>
          <Text style={styles.navLabel}>Control</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/device-network')}>
          <Text style={styles.navIcon}>⚙</Text>
          <Text style={styles.navLabel}>Settings</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.BG_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  mainMetric: {
    marginBottom: 20,
  },
  mainMetricLabel: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainMetricValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
  },
  mainMetricUnit: {
    fontSize: 24,
    fontWeight: '400',
    color: Colors.TEXT_SECONDARY,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.TEXT_SECONDARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ACCENT_GREEN,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 1,
  },
  faultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.DANGER_RED,
  },
  faultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.DANGER_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faultIconText: {
    fontSize: 24,
    color: Colors.TEXT_PRIMARY,
  },
  faultContent: {
    flex: 1,
  },
  faultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.DANGER_RED,
    marginBottom: 4,
  },
  faultSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_PRIMARY,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.DANGER_RED,
    borderRadius: 8,
    marginRight: 8,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    letterSpacing: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '300',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.TEXT_MUTED,
    marginLeft: 8,
    marginRight: 'auto',
  },
  expandButton: {
    fontSize: 12,
    color: Colors.ACCENT_CYAN,
    fontWeight: '600',
  },
  circuitCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  circuitCardFault: {
    borderColor: Colors.DANGER_RED,
    borderWidth: 2,
  },
  circuitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  circuitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BG_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  circuitIcon: {
    fontSize: 20,
  },
  circuitInfo: {
    flex: 1,
  },
  circuitName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  circuitStatus: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  relayIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.TEXT_MUTED,
  },
  relayIndicatorOn: {
    backgroundColor: Colors.ACCENT_GREEN,
  },
  circuitMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  circuitMetricItem: {
    flex: 1,
  },
  circuitMetricLabel: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  circuitMetricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  circuitMetricUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.TEXT_SECONDARY,
  },
  circuitStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circuitStatusMessage: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: Colors.TEXT_MUTED,
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
    fontSize: 22,
    marginBottom: 4,
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
