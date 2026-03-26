import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/device_info_model.dart';
import '../models/ewma_model.dart';
import '../models/neutral_data_model.dart';

// Device Info Provider
final deviceInfoProvider = StreamProvider<DeviceInfo>((ref) {
  final deviceId = AppConstants.deviceId;
  final path = FirebasePaths.deviceInfo(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return DeviceInfo.fromMap(data);
    }
    return DeviceInfo();
  });
});

// EWMA Config Provider
final ewmaConfigsProvider = StreamProvider<Map<String, EwmaConfig>>((ref) {
  final deviceId = AppConstants.deviceId;
  final path = FirebasePaths.ewma(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    final configs = <String, EwmaConfig>{};
    
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      
      data.forEach((key, value) {
        if (value != null && value is Map) {
          final configMap = Map<dynamic, dynamic>.from(value);
          configs[key.toString()] = EwmaConfig.fromMap(key.toString(), configMap);
        }
      });
    }
    
    // Fill defaults for missing circuits
    for (final circuitId in AppConstants.circuitIds) {
      configs.putIfAbsent(circuitId, () => EwmaConfig(circuitId: circuitId));
    }
    
    return configs;
  });
});

final ewmaConfigProvider = StreamProvider.family<EwmaConfig, String>((ref, circuitId) {
  final deviceId = AppConstants.deviceId;
  final path = FirebasePaths.ewmaCircuit(deviceId, circuitId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return EwmaConfig.fromMap(circuitId, data);
    }
    return EwmaConfig(circuitId: circuitId);
  });
});

// Neutral Monitor Provider
final neutralDataProvider = StreamProvider<NeutralData>((ref) {
  final deviceId = AppConstants.deviceId;
  final path = FirebasePaths.neutralMonitor(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return NeutralData.fromMap(data);
    }
    return NeutralData();
  });
});

class EwmaNotifier extends StateNotifier<AsyncValue<void>> {
  EwmaNotifier() : super(const AsyncValue.data(null));
  
  Future<void> updateConfig(String deviceId, EwmaConfig config) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.ewmaCircuit(deviceId, config.circuitId);
      await FirebaseDatabase.instance.ref(path).update(config.toMap());
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> startCalibration(String deviceId, String circuitId, int hours, double sensitivity, int minOnMinutes) async {
    state = const AsyncValue.loading();
    try {
      final config = EwmaConfig(
        circuitId: circuitId,
        calibrating: true,
        calibrationHours: hours,
        alpha: sensitivity / 100, // Convert 1-10 to 0.01-0.1
        minOnMinutes: minOnMinutes,
      );
      
      final path = FirebasePaths.ewmaCircuit(deviceId, circuitId);
      await FirebaseDatabase.instance.ref(path).update(config.toMap());
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> stopCalibration(String deviceId, String circuitId) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.ewmaCalibrating(deviceId, circuitId);
      await FirebaseDatabase.instance.ref(path).set(false);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final ewmaActionsProvider = StateNotifierProvider<EwmaNotifier, AsyncValue<void>>((ref) {
  return EwmaNotifier();
});
