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
import * as Haptics from 'expo-haptics';

const fault = {
  type: 'OVERLOAD',
  circuit: 'Bedroom AC',
  measured: 7.8,
  threshold: 6.0,
  difference: 1.8,
  percentage: 30,
  timeAgo: '2.0 seconds',
  status: 'ISOLATED',
};

const checklistItems = [
  { id: 1, label: 'Unplug appliance', description: 'Remove power from the appliance causing the fault' },
  { id: 2, label: 'Check wiring', description: 'Inspect for damage, burnt smell, or loose connections' },
  { id: 3, label: 'Acknowledge risk', description: 'I understand the risks of re-energization' },
];

export default function FaultDetailScreen() {
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [restoring, setRestoring] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const allChecked = checklistItems.every((item) => checked[item.id]);

  const toggle = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRestore = () => {
    if (!allChecked) return;
    setRestoring(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setRestoring(false);
      router.back();
    }, 2000);
  };

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fault Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 32) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Critical Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertBadge}>
            <Ionicons name="alert-circle" size={14} color={Colors.DANGER_RED} />
            <Text style={styles.alertBadgeText}>Critical Alert</Text>
          </View>

          <View style={styles.alertIconWrap}>
            <Ionicons name="flash" size={40} color={Colors.DANGER_RED} />
          </View>

          <Text style={styles.faultType}>{fault.type} DETECTED</Text>
          <Text style={styles.faultCircuit}>Circuit — {fault.circuit}</Text>
          <Text style={styles.faultTime}>JUST NOW</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>MEASURED</Text>
              <Text style={[styles.metricValue, { color: Colors.DANGER_RED }]}>{fault.measured}A</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>THRESHOLD</Text>
              <Text style={styles.metricValue}>{fault.threshold}A</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.DANGER_RED }]}>
                +{fault.difference}A ({fault.percentage}%)
              </Text>
              <Text style={styles.statLabel}>OVER LIMIT</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.isolatedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={Colors.ACCENT_GREEN} />
                <Text style={styles.isolatedText}>{fault.status}</Text>
              </View>
              <Text style={styles.statLabel}>STATUS</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={16} color={Colors.ACCENT_CYAN} />
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          </View>
          <Text style={styles.descText}>
            The <Text style={{ color: Colors.ACCENT_GREEN }}>{fault.circuit}</Text> circuit drew more current (
            {fault.measured}A) than its rated threshold ({fault.threshold}A). This typically happens when an
            appliance malfunctions or too many devices share one circuit. The circuit was automatically isolated
            for your safety.
          </Text>
          <View style={styles.infoBox}>
            <Ionicons name="time-outline" size={13} color={Colors.ACCENT_CYAN} />
            <Text style={styles.infoText}>
              Fault triggered {fault.timeAgo} ago. Response time: &lt;100ms
            </Text>
          </View>
        </View>

        {/* Safety Checklist */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={16} color={Colors.WARNING_ORANGE} />
            <Text style={styles.sectionTitle}>SAFETY CHECKLIST</Text>
          </View>
          <Text style={styles.checklistSub}>Complete all steps before restoring power</Text>

          {checklistItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.checkItem, checked[item.id] && styles.checkItemDone]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, checked[item.id] && styles.checkboxDone]}>
                {checked[item.id] && <Ionicons name="checkmark" size={14} color="#000" />}
              </View>
              <View style={styles.checkInfo}>
                <Text style={[styles.checkLabel, checked[item.id] && { color: Colors.TEXT_SECONDARY, textDecorationLine: 'line-through' }]}>
                  {item.label}
                </Text>
                <Text style={styles.checkDesc}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Restore Power */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={handleRestore}
            disabled={!allChecked || restoring}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={allChecked ? [Colors.ACCENT_GREEN, '#00DD77'] : [Colors.BORDER_COLOR, Colors.BORDER_LIGHT]}
              style={styles.restoreBtn}
            >
              {restoring ? (
                <Text style={[styles.restoreBtnText, { color: allChecked ? '#000' : Colors.TEXT_MUTED }]}>
                  RESTORING POWER...
                </Text>
              ) : (
                <>
                  <Ionicons name="power" size={18} color={allChecked ? '#000' : Colors.TEXT_MUTED} />
                  <Text style={[styles.restoreBtnText, { color: allChecked ? '#000' : Colors.TEXT_MUTED }]}>
                    RESTORE POWER
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          {!allChecked && (
            <Text style={styles.restoreHint}>Complete all checklist items first</Text>
          )}
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
  alertCard: {
    backgroundColor: 'rgba(255,51,85,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.DANGER_RED + '50',
    padding: 20,
    alignItems: 'center',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.DANGER_RED + '20',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
    marginBottom: 20,
  },
  alertBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.DANGER_RED,
  },
  alertIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.DANGER_RED + '20',
    borderWidth: 2,
    borderColor: Colors.DANGER_RED + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  faultType: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: Colors.DANGER_RED,
    letterSpacing: 1,
  },
  faultCircuit: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
    marginTop: 6,
  },
  faultTime: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 12,
    padding: 14,
  },
  metricBox: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 1, height: 40, backgroundColor: Colors.BORDER_LIGHT },
  metricLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_PRIMARY,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_MUTED,
    letterSpacing: 1,
  },
  isolatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.ACCENT_GREEN + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  isolatedText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
  },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  descText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.TEXT_SECONDARY,
    flex: 1,
  },
  checklistSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
    marginTop: -4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  checkItemDone: {
    borderColor: Colors.ACCENT_GREEN + '40',
    backgroundColor: Colors.ACCENT_GREEN + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxDone: {
    backgroundColor: Colors.ACCENT_GREEN,
    borderColor: Colors.ACCENT_GREEN,
  },
  checkInfo: { flex: 1 },
  checkLabel: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 3,
  },
  checkDesc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  restoreBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  restoreHint: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_MUTED,
  },
});
