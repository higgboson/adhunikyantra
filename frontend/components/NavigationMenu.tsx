import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

interface NavigationMenuProps {
  visible: boolean;
  onClose: () => void;
  currentScreen?: string;
}

export default function NavigationMenu({ visible, onClose, currentScreen }: NavigationMenuProps) {
  const handleNavigate = (route: string) => {
    onClose();
    if (route !== currentScreen) {
      router.push(route);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.menuCard}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>📱 ALL SCREENS</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.menuClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/dashboard' && styles.menuItemActive]}
            onPress={() => handleNavigate('/dashboard')}
          >
            <Text style={styles.menuItemIcon}>🏠</Text>
            <Text style={styles.menuItemText}>Dashboard (Main)</Text>
            {currentScreen === '/dashboard' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/fault-detail' && styles.menuItemActive]}
            onPress={() => handleNavigate('/fault-detail')}
          >
            <Text style={styles.menuItemIcon}>⚡</Text>
            <Text style={styles.menuItemText}>Fault Detail (Safety Checklist)</Text>
            {currentScreen === '/fault-detail' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/history' && styles.menuItemActive]}
            onPress={() => handleNavigate('/history')}
          >
            <Text style={styles.menuItemIcon}>📊</Text>
            <Text style={styles.menuItemText}>History & Analytics</Text>
            {currentScreen === '/history' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/alerts' && styles.menuItemActive]}
            onPress={() => handleNavigate('/alerts')}
          >
            <Text style={styles.menuItemIcon}>⚠</Text>
            <Text style={styles.menuItemText}>Safety Alerts</Text>
            {currentScreen === '/alerts' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/motor-health' && styles.menuItemActive]}
            onPress={() => handleNavigate('/motor-health')}
          >
            <Text style={styles.menuItemIcon}>🔧</Text>
            <Text style={styles.menuItemText}>Motor Health (PF Analysis)</Text>
            {currentScreen === '/motor-health' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/circuit-analyser' && styles.menuItemActive]}
            onPress={() => handleNavigate('/circuit-analyser')}
          >
            <Text style={styles.menuItemIcon}>🤖</Text>
            <Text style={styles.menuItemText}>Circuit Analyser (AI)</Text>
            {currentScreen === '/circuit-analyser' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, currentScreen === '/device-network' && styles.menuItemActive]}
            onPress={() => handleNavigate('/device-network')}
          >
            <Text style={styles.menuItemIcon}>📡</Text>
            <Text style={styles.menuItemText}>Device & Network</Text>
            {currentScreen === '/device-network' && <Text style={styles.activeIndicator}>●</Text>}
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <Text style={styles.menuNote}>
            💡 Tap any screen to navigate. Use bottom nav for quick access.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.ACCENT_GREEN,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
  },
  menuClose: {
    fontSize: 32,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '300',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: Colors.ACCENT_GREEN,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
  },
  activeIndicator: {
    fontSize: 12,
    color: Colors.ACCENT_GREEN,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.BORDER_COLOR,
    marginVertical: 16,
  },
  menuNote: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
});
