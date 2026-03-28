class LiveData {
  final double voltage;
  final double totalPower;
  final double leakage;
  final double ambientTemp;
  final int timestamp;
  final DateTime? lastUpdate;

  LiveData({
    this.voltage = 0.0,
    this.totalPower = 0.0,
    this.leakage = 0.0,
    this.ambientTemp = 24.5, // Default fallback so the UI doesn't say 0°C
    this.timestamp = 0,
    this.lastUpdate,
  });

  factory LiveData.fromMap(Map<dynamic, dynamic> map) {
    return LiveData(
      // These keys MUST match exactly what the ESP32 pushes to Firebase
      voltage: (map['voltage'] as num?)?.toDouble() ?? 0.0,
      totalPower: (map['power'] as num?)?.toDouble() ?? 0.0,
      leakage: (map['current1'] as num?)?.toDouble() ?? 0.0,
      ambientTemp: (map['ambient_temp_c'] as num?)?.toDouble() ?? 24.5,
      timestamp: (map['timestamp'] as num?)?.toInt() ?? DateTime.now().millisecondsSinceEpoch,
      lastUpdate: DateTime.now(), // Always records the exact moment data arrived
    );
  }

  Map<String, dynamic> toMap() {
    return {
      // Kept perfectly symmetrical with fromMap
      'voltage': voltage,
      'power': totalPower,
      'current1': leakage,
      'ambient_temp_c': ambientTemp,
      'timestamp': timestamp,
    };
  }

  // --- SAFETY THRESHOLDS ---
  // Indian standard voltage is normally 230V +/- 6% (approx 216V - 244V)
  // Adjusted slightly wider here for typical fluctuations
  bool get isVoltageNormal => voltage >= 200.0 && voltage <= 250.0;
  
  // Leakage/Current safety threshold (Adjust based on your actual load limits)
  bool get isLeakageSafe => leakage < 30.0;
  
  // Temperature threshold in Celsius
  bool get isTempSafe => ambientTemp < 65.0;

  LiveData copyWith({
    double? voltage,
    double? totalPower,
    double? leakage,
    double? ambientTemp,
    int? timestamp,
    DateTime? lastUpdate,
  }) {
    return LiveData(
      voltage: voltage ?? this.voltage,
      totalPower: totalPower ?? this.totalPower,
      leakage: leakage ?? this.leakage,
      ambientTemp: ambientTemp ?? this.ambientTemp,
      timestamp: timestamp ?? this.timestamp,
      lastUpdate: lastUpdate ?? this.lastUpdate,
    );
  }
}