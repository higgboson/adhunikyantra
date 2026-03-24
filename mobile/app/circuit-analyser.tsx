import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

const mockResults = [
  { label: 'Short circuit risk', value: 'LOW', color: Colors.ACCENT_GREEN, icon: 'checkmark-circle-outline' as const },
  { label: 'Loose connections', value: 'DETECTED', color: Colors.WARNING_ORANGE, icon: 'warning-outline' as const },
  { label: 'Overheating signs', value: 'NONE', color: Colors.ACCENT_GREEN, icon: 'checkmark-circle-outline' as const },
  { label: 'Insulation damage', value: 'MINOR', color: Colors.WARNING_ORANGE, icon: 'alert-circle-outline' as const },
];

export default function CircuitAnalyserScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [results, setResults] = useState<typeof mockResults | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResults(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setResults(null);
    }
  };

  const analyseCircuit = () => {
    if (!imageUri) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnalysing(true);
    setTimeout(() => {
      setAnalysing(false);
      setResults(mockResults);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  };

  return (
    <LinearGradient colors={['#0A0E17', '#0F1923', '#1A2332']} style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circuit Analyser</Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Upload or capture a photo of your circuit breaker panel for AI-powered analysis
        </Text>

        {/* Upload Area */}
        <TouchableOpacity
          style={[styles.uploadArea, imageUri && styles.uploadAreaFilled]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.uploadPlaceholder}>
              <View style={styles.uploadIcon}>
                <Ionicons name="camera-outline" size={40} color={Colors.ACCENT_CYAN} />
              </View>
              <Text style={styles.uploadTitle}>Upload Circuit Photo</Text>
              <Text style={styles.uploadSub}>Tap to choose from gallery</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.halfBtn} onPress={takePhoto} activeOpacity={0.8}>
            <Ionicons name="camera" size={18} color={Colors.ACCENT_CYAN} />
            <Text style={styles.halfBtnText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfBtn} onPress={pickImage} activeOpacity={0.8}>
            <Ionicons name="images-outline" size={18} color={Colors.ACCENT_CYAN} />
            <Text style={styles.halfBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Analyse Button */}
        {imageUri && !results && (
          <TouchableOpacity
            onPress={analyseCircuit}
            disabled={analysing}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[Colors.ACCENT_CYAN, '#0088BB']} style={styles.analyseBtn}>
              {analysing ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyseBtnText}>ANALYSING...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="scan-outline" size={18} color="#fff" />
                  <Text style={styles.analyseBtnText}>ANALYSE CIRCUIT</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Results */}
        {results && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <Ionicons name="checkmark-done-outline" size={18} color={Colors.ACCENT_GREEN} />
              <Text style={styles.resultsTitle}>ANALYSIS COMPLETE</Text>
            </View>
            <Text style={styles.resultsSub}>AI assessed your circuit panel successfully</Text>

            {results.map((r) => (
              <View key={r.label} style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <Ionicons name={r.icon} size={18} color={r.color} />
                  <Text style={styles.resultLabel}>{r.label}</Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: r.color + '20', borderColor: r.color + '40' }]}>
                  <Text style={[styles.resultValue, { color: r.color }]}>{r.value}</Text>
                </View>
              </View>
            ))}

            <View style={styles.recommendationBox}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.ACCENT_CYAN} />
              <Text style={styles.recommendationText}>
                Loose connections detected on 2 terminals. Recommend tightening within 7 days to prevent escalation.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.newAnalysisBtn}
              onPress={() => { setImageUri(null); setResults(null); }}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.TEXT_SECONDARY} />
              <Text style={styles.newAnalysisText}>New Analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        {!imageUri && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>FOR BEST RESULTS</Text>
            {[
              'Ensure good lighting on the panel',
              'Capture the full breaker array',
              'Keep camera steady, avoid blur',
              'Include wiring connections if possible',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipNum}><Text style={styles.tipNumText}>{i + 1}</Text></View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}
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
  aiBadge: {
    backgroundColor: Colors.ACCENT_CYAN + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ACCENT_CYAN + '50',
  },
  aiBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold', color: Colors.ACCENT_CYAN },
  content: { paddingHorizontal: 20, gap: 16 },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    lineHeight: 22,
  },
  uploadArea: {
    height: 200,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAreaFilled: {
    borderStyle: 'solid',
    borderColor: Colors.ACCENT_CYAN + '50',
  },
  uploadedImage: { width: '100%', height: '100%' },
  uploadPlaceholder: { alignItems: 'center', gap: 10 },
  uploadIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.ACCENT_CYAN + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_PRIMARY },
  uploadSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.TEXT_MUTED },
  btnRow: { flexDirection: 'row', gap: 12 },
  halfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.ACCENT_CYAN + '40',
  },
  halfBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.ACCENT_CYAN },
  analyseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 50,
  },
  analyseBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#fff', letterSpacing: 1 },
  resultsSection: { gap: 12 },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.ACCENT_GREEN,
    letterSpacing: 1.5,
  },
  resultsSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.TEXT_SECONDARY, marginTop: -4 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  resultLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultLabel: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.TEXT_PRIMARY },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  resultValue: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.ACCENT_CYAN + '10',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.ACCENT_CYAN + '30',
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  newAnalysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
  },
  newAnalysisText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.TEXT_SECONDARY },
  tipsCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    gap: 12,
  },
  tipsTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.TEXT_SECONDARY,
    letterSpacing: 1.5,
  },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.BG_SECONDARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipNumText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: Colors.TEXT_SECONDARY },
  tipText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.TEXT_SECONDARY, flex: 1 },
});
