import React, { useState } from 'react';
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
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const timeframes = ['1h', '6h', '1d', '1w', '7d', '30d'];

export default function HistoryScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');

  const faultHistory = [
    { id: 1, circuit: 'Bedroom AC', type: 'OVERLOAD', date: '12/02', time: '21:17-21:22' },
    { id: 2, circuit: 'Overpressure', type: 'OVERVOLTAGE', date: '01/06', time: '21:17' },
    { id: 3, circuit: 'Hydraulic', type: 'HVAC', date: '01/06', time: '21:14-21:31' },
  ];

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Energy Insights</Text>
          <TouchableOpacity>
            <Text style={styles.icon}>▦</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <Text style={styles.dateTitle}>History & Analytics</Text>
          <Text style={styles.dateSubtitle}>Reviewing Performance for 03.11.2025</Text>
        </View>

        {/* Timeframe Tabs */}
        <View style={styles.timeframeTabs}>
          {timeframes.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.tab,
                selectedTimeframe === tf && styles.tabActive,
              ]}
              onPress={() => setSelectedTimeframe(tf)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTimeframe === tf && styles.tabTextActive,
                ]}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total Power Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Total Power</Text>
            <Text style={styles.chartValue}>4,281.58</Text>
          </View>
          <Text style={styles.chartSubtitle}>Consumption: kWh (PLOTTING)</Text>
          
          {/* Simple Line Chart Visualization */}
          <View style={styles.chart}>
            <View style={styles.chartLine} />
          </View>
          
          <View style={styles.chartLabels}>
            <Text style={styles.chartLabel}>00:00</Text>
            <Text style={styles.chartLabel}>06:00</Text>
            <Text style={styles.chartLabel}>12:00</Text>
            <Text style={styles.chartLabel}>18:00</Text>
            <Text style={styles.chartLabel}>21:00</Text>
          </View>
        </View>

        {/* Energy Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Energy Summary</Text>
          <Text style={styles.summaryDate}>27.07 - Performance / vs Comparison: 27 - 01</Text>
          
          <View style={styles.summaryMain}>
            <View>
              <Text style={styles.summaryValue}>12 - 8</Text>
              <Text style={styles.summaryUnit}>kWh</Text>
              <Text style={styles.summaryLabel}>14% less than last week</Text>
            </View>
            
            <View style={styles.donutContainer}>
              <View style={styles.donut}>
                <Text style={styles.donutText}>82%</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Est. Daily Cost</Text>
              <Text style={styles.summaryValue2}>Rs - 92.80</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Projected:</Text>
              <Text style={styles.summaryValue3}>Rs - 311</Text>
            </View>
          </View>
        </View>

        {/* Per-Circuit Usage */}
        <View style={styles.circuitUsageCard}>
          <Text style={styles.sectionTitle}>Per-Circuit Usage</Text>
          <View style={styles.circuitBars}>
            <View style={[styles.circuitBar, { backgroundColor: Colors.ACCENT_GREEN, width: '60%' }]} />
            <View style={[styles.circuitBar, { backgroundColor: Colors.ACCENT_CYAN, width: '30%' }]} />
            <View style={[styles.circuitBar, { backgroundColor: '#FF6B35', width: '5%' }]} />
            <View style={[styles.circuitBar, { backgroundColor: '#9B59B6', width: '5%' }]} />
          </View>
        </View>

        {/* Thermal Analytics */}
        <View style={styles.thermalCard}>
          <Text style={styles.sectionTitle}>Thermal Analytics</Text>
          
          {/* Temperature Chart */}
          <View style={styles.thermalChart}>
            <View style={styles.thermalLine} />
          </View>
          
          <View style={styles.thermalAlert}>
            <View style={styles.thermalIcon}>
              <Text style={styles.thermalIconText}>🔥</Text>
            </View>
            <Text style={styles.thermalText}>
              <Text style={styles.thermalBold}>32% HIGHER</Text> than on circuit 1 at 13:14
            </Text>
          </View>
        </View>

        {/* Fault History Log */}
        <View style={styles.faultLogCard}>
          <View style={styles.faultLogHeader}>
            <Text style={styles.sectionTitle}>Fault History Log</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllButton}>VIEW ALL ↗</Text>
            </TouchableOpacity>
          </View>
          
          {faultHistory.map((fault) => (
            <View key={fault.id} style={styles.faultRow}>
              <View style={styles.faultIndicator} />
              <View style={styles.faultInfo}>
                <Text style={styles.faultCircuit}>{fault.circuit}</Text>
                <Text style={styles.faultType}>{fault.type}</Text>
              </View>
              <View style={styles.faultTime}>
                <Text style={styles.faultDate}>{fault.date}</Text>
                <Text style={styles.faultTimeText}>{fault.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.ACCENT_GREEN, '#00DD77']}
            style={styles.exportButtonGradient}
          >
            <Text style={styles.exportButtonText}>📄 EXPORT FAULT REPORT</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🟢</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>⚠</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎮</Text>
          <Text style={styles.navLabel}>Control</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
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
  backButton: {
    fontSize: 24,
    color: Colors.ACCENT_GREEN,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  icon: {
    fontSize: 24,
    color: Colors.TEXT_SECONDARY,
  },
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  dateSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  timeframeTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  tabActive: {
    backgroundColor: Colors.ACCENT_GREEN,
    borderColor: Colors.ACCENT_GREEN,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: Colors.BG_PRIMARY,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  chartValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
  },
  chartSubtitle: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    marginBottom: 16,
  },
  chart: {
    height: 100,
    marginBottom: 8,
    justifyContent: 'center',
  },
  chartLine: {
    height: 2,
    backgroundColor: Colors.ACCENT_GREEN,
    borderRadius: 1,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.TEXT_MUTED,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  summaryDate: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    marginBottom: 16,
  },
  summaryMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  summaryUnit: {
    fontSize: 14,
    color: Colors.TEXT_MUTED,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.ACCENT_GREEN,
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donut: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 12,
    borderColor: Colors.WARNING_ORANGE,
    backgroundColor: Colors.BG_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue2: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  summaryValue3: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ACCENT_CYAN,
  },
  circuitUsageCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  circuitBars: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
  },
  circuitBar: {
    height: '100%',
  },
  thermalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  thermalChart: {
    height: 80,
    marginBottom: 16,
    justifyContent: 'center',
  },
  thermalLine: {
    height: 2,
    backgroundColor: Colors.DANGER_RED,
    borderRadius: 1,
  },
  thermalAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.DANGER_RED,
  },
  thermalIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.DANGER_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thermalIconText: {
    fontSize: 16,
  },
  thermalText: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  thermalBold: {
    fontWeight: '700',
    color: Colors.DANGER_RED,
  },
  faultLogCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  faultLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.ACCENT_CYAN,
  },
  faultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  faultIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.DANGER_RED,
    marginRight: 12,
  },
  faultInfo: {
    flex: 1,
  },
  faultCircuit: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  faultType: {
    fontSize: 12,
    color: Colors.TEXT_MUTED,
  },
  faultTime: {
    alignItems: 'flex-end',
  },
  faultDate: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  faultTimeText: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
  },
  exportButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 1,
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
