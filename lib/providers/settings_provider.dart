import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/settings_model.dart';

final settingsProvider = StreamProvider<Settings>((ref) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.settings(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return Settings.fromMap(data);
    }
    return Settings();
  });
});

class SettingsNotifier extends StateNotifier<AsyncValue<void>> {
  SettingsNotifier() : super(const AsyncValue.data(null));
  
  Future<void> updateSettings(String deviceId, Settings settings) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settings(deviceId);
      await FirebaseDatabase.instance.ref(path).update(settings.toMap());
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateOverloadLimit(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsOverload(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateShortCircuitLimit(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsShortCircuit(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateOvervoltage(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsOvervoltage(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateUndervoltage(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsUndervoltage(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateLeakageLimit(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsLeakage(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateThermalLimit(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsThermal(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateElectricityRate(String deviceId, double value) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.settingsRate(deviceId);
      await FirebaseDatabase.instance.ref(path).set(value);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final settingsActionsProvider = StateNotifierProvider<SettingsNotifier, AsyncValue<void>>((ref) {
  return SettingsNotifier();
});
