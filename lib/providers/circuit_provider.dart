import 'dart:async';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/circuit_model.dart';

final circuitsProvider = StreamProvider<List<Circuit>>((ref) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.circuits(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .asyncMap((event) async {
    final prefs = await SharedPreferences.getInstance();
    final circuitNames = prefs.getStringList(AppConstants.prefCircuitNames);
    
    final circuits = <Circuit>[];
    
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      
      for (var i = 0; i < AppConstants.circuitCount; i++) {
        final circuitId = AppConstants.circuitIds[i];
        final circuitData = data[circuitId];
        
        if (circuitData != null) {
          final circuitMap = Map<dynamic, dynamic>.from(circuitData as Map);
          var circuit = Circuit.fromMap(circuitId, circuitMap);
          
          // Use cached name if available
          if (circuitNames != null && circuitNames.length > i) {
            circuit = circuit.copyWith(name: circuitNames[i]);
          }
          
          circuits.add(circuit);
        } else {
          // Add default circuit if no data
          circuits.add(Circuit(
            id: circuitId,
            name: circuitNames != null && circuitNames.length > i 
                ? circuitNames[i] 
                : AppConstants.defaultCircuitNames[circuitId] ?? 'Circuit ${i + 1}',
          ));
        }
      }
    } else {
      // No data - return defaults
      for (var i = 0; i < AppConstants.circuitCount; i++) {
        final circuitId = AppConstants.circuitIds[i];
        circuits.add(Circuit(
          id: circuitId,
          name: circuitNames != null && circuitNames.length > i 
              ? circuitNames[i] 
              : AppConstants.defaultCircuitNames[circuitId] ?? 'Circuit ${i + 1}',
        ));
      }
    }
    
    return circuits;
  });
});

final singleCircuitProvider = StreamProvider.family<Circuit, String>((ref, circuitId) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.circuit(deviceId, circuitId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return Circuit.fromMap(circuitId, data);
    }
    return Circuit(id: circuitId);
  });
});

class CircuitNotifier extends StateNotifier<AsyncValue<void>> {
  CircuitNotifier() : super(const AsyncValue.data(null));
  
  Future<void> toggleRelay(String deviceId, String circuitId, bool newState) async {
    state = const AsyncValue.loading();
    try {
      final path = FirebasePaths.circuitRelay(deviceId, circuitId);
      await FirebaseDatabase.instance.ref(path).set(newState);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> updateCircuitName(String deviceId, String circuitId, String newName) async {
    state = const AsyncValue.loading();
    try {
      // Update in Firebase
      final path = FirebasePaths.circuitName(deviceId, circuitId);
      await FirebaseDatabase.instance.ref(path).set(newName);
      
      // Update in cache
      final prefs = await SharedPreferences.getInstance();
      final index = AppConstants.circuitIds.indexOf(circuitId);
      final names = prefs.getStringList(AppConstants.prefCircuitNames) ?? 
          List.generate(AppConstants.circuitCount, (i) => AppConstants.defaultCircuitNames[AppConstants.circuitIds[i]]!);
      
      if (index >= 0 && index < names.length) {
        names[index] = newName;
        await prefs.setStringList(AppConstants.prefCircuitNames, names);
      }
      
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final circuitActionsProvider = StateNotifierProvider<CircuitNotifier, AsyncValue<void>>((ref) {
  return CircuitNotifier();
});
