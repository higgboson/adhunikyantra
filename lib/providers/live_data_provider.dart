import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/live_data_model.dart';

final liveDataProvider = StreamProvider<LiveData>((ref) {
  final deviceId = AppConstants.deviceId;
  final path = FirebasePaths.live(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return LiveData.fromMap(data);
    }
    return LiveData();
  });
});

final liveDataStreamProvider = StreamProvider.family<LiveData, String>((ref, deviceId) {
  final path = FirebasePaths.live(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    if (event.snapshot.value != null) {
      final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
      return LiveData.fromMap(data);
    }
    return LiveData();
  });
});
