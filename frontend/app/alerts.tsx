import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

type AlertType = 'critical' | 'warning' | 'info' | 'resolved';

interface Alert {
  id: number;
  type: AlertType;
  category: 'ACTIVE - NEEDS ATTENTION' | 'WARNING' | 'INFO' | 'RESOLVED';
  title: string;
  circuit: string;
  description: string;
  timestamp: string;
  action?: string;
  actionLabel?: string;
  extraInfo?: string;
  resolved?: boolean;
}

export default function AlertsScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'faults'>('all');

  const allAlerts: Alert[] = [
    {
      id: 1,
      type: 'critical',
      category: 'ACTIVE - NEEDS ATTENTION',
      title: 'Short Circuit Detected',
      circuit: 'KITCHEN MAIN',
      description: 'Circuit isolated in 100ms. Check wiring immediately.',
      timestamp: '2 min ago',
    },
    {
      id: 2,
      type: 'warning',
      category: 'WARNING',
      title: 'Overload Warning',
      circuit: 'BEDROOM AC',
      description: 'Current: 6.8A (Limit: 6.0A). Consider switching off high-load devices.',
      timestamp: '15 min ago',
    },
    {
      id: 3,
      type: 'info',
      category: 'INFO',
      title: 'Device Left On',
      circuit: 'GEYSER',
      description: 'Running for 4h 15m — Rs. 35 extra spent.',
      timestamp: '1h ago',
      extraInfo: 'PROJECTED WASTE: Rs. 35 WASTED',
      action: 'Turn Off Now',
      actionLabel: 'Turn Off Now',
    },
    {
      id: 4,
      type: 'warning',
      category: 'WARNING',
      title: 'Pump Motor Wear',
      circuit: 'WATER PUMP',
      description: 'Power factor has dropped from 0.82 to 0.61 — Schedule service soon.',
      timestamp: '3h ago',
      action: 'Schedule Service',
      actionLabel: 'Schedule Service',
    },
    {
      id: 5,
      type: 'resolved',
      category: 'RESOLVED',
      title: 'Earth Leakage Detected',
      circuit: 'MAIN LINE',
      description: 'Main line insulation checked and repaired.',
      timestamp: '1 day ago',
      resolved: true,
    },
  ];

  const getFilteredAlerts = () => {
    if (activeTab === 'active') {
      return allAlerts.filter(a => a.type === 'critical' || a.type === 'warning');
    }
    if (activeTab === 'faults') {
      return allAlerts.filter(a => a.type === 'critical');
    }
    return allAlerts;
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case 'critical': return Colors.DANGER_RED;
      case 'warning': return Colors.WARNING_ORANGE;
      case 'info': return Colors.ACCENT_CYAN;
      case 'resolved': return Colors.TEXT_MUTED;
      default: return Colors.TEXT_SECONDARY;
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'critical': return '⚡';
      case 'warning': return '⚠';
      case 'info': return '💡';
      case 'resolved': return '✓';
      default: return '•';
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const activeCount = allAlerts.filter(a => a.type === 'critical' || a.type === 'warning').length;
  const faultsCount = allAlerts.filter(a => a.type === 'critical').length;

  return (
    <LinearGradient
      colors={['#0A0E17', '#0F1923', '#1A2332']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>⭕</Text>
            <Text style={styles.headerTitle}>Safety Alerts</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.markAllRead}>Mark All Read</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All
            </Text>
            <View style={[styles.tabBadge, activeTab === 'all' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'all' && styles.tabBadgeTextActive]}>
                {allAlerts.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
              Active
            </Text>
            <View style={[styles.tabBadge, activeTab === 'active' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'active' && styles.tabBadgeTextActive]}>
                {activeCount}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'faults' && styles.tabActive]}
            onPress={() => setActiveTab('faults')}
          >
            <Text style={[styles.tabText, activeTab === 'faults' && styles.tabTextActive]}>
              Faults
            </Text>
            <View style={[styles.tabBadge, activeTab === 'faults' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'faults' && styles.tabBadgeTextActive]}>
                {faultsCount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Alerts List */}
        <View style={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                alert.type === 'critical' && styles.alertCardCritical,
                alert.resolved && styles.alertCardResolved,
              ]}
              activeOpacity={0.8}
              onPress={() => {
                if (alert.type === 'critical' || alert.type === 'warning') {
                  router.push('/fault-detail');
                }
              }}
            >
              {/* Alert Border */}
              <View
                style={[
                  styles.alertBorder,
                  { backgroundColor: getAlertColor(alert.type) },
                ]}
              />

              {/* Alert Content */}
              <View style={styles.alertContent}>
                {/* Alert Header */}
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.alertIconContainer,
                      { backgroundColor: getAlertColor(alert.type) },
                    ]}
                  >
                    <Text style={styles.alertIconText}>{getAlertIcon(alert.type)}</Text>
                  </View>
                  <View style={styles.alertInfo}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertCircuit}>
                      CIRCUIT: {alert.circuit}
                    </Text>
                  </View>
                  <View style={styles.alertChevron}>
                    <Text style={styles.chevronText}>›</Text>
                  </View>
                </View>

                {/* Alert Description */}
                <Text style={styles.alertDescription}>{alert.description}</Text>

                {/* Extra Info */}
                {alert.extraInfo && (
                  <View style={styles.extraInfo}>
                    <Text style={styles.extraInfoText}>{alert.extraInfo}</Text>
                  </View>
                )}

                {/* Alert Footer */}
                <View style={styles.alertFooter}>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                  {alert.action && (
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>{alert.actionLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Resolved Badge */}
                {alert.resolved && (
                  <View style={styles.resolvedBadge}>
                    <Text style={styles.resolvedText}>RESOLVED</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Text style={styles.navIcon}>▦</Text>
          <Text style={styles.navLabel}>DASHBOARD</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🟢</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>ALERTS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📱</Text>
          <Text style={styles.navLabel}>DEVICES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>PROFILE</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  markAllRead: {
    fontSize: 14,
    color: Colors.ACCENT_GREEN,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.ACCENT_GREEN,
    borderColor: Colors.ACCENT_GREEN,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
  },
  tabTextActive: {
    color: Colors.BG_PRIMARY,
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(10, 14, 23, 0.3)',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  tabBadgeTextActive: {
    color: Colors.TEXT_PRIMARY,
  },
  alertsList: {
    paddingHorizontal: 20,
  },
  alertCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  alertCardCritical: {
    borderColor: Colors.DANGER_RED,
    borderWidth: 2,
  },
  alertCardResolved: {
    opacity: 0.6,
  },
  alertBorder: {
    width: 6,
  },
  alertContent: {
    flex: 1,
    padding: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 20,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  alertCircuit: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.ACCENT_CYAN,
    letterSpacing: 0.5,
  },
  alertChevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 24,
    color: Colors.TEXT_MUTED,
  },
  alertDescription: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  extraInfo: {
    padding: 12,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  extraInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.WARNING_ORANGE,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTimestamp: {
    fontSize: 12,
    color: Colors.TEXT_MUTED,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.ACCENT_CYAN,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.BG_PRIMARY,
  },
  resolvedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.ACCENT_GREEN,
    borderRadius: 12,
  },
  resolvedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.BG_PRIMARY,
    letterSpacing: 0.5,
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
