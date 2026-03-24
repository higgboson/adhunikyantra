import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';

export default function FaultDetailScreen() {
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

  const [checklist, setChecklist] = React.useState([
    { id: 1, label: 'Unplug appliance', checked: false, description: 'Remove power from the appliance' },
    { id: 2, label: 'Check wiring', checked: false, description: 'Inspect for damage or loose connections' },
    { id: 3, label: 'Acknowledge risk', checked: false, description: 'I understand the risks of re-energization' },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const allChecked = checklist.every((item) => item.checked);

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
          <Text style={styles.headerTitle}>Fault Detail — O...</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Critical Alert Card */}
        <View style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertBadge}>← Critical Alert →</Text>
          </View>

          <View style={styles.alertIconContainer}>
            <Text style={styles.alertIcon}>⚡</Text>
          </View>

          <Text style={styles.alertTitle}>OVERLOAD DETECTED</Text>
          <Text style={styles.alertSubtitle}>Circuit — Bedroom AC</Text>
          <Text style={styles.alertTimestamp}>JUST NOW</Text>

          {/* Measured vs Threshold */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>MEASURED - THRESHOLD</Text>
              <Text style={styles.metricValue}>{fault.measured}A</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>SET</Text>
              <Text style={styles.metricValue}>{fault.threshold}A</Text>
            </View>
          </View>

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusValue}>{fault.difference}A ({fault.percentage}%)</Text>
              <Text style={styles.statusLabel}>DIFFERENCE</Text>
            </View>
            <View style={[styles.statusItem, styles.statusItemRight]}>
              <Text style={styles.statusBadge}>→ {fault.status}</Text>
              <Text style={styles.statusLabel}>FAULT HAPPENED</Text>
              <Text style={styles.statusTime}>{fault.timeAgo}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📝</Text>
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          </View>
          <Text style={styles.description}>
            Your Geyser circuit drew more current (7.8A) than its rated threshold (6.0A). This typically
            happens when an appliance malfunctions or too many devices are connected to the circuit. The circuit
            was automatically isolated for your safety.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Why this matters: Prolonged overload can overheat wiring insulation, cause wire aging, or start a
              fire. Immediate action is required.
            </Text>
          </View>
        </View>

        {/* Restore Circuit Button */}
        <TouchableOpacity style={styles.restoreButton} activeOpacity={0.8}>
          <LinearGradient
            colors={[Colors.ACCENT_GREEN, '#00DD77']}
            style={styles.restoreButtonGradient}
          >
            <Text style={styles.restoreButtonText}>⚡ Restore Circuit</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Keep Isolated */}
        <TouchableOpacity style={styles.keepIsolatedButton}>
          <Text style={styles.keepIsolatedText}>🔒 Keep Isolated</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* When Restoring */}
        <Text style={styles.whenRestoringTitle}>When Restoring</Text>

        {/* Safety Checklist */}
        <View style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <Text style={styles.checklistTitle}>Safety Checklist</Text>
            <Text style={styles.checklistProgress}>COMPLETE ALL 03</Text>
          </View>

          {checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checklistItem}
              onPress={() => toggleCheck(item.id)}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.checklistContent}>
                <Text style={styles.checklistLabel}>{item.label}</Text>
                <Text style={styles.checklistDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !allChecked && styles.continueButtonDisabled,
          ]}
          disabled={!allChecked}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.continueButtonText,
              !allChecked && styles.continueButtonTextDisabled,
            ]}
          >
            Continue If Pre-energized →
          </Text>
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
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🟢</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Alerts</Text>
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
    fontSize: 28,
    color: Colors.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.DANGER_RED,
    alignItems: 'center',
  },
  alertHeader: {
    marginBottom: 20,
  },
  alertBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.DANGER_RED,
    letterSpacing: 1,
  },
  alertIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.DANGER_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    fontSize: 40,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.DANGER_RED,
    marginBottom: 8,
  },
  alertSubtitle: {
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  alertTimestamp: {
    fontSize: 12,
    color: Colors.TEXT_MUTED,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.DANGER_RED,
  },
  statusRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  statusItem: {
    flex: 1,
  },
  statusItemRight: {
    alignItems: 'flex-end',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 9,
    color: Colors.TEXT_MUTED,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.DANGER_RED,
    marginBottom: 8,
  },
  statusTime: {
    fontSize: 11,
    color: Colors.ACCENT_GREEN,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ACCENT_CYAN,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
    marginBottom: 12,
  },
  infoBox: {
    padding: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.WARNING_ORANGE,
  },
  infoText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  restoreButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  restoreButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 1,
  },
  keepIsolatedButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.DANGER_RED,
    alignItems: 'center',
  },
  keepIsolatedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.DANGER_RED,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER_COLOR,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  whenRestoringTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  checklistCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  checklistProgress: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.ACCENT_GREEN,
    borderColor: Colors.ACCENT_GREEN,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.BG_PRIMARY,
    fontWeight: '700',
  },
  checklistContent: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  checklistDescription: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  continueButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_CYAN,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    borderColor: Colors.BORDER_COLOR,
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.ACCENT_CYAN,
  },
  continueButtonTextDisabled: {
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
