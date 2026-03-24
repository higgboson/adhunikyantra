import React, { useState } from 'react';
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

type AlertType = 'critical' | 'warning' | 'info' | 'resolved';

interface Alert {
  id: number;
  type: AlertType;
  title: string;
  circuit: string;
  description: string;
  timestamp: string;
  actionLabel?: string;
  extraInfo?: string;
  resolved?: boolean;
}

const allAlerts: Alert[] = [
  {
    id: 1,
    type: 'critical',
    title: 'Short Circuit Detected',
    circuit: 'KITCHEN MAIN',
    description: 'Circuit isolated in 100ms. Check wiring immediately.',
    timestamp: '2 min ago',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Overload Warning',
    circuit: 'BEDROOM AC',
    description: 'Current: 6.8A (Limit: 6.0A). Consider switching off high-load devices.',
    timestamp: '15 min ago',
  },
  {
    id: 3,
    type: 'info',
    title: 'Device Left On',
    circuit: 'GEYSER',
    description: 'Running for 4h 15m — Rs. 35 extra spent.',
    timestamp: '1h ago',
    extraInfo: 'PROJECTED WASTE: Rs. 35',
    actionLabel: 'Turn Off Now',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Pump Motor Wear',
    circuit: 'WATER PUMP',
    description: 'Power factor dropped from 0.82 to 0.61 — Schedule service soon.',
    timestamp: '3h ago',
    actionLabel: 'Schedule Service',
  },
  {
    id: 5,
    type: 'resolved',
    title: 'Earth Leakage Detected',
    circuit: 'MAIN LINE',
    description: 'Main line insulation checked and repaired.',
    timestamp: '1 day ago',
    resolved: true,
  },
];

const getAlertColor = (type: AlertType) => {
  switch (type) {
    case 'critical': return Colors.DANGER_RED;
    case 'warning': return Colors.WARNING_ORANGE;
    case 'info': return Colors.ACCENT_CYAN;
    case 'resolved': return Colors.TEXT_MUTED;
  }
};

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'critical': return 'alert-circle' as const;
    case 'warning': return 'warning' as const;
    case 'info': return 'bulb-outline' as const;
    case 'resolved': return 'checkmark-circle' as const;
  }
};

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'faults'>('all');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = allAlerts.filter((a) => {
    if (activeTab === 'active') return a.type === 'critical' || a.type === 'warning';
    if (activeTab === 'faults') return a.type === 'critical';
    return true;
  });

  const activeCnt = allAlerts.filter((a) => a.type === 'critical' || a.type === 'warning').length;
  const faultsCnt = allAlerts.filter((a) => a.type === 'critical').length;

  const tabs = [
    { key: 'all' as const, label: 'All', count: allAlerts.length },
    { key: 'active' as const, label: 'Active', count: activeCnt },
    { key: 'faults' as const, label: 'Faults', count: faultsCnt },
  ];

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Alerts</Text>
        <TouchableOpacity style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setActiveTab(t.key)}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
            <View style={[styles.tabBadge, activeTab === t.key && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === t.key && styles.tabBadgeTextActive]}>
                {t.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((alert) => {
          const color = getAlertColor(alert.type);
          const icon = getAlertIcon(alert.type);

          return (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, { borderLeftColor: color }]}
              onPress={() => (alert.type === 'critical' || alert.type === 'warning') && router.push('/fault-detail')}
              activeOpacity={0.8}
            >
              <View style={styles.alertTop}>
                <View style={[styles.alertIconWrap, { backgroundColor: color + '20' }]}>
                  <Ionicons name={icon} size={20} color={color} />
                </View>
                <View style={styles.alertInfo}>
                  <View style={styles.alertTitleRow}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    {alert.resolved && (
                      <View style={styles.resolvedBadge}>
                        <Text style={styles.resolvedText}>RESOLVED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.alertCircuit, { color }]}>{alert.circuit}</Text>
                </View>
                {!alert.resolved && (
                  <Ionicons name="chevron-forward" size={16} color={Colors.TEXT_MUTED} />
                )}
              </View>

              <Text style={styles.alertDesc}>{alert.description}</Text>

              {alert.extraInfo && (
                <View style={styles.extraInfoBox}>
                  <Text style={[styles.extraInfoText, { color }]}>{alert.extraInfo}</Text>
                </View>
              )}

              <View style={styles.alertFooter}>
                <Text style={styles.alertTime}>{alert.timestamp}</Text>
                {alert.actionLabel && (
                  <TouchableOpacity style={[styles.actionBtn, { borderColor: color + '60' }]}>
                    <Text style={[styles.actionBtnText, { color }]}>{alert.actionLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
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
  markAllBtn: { paddingHorizontal: 8 },
  markAllText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.ACCENT_CYAN,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  tabActive: {
    backgroundColor: Colors.ACCENT_GREEN + '18',
    borderColor: Colors.ACCENT_GREEN + '50',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
  },
  tabTextActive: { color: Colors.ACCENT_GREEN, fontFamily: 'Inter_600SemiBold' },
  tabBadge: {
    backgroundColor: Colors.BORDER_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: Colors.ACCENT_GREEN + '30' },
  tabBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
  },
  tabBadgeTextActive: { color: Colors.ACCENT_GREEN },
  list: { paddingHorizontal: 20, gap: 12 },
  alertCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    borderLeftWidth: 5,
    padding: 14,
    gap: 10,
  },
  alertTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  alertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertInfo: { flex: 1 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  alertTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_PRIMARY,
  },
  resolvedBadge: {
    backgroundColor: Colors.TEXT_MUTED + '30',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resolvedText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
  },
  alertCircuit: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  alertDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  extraInfoBox: {
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  extraInfoText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTime: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
