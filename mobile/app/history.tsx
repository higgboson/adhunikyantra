import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const timeframes = ['24H', '7D', '30D'];

const circuitCosts = [
  { name: 'Bedroom AC', kwh: 18.4, cost: 147, pct: 65, color: Colors.DANGER_RED },
  { name: 'Kitchen', kwh: 4.2, cost: 34, pct: 21, color: Colors.WARNING_ORANGE },
  { name: 'Geyser', kwh: 2.1, cost: 17, pct: 11, color: Colors.ACCENT_CYAN },
  { name: 'Water Pump', kwh: 0.6, cost: 5, pct: 3, color: Colors.ACCENT_GREEN },
];

const faultLog = [
  { id: 1, type: 'OVERLOAD', circuit: 'Bedroom AC', time: '03.11.2025 · 08:42', resolved: true },
  { id: 2, type: 'THERMAL', circuit: 'Water Pump', time: '03.11.2025 · 09:17', resolved: false },
  { id: 3, type: 'LEAKAGE', circuit: 'Main Line', time: '02.11.2025 · 22:05', resolved: true },
];

const chartData = [120, 180, 230, 160, 290, 210, 310, 190, 270, 230, 195, 250];
const chartLabels = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTF, setSelectedTF] = useState('24H');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const maxChart = Math.max(...chartData);
  const chartH = 100;

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>History & Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color={Colors.TEXT_SECONDARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Timeframe */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Reviewing: 03.11.2025</Text>
          <View style={styles.tfRow}>
            {timeframes.map((tf) => (
              <TouchableOpacity
                key={tf}
                onPress={() => setSelectedTF(tf)}
                style={[styles.tfBtn, selectedTF === tf && styles.tfBtnActive]}
              >
                <Text style={[styles.tfText, selectedTF === tf && styles.tfTextActive]}>{tf}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total Power Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Total Power Consumption</Text>
              <Text style={styles.chartValue}>4,281 <Text style={styles.chartUnit}>kWh</Text></Text>
            </View>
            <View style={styles.chartBadge}>
              <Ionicons name="trending-up" size={14} color={Colors.WARNING_ORANGE} />
              <Text style={styles.chartBadgeText}>+12%</Text>
            </View>
          </View>

          {/* Bar Chart */}
          <View style={styles.chart}>
            {chartData.map((val, i) => {
              const h = (val / maxChart) * chartH;
              const isHigh = val > 260;
              return (
                <View key={i} style={styles.barWrap}>
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: isHigh ? Colors.WARNING_ORANGE : Colors.ACCENT_GREEN },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            {chartLabels.filter((_, i) => i % 2 === 0).map((l) => (
              <Text key={l} style={styles.chartFooterLabel}>{l}:00</Text>
            ))}
          </View>
        </View>

        {/* Today's Cost */}
        <View style={styles.costSummary}>
          <View style={styles.costTop}>
            <Text style={styles.costLabel}>TODAY'S ELECTRICITY COST</Text>
            <Text style={styles.costValue}>Rs. <Text style={styles.costAmount}>203</Text></Text>
          </View>
          <Text style={styles.costSub}>
            At Rs. 8/unit · <Text style={{ color: Colors.ACCENT_GREEN }}>Avg: Rs. 175/day</Text>
          </Text>
        </View>

        {/* Circuit Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CIRCUIT BREAKDOWN</Text>
          {circuitCosts.map((c) => (
            <View key={c.name} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: c.color }]} />
                <View>
                  <Text style={styles.breakdownName}>{c.name}</Text>
                  <Text style={styles.breakdownKwh}>{c.kwh} kWh</Text>
                </View>
              </View>
              <View style={styles.breakdownRight}>
                <Text style={styles.breakdownCost}>Rs. {c.cost}</Text>
                <View style={styles.breakdownBarTrack}>
                  <View style={[styles.breakdownBarFill, { width: `${c.pct}%` as any, backgroundColor: c.color }]} />
                </View>
                <Text style={styles.breakdownPct}>{c.pct}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fault Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAULT LOG</Text>
          {faultLog.map((f) => (
            <View key={f.id} style={styles.faultRow}>
              <View style={[styles.faultDot, { backgroundColor: f.resolved ? Colors.TEXT_MUTED : Colors.DANGER_RED }]} />
              <View style={styles.faultInfo}>
                <Text style={styles.faultType}>{f.type}</Text>
                <Text style={styles.faultCircuit}>{f.circuit} · {f.time}</Text>
              </View>
              <View style={[styles.faultStatus, f.resolved ? styles.faultResolved : styles.faultActive]}>
                <Text style={[styles.faultStatusText, { color: f.resolved ? Colors.TEXT_MUTED : Colors.DANGER_RED }]}>
                  {f.resolved ? 'RESOLVED' : 'ACTIVE'}
                </Text>
              </View>
            </View>
          ))}
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
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_PRIMARY,
  },
  content: { paddingHorizontal: 20, gap: 16 },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: { fontSize: 13, fontFamily: 'Inter_500Medium', color: Colors.TEXT_SECONDARY },
  tfRow: { flexDirection: 'row', gap: 4 },
  tfBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  tfBtnActive: { backgroundColor: Colors.ACCENT_GREEN + '20', borderColor: Colors.ACCENT_GREEN + '60' },
  tfText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_MUTED },
  tfTextActive: { color: Colors.ACCENT_GREEN },
  chartCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  chartLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.TEXT_SECONDARY, marginBottom: 4 },
  chartValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.TEXT_PRIMARY },
  chartUnit: { fontSize: 16, color: Colors.TEXT_SECONDARY },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.WARNING_ORANGE + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chartBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.WARNING_ORANGE },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
    marginBottom: 8,
  },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  chartFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  chartFooterLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  costSummary: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    gap: 6,
  },
  costTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  costLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
  },
  costValue: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.TEXT_SECONDARY },
  costAmount: { fontSize: 28, fontFamily: 'Inter_700Bold', color: Colors.WARNING_ORANGE },
  costSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  breakdownDot: { width: 12, height: 12, borderRadius: 6 },
  breakdownName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  breakdownKwh: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED, marginTop: 2 },
  breakdownRight: { alignItems: 'flex-end', gap: 4, flex: 1, marginLeft: 16 },
  breakdownCost: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  breakdownBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.BORDER_COLOR,
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: { height: 4, borderRadius: 2 },
  breakdownPct: { fontSize: 11, fontFamily: 'Inter_500Medium', color: Colors.TEXT_MUTED },
  faultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  faultDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  faultInfo: { flex: 1 },
  faultType: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  faultCircuit: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED, marginTop: 2 },
  faultStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  faultResolved: { backgroundColor: Colors.TEXT_MUTED + '20' },
  faultActive: { backgroundColor: Colors.DANGER_RED + '20' },
  faultStatusText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
});
