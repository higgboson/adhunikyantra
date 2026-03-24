import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function CircuitAnalyserScreen() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([
    {
      id: 'c-001',
      name: 'Bedroom area — appears to be AC and lights',
      confidence: 92,
      checked: true,
    },
    {
      id: 'c-002',
      name: 'Kitchen — high load circuit, likely geyser',
      confidence: 92,
      checked: true,
    },
    {
      id: 'c-003',
      name: 'Not sure about this circuit — please verify and add circuit name',
      confidence: 45,
      checked: false,
      warning: true,
    },
  ]);

  const [showResults, setShowResults] = useState(true);

  const handleImagePick = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (result.granted) {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        // Start analysis
        setAnalyzing(true);
        setProgress(0);
        
        // Simulate analysis progress
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setAnalyzing(false);
              setShowResults(true);
              return 100;
            }
            return prev + 10;
          });
        }, 300);
      }
    }
  };

  const handleCameraPick = async () => {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    if (result.granted) {
      const pickerResult = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled) {
        handleImagePick();
      }
    }
  };

  const toggleCheck = (id: string) => {
    setResults((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

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
          <Text style={styles.headerTitle}>Circuit Analyser</Text>
          <TouchableOpacity>
            <Text style={styles.icon}>💁</Text>
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.titleIcon}>⚡</Text>
          <Text style={styles.title}>Circuit Analyser</Text>
        </View>
        <Text style={styles.subtitle}>
          Upload your wiring diagram to auto-name circuits.
        </Text>

        {/* Upload Section */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadIcons}>
            <TouchableOpacity style={styles.uploadIconButton} onPress={handleCameraPick}>
              <Text style={styles.uploadIconText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadIconButton} onPress={handleImagePick}>
              <Text style={styles.uploadIconText}>📄</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.uploadText}>
            Take photo or upload wiring diagram.
          </Text>
          <Text style={styles.uploadSubtext}>
            Supports JPG, PNG, PDF (Max 15MB)
          </Text>
          <TouchableOpacity style={styles.selectFileButton} onPress={handleImagePick}>
            <Text style={styles.selectFileText}>+ Select File</Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Mode */}
        {analyzing && (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisTitle}>LIVE_ANALYSIS_MODE</Text>
            </View>
            
            {/* Colored rectangles for visualization */}
            <View style={styles.analysisViz}>
              <View style={[styles.vizRect, { backgroundColor: '#9B59B6' }]} />
              <View style={[styles.vizRect, { backgroundColor: Colors.DANGER_RED }]} />
              <View style={[styles.vizRect, { backgroundColor: Colors.ACCENT_CYAN }]} />
            </View>
            
            <View style={styles.identifyingSection}>
              <Text style={styles.identifyingIcon}>⛉</Text>
              <Text style={styles.identifyingText}>Identifying Circuits</Text>
            </View>
            
            <Text style={styles.processingText}>PROCESSING_CHUNK_{String(progress).padStart(2, '0')}</Text>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {showResults && !analyzing && (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>Analysis Results</Text>
              <Text style={styles.resultsCount}>{results.length} OBJECTS DETECTED</Text>
            </View>

            {results.map((result) => (
              <View
                key={result.id}
                style={[
                  styles.resultCard,
                  result.warning && styles.resultCardWarning,
                ]}
              >
                <View style={styles.resultHeader}>
                  <View
                    style={[
                      styles.resultBorder,
                      result.warning
                        ? { backgroundColor: Colors.DANGER_RED }
                        : { backgroundColor: result.id === 'c-001' ? '#9B59B6' : Colors.ACCENT_CYAN },
                    ]}
                  />
                  <View style={styles.resultContent}>
                    <View style={styles.resultTop}>
                      <Text style={styles.resultId}>≡ {result.id.toUpperCase()}</Text>
                      <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>
                          {result.confidence}% CONFIDENCE
                        </Text>
                        <Text style={styles.checkIcon}>☐</Text>
                      </View>
                    </View>
                    
                    <Text
                      style={[
                        styles.resultName,
                        result.warning && styles.resultNameWarning,
                      ]}
                    >
                      {result.name}
                    </Text>
                    
                    {result.warning && (
                      <View style={styles.warningMessage}>
                        <Text style={styles.warningIcon}>⚠</Text>
                        <Text style={styles.warningText}>
                          Manual verification required...
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleCheck(result.id)}
                >
                  <View style={[styles.checkboxInner, result.checked && styles.checkboxChecked]}>
                    {result.checked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add New Circuit Button */}
            <TouchableOpacity style={styles.addCircuitButton}>
              <Text style={styles.addCircuitText}>+ Add New Circuit</Text>
            </TouchableOpacity>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} activeOpacity={0.8}>
              <LinearGradient
                colors={['#9B59B6', '#8E44AD']}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Circuit Names</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip Option */}
            <TouchableOpacity style={styles.skipButton}>
              <Text style={styles.skipText}>Skip AI analysis — name manually</Text>
            </TouchableOpacity>
          </>
        )}

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
          <Text style={[styles.navLabel, styles.navLabelActive]}>Analyser</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>History</Text>
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
    fontSize: 20,
    color: Colors.TEXT_SECONDARY,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  titleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  uploadCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.BORDER_COLOR,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadIcons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  uploadIconButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.BG_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconText: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.TEXT_MUTED,
    marginBottom: 20,
  },
  selectFileButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 8,
  },
  selectFileText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  analysisCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  analysisHeader: {
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 1,
  },
  analysisViz: {
    flexDirection: 'row',
    height: 80,
    gap: 4,
    marginBottom: 16,
  },
  vizRect: {
    flex: 1,
    borderRadius: 4,
  },
  identifyingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  identifyingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  identifyingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  processingText: {
    fontSize: 11,
    color: Colors.TEXT_MUTED,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.ACCENT_GREEN,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.TEXT_MUTED,
    letterSpacing: 0.5,
  },
  resultCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    overflow: 'hidden',
  },
  resultCardWarning: {
    borderWidth: 1,
    borderColor: Colors.DANGER_RED,
  },
  resultHeader: {
    flex: 1,
    flexDirection: 'row',
  },
  resultBorder: {
    width: 6,
    minHeight: '100%',
  },
  resultContent: {
    flex: 1,
    padding: 16,
  },
  resultTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultId: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.ACCENT_GREEN,
  },
  checkIcon: {
    fontSize: 16,
    color: Colors.TEXT_MUTED,
  },
  resultName: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 20,
  },
  resultNameWarning: {
    color: Colors.TEXT_SECONDARY,
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 51, 85, 0.1)',
    borderRadius: 6,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.DANGER_RED,
  },
  checkbox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.BORDER_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
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
  addCircuitButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BORDER_COLOR,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addCircuitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
  },
  applyButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
  },
  skipText: {
    fontSize: 14,
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
