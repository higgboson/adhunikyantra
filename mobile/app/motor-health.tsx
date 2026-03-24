import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const circuits = [
  {
    name: 'Bedroom AC',
    pf: 0.87,
    pfPrev: 0.85,
    rpm: 1450,
    temp: 42,
    vibration: 0.12,
    health: 92,
    healthColor: Colors.ACCENT_GREEN,
    status: 'GOOD',
  },
  {
    name: 'Water Pump',
    pf: 0.61,
    pfPrev: 0.82,
    rpm: 960,
    temp: 68,
    vibration: 0.38,
    health: 43,
    healthColor: Colors.DANGER_RED,
    status: 'SERVICE NEEDED',
  },
  {
    name: 'Kitchen',
    pf: 0.78,
    pfPrev: 0.79,
    rpm: 0,
    temp: 35,
    vibration: 0.05,
    health: 79,
    healthColor: Colors.WARNING_ORANGE,
    status: 'FAIR',
  },
  {
    name: 'Geyser',
    pf: 0.96,
    pfPrev: 0.95,
    rpm: 0,
    temp: 22,
    vibration: 0.02,
    health: 98,
    healthColor: Colors.ACCENT_GREEN,
    status: 'EXCELLENT',
  },
];

export default function MotorHealthScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Motor Health</Text>
        <TouchableOpacity>
          <Ionicons name="refresh-outline" size={22} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>2</Text>
              <Text style={styles.summaryLabel}>GOOD</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: Colors.ACCENT_GREEN }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>1</Text>
              <Text style={styles.summaryLabel}>FAIR</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: Colors.WARNING_ORANGE }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.DANGER_RED }]}>1</Text>
              <Text style={styles.summaryLabel}>CRITICAL</Text>
              <View style={[styles.summaryIndicator, { backgroundColor: Colors.DANGER_RED }]} />
            </View>
          </View>
        </View>

        {/* Circuit Cards */}
        {circuits.map((c) => (
          <View key={c.name} style={[styles.circuitCard, c.status === 'SERVICE NEEDED' && styles.circuitCardCritical]}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.circuitName}>{c.name}</Text>
                <View style={[styles.statusBadge, { borderColor: c.healthColor + '40', backgroundColor: c.healthColor + '14' }]}>
                  <Text style={[styles.statusBadgeText, { color: c.healthColor }]}>{c.status}</Text>
                </View>
              </View>
              <View style={styles.healthScore}>
                <View style={styles.healthRing}>
                  <Text style={[styles.healthNum, { color: c.healthColor }]}>{c.health}</Text>
                  <Text style={styles.healthPct}>%</Text>
                </View>
                <Text style={styles.healthLabel}>HEALTH</Text>
              </View>
            </View>

            {/* Health Bar */}
            <View style={styles.healthBarTrack}>
              <View style={[styles.healthBarFill, { width: `${c.health}%` as any, backgroundColor: c.healthColor }]} />
            </View>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>POWER FACTOR</Text>
                <Text style={[styles.metricVal, { color: c.pf < 0.7 ? Colors.DANGER_RED : Colors.ACCENT_GREEN }]}>
                  {c.pf.toFixed(2)}
                </Text>
                <Text style={styles.metricSub}>was {c.pfPrev.toFixed(2)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TEMPERATURE</Text>
                <Text style={[styles.metricVal, { color: c.temp > 60 ? Colors.DANGER_RED : Colors.TEXT_PRIMARY }]}>
                  {c.temp}°C
                </Text>
                <Text style={styles.metricSub}>{c.temp > 60 ? 'OVERHEATING' : 'normal'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>VIBRATION</Text>
                <Text style={[styles.metricVal, { color: c.vibration > 0.3 ? Colors.DANGER_RED : Colors.TEXT_PRIMARY }]}>
                  {c.vibration.toFixed(2)}g
                </Text>
                <Text style={styles.metricSub}>{c.vibration > 0.3 ? 'HIGH' : 'normal'}</Text>
              </View>
            </View>

            {c.status === 'SERVICE NEEDED' && (
              <TouchableOpacity style={styles.serviceBtn} activeOpacity={0.8}>
                <Ionicons name="construct-outline" size={16} color="#000" />
                <Text style={styles.serviceBtnText}>Schedule Service</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
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
  content: { paddingHorizontal: 20, gap: 12 },
  summaryCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: Colors.BORDER_COLOR },
  summaryValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.TEXT_PRIMARY },
  summaryLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED, letterSpacing: 1 },
  summaryIndicator: { width: 20, height: 3, borderRadius: 2 },
  circuitCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    gap: 14,
  },
  circuitCardCritical: {
    borderColor: Colors.DANGER_RED + '50',
    backgroundColor: 'rgba(255,51,85,0.06)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  circuitName: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY, marginBottom: 8 },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  healthScore: { alignItems: 'center', gap: 4 },
  healthRing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 40,
    width: 70,
    height: 70,
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
  },
  healthNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  healthPct: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  healthLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED, letterSpacing: 1 },
  healthBarTrack: {
    height: 6,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 3,
    overflow: 'hidden',
  },
  healthBarFill: { height: 6, borderRadius: 3 },
  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricItem: {
    flex: 1,
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  metricLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED, letterSpacing: 0.8 },
  metricVal: { fontSize: 18, fontFamily: 'Inter_700Bold', color: Colors.TEXT_PRIMARY },
  metricSub: { fontSize: 10, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  serviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.DANGER_RED,
    paddingVertical: 12,
    borderRadius: 50,
  },
  serviceBtnText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#fff' },
});
