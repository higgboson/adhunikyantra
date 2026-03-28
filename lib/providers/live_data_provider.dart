import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants.dart';
import '../core/firebase_paths.dart';
import '../models/live_data_model.dart';

final liveDataProvider = StreamProvider<LiveData>((ref) {
  const deviceId = AppConstants.deviceId;
  final path = FirebasePaths.live(deviceId);
  
  return FirebaseDatabase.instance
      .ref(path)
      .onValue
      .map((event) {
    
    // SAFEGUARD: Ensure the data exists AND is actually a Map/Dictionary
    if (event.snapshot.value != null && event.snapshot.value is Map) {
      try {
        final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
        return LiveData.fromMap(data);
      } catch (e) {
        // If parsing fails for some reason, print it so we can see it in the terminal!
        print("Error parsing live data: $e");
        return LiveData(); 
      }
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
    if (event.snapshot.value != null && event.snapshot.value is Map) {
      try {
        final data = Map<dynamic, dynamic>.from(event.snapshot.value as Map);
        return LiveData.fromMap(data);
      } catch (e) {
        return LiveData();
      }
    }
    return LiveData();
  });
});