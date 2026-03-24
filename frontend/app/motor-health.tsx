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

export default function MotorHealthScreen() {
  const healthScore = 76;
  const waterPumpPF = 0.61;
  const baselinePF = 0.82;
  const estimatedFailureDays = 45;

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
          <Text style={styles.headerTitle}>MOTOR HEALTH</Text>
          <TouchableOpacity>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Health Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Overall Fleet Health Score</Text>
          <Text style={styles.scoreSubtitle}>
            Real-time health telemetry across all motor-driven appliances.
          </Text>
          
          <View style={styles.liveFeed}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE FEED</Text>
          </View>

          {/* Health Score Gauge */}
          <View style={styles.gaugeContainer}>
            <View style={[styles.gauge, { borderColor: Colors.WARNING_ORANGE }]}>
              <Text style={styles.gaugeValue}>{healthScore}</Text>
              <Text style={styles.gaugeLabel}>SYSTEM HEALTH SCORE</Text>
            </View>
          </View>
        </View>

        {/* Active Diagnostics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>Active Diagnostics</Text>
          </View>

          {/* Water Pump Card */}
          <View style={styles.diagnosticCard}>
            <View style={styles.diagnosticHeader}>
              <View style={styles.diagnosticIcon}>
                <Text style={styles.diagnosticIconText}>🚨</Text>
              </View>
              <View style={styles.diagnosticInfo}>
                <Text style={styles.diagnosticTitle}>WATER PUMP</Text>
                <Text style={styles.diagnosticStatus}>ATTENTION NEEDED</Text>
              </View>
              <View style={styles.predictionBadge}>
                <Text style={styles.predictionText}>PREDICTION</Text>
                <Text style={styles.predictionValue}>74%</Text>
              </View>
            </View>

            {/* Power Factor */}
            <View style={styles.pfSection}>
              <Text style={styles.pfLabel}>POWER FACTOR (PF)</Text>
              <View style={styles.pfValues}>
                <Text style={styles.pfCurrent}>
                  {waterPumpPF}
                  <Text style={styles.pfBaseline}> 〜 </Text>
                </Text>
                <Text style={styles.pfBaselineValue}>Baseline: {baselinePF}</Text>
              </View>
            </View>

            {/* 30-day PF Trend */}
            <View style={styles.trendSection}>
              <Text style={styles.trendLabel}>30-DAY PF TREND</Text>
              <View style={styles.trendBars}>
                <View style={[styles.trendBar, { backgroundColor: Colors.ACCENT_GREEN, height: 40 }]} />
                <View style={[styles.trendBar, { backgroundColor: Colors.ACCENT_GREEN, height: 38 }]} />
                <View style={[styles.trendBar, { backgroundColor: Colors.ACCENT_GREEN, height: 35 }]} />
                <View style={[styles.trendBar, { backgroundColor: '#FFD700', height: 32 }]} />
                <View style={[styles.trendBar, { backgroundColor: Colors.WARNING_ORANGE, height: 28 }]} />
                <View style={[styles.trendBar, { backgroundColor: Colors.WARNING_ORANGE, height: 24 }]} />
                <View style={[styles.trendBar, { backgroundColor: Colors.DANGER_RED, height: 20 }]} />
              </View>
            </View>

            {/* Startup Current Signature */}
            <View style={styles.signatureSection}>
              <Text style={styles.signatureLabel}>STARTUP CURRENT SIGNATURE</Text>
              <View style={styles.signatureChart}>
                <View style={styles.signatureLine} />
                <View style={styles.abnormalSpike}>
                  <Text style={styles.abnormalText}>ABNORMAL SPIKE</Text>
                </View>
              </View>
            </View>

            {/* Warning Text */}
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>🚨</Text>
              <Text style={styles.warningText}>
                Your water pump is showing early signs of bearing or capacitor wear. Power
                factor has dropped from {baselinePF} to {waterPumpPF} — capacitor replacement now
                ($60) prevents imminent motor burnout ($1,800). Schedule a plumber or electrician
                within:
              </Text>
            </View>

            <View style={styles.failureWarning}>
              <Text style={styles.failureLabel}>Est. failure in:</Text>
              <Text style={styles.failureDays}>{estimatedFailureDays} DAYS</Text>
            </View>

            {/* Schedule Maintenance Button */}
            <TouchableOpacity style={styles.scheduleButton} activeOpacity={0.8}>
              <LinearGradient
                colors={[Colors.ACCENT_GREEN, '#00DD77']}
                style={styles.scheduleButtonGradient}
              >
                <Text style={styles.scheduleButtonText}>Schedule Maintenance</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bedroom AC Card (Healthy) */}
          <View style={styles.healthyCard}>
            <View style={styles.healthyHeader}>
              <Text style={styles.healthyIcon}>✨</Text>
              <View style={styles.healthyInfo}>
                <Text style={styles.healthyTitle}>Bedroom AC</Text>
                <Text style={styles.healthyStatus}>HEALTHY</Text>
              </View>
            </View>

            <View style={styles.healthyMetrics}>
              <View>
                <Text style={styles.healthyLabel}>POWER</Text>
                <Text style={styles.healthyValue}>0 - 88</Text>
              </View>
              <View>
                <Text style={styles.healthyLabel}>PF TREND</Text>
                <Text style={styles.healthyValue}>✓ STARTUP: NORMAL</Text>
              </View>
              <View>
                <Text style={styles.healthyLabel}>VIBRATION</Text>
                <Text style={styles.healthyValue}>✓ NORMAL</Text>
              </View>
            </View>

            <View style={styles.nextService}>
              <Text style={styles.nextServiceLabel}>NEXT SERVICE:</Text>
              <Text style={styles.nextServiceValue}>180d</Text>
            </View>
          </View>
        </View>

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
          <Text style={styles.navIcon}>⚠</Text>
          <Text style={styles.navLabel}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎮</Text>
          <Text style={styles.navLabel}>Control</Text>
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
    color: Colors.DANGER_RED,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 2,
  },
  icon: {
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  scoreCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  scoreSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  liveFeed: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ACCENT_GREEN,
    marginRight: 8,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 1,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  gauge: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 16,
    backgroundColor: Colors.BG_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.WARNING_ORANGE,
  },
  gaugeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    backgroundColor: Colors.ACCENT_GREEN,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  diagnosticCard: {
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderLeftWidth: 6,
    borderLeftColor: Colors.DANGER_RED,
    borderColor: Colors.DANGER_RED,
    marginBottom: 16,
  },
  diagnosticHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  diagnosticIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.DANGER_RED,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  diagnosticIconText: {
    fontSize: 24,
  },
  diagnosticInfo: {
    flex: 1,
  },
  diagnosticTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  diagnosticStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.DANGER_RED,
  },
  predictionBadge: {
    alignItems: 'flex-end',
  },
  predictionText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  predictionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
  },
  pfSection: {
    marginBottom: 16,
  },
  pfLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pfValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pfCurrent: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.DANGER_RED,
  },
  pfBaseline: {
    fontSize: 24,
    color: Colors.TEXT_MUTED,
  },
  pfBaselineValue: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginLeft: 12,
  },
  trendSection: {
    marginBottom: 16,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  trendBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    gap: 4,
  },
  trendBar: {
    flex: 1,
    borderRadius: 2,
  },
  signatureSection: {
    marginBottom: 16,
  },
  signatureLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  signatureChart: {
    height: 60,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
  },
  signatureLine: {
    height: 2,
    backgroundColor: Colors.WARNING_ORANGE,
  },
  abnormalSpike: {
    position: 'absolute',
    right: 20,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.DANGER_RED,
    borderRadius: 4,
  },
  abnormalText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  failureWarning: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
    marginBottom: 16,
  },
  failureLabel: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  failureDays: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.DANGER_RED,
  },
  scheduleButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  scheduleButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
  },
  healthyCard: {
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 6,
    borderLeftColor: Colors.ACCENT_GREEN,
    borderColor: Colors.BORDER_COLOR,
  },
  healthyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  healthyInfo: {
    flex: 1,
  },
  healthyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  healthyStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.ACCENT_GREEN,
  },
  healthyMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  healthyLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  healthyValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  nextService: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextServiceLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  nextServiceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
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
