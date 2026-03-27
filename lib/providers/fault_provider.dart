import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/fault_model.dart';

final activeFaultsProvider = StreamProvider<List<Fault>>((ref) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.faults(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    final faults = <Fault>[];
    
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      
      data.forEach((key, value) {
        if (value != null && value is Map) {
          final faultMap = Map<dynamic, dynamic>.from(value);
          final resolved = faultMap['resolved'] as bool? ?? false;
          
          if (!resolved) {
            faults.add(Fault.fromMap(key.toString(), faultMap));
          }
        }
      });
    }
    
    // Sort by timestamp descending (most recent first)
    faults.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return faults;
  });
});

final allFaultsProvider = StreamProvider<List<Fault>>((ref) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.faults(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    final faults = <Fault>[];
    
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      
      data.forEach((key, value) {
        if (value != null && value is Map) {
          final faultMap = Map<dynamic, dynamic>.from(value);
          faults.add(Fault.fromMap(key.toString(), faultMap));
        }
      });
    }
    
    faults.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return faults;
  });
});

final faultByIdProvider = StreamProvider.family<Fault?, String>((ref, faultId) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.fault(deviceId, faultId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return Fault.fromMap(faultId, data);
    }
    return null;
  });
});

class FaultNotifier extends StateNotifier<AsyncValue<void>> {
  FaultNotifier() : super(const AsyncValue.data(null));
  
  Future<void> resolveFault(String deviceId, String faultId, bool resolved) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.faultResolved(deviceId, faultId);
      await FirebaseDatabase.instance.ref(path).set(resolved);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final faultActionsProvider = StateNotifierProvider<FaultNotifier, AsyncValue<void>>((ref) {
  return FaultNotifier();
});
