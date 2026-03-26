class LiveData {
  final double voltage;
  final double totalPower;
  final double leakage;
  final double ambientTemp;
  final int timestamp;
  final DateTime? lastUpdate;

  LiveData({
    this.voltage = 0,
    this.totalPower = 0,
    this.leakage = 0,
    this.ambientTemp = 0,
    this.timestamp = 0,
    this.lastUpdate,
  });

  factory LiveData.fromMap(Map<dynamic, dynamic> map) {
    return LiveData(
      voltage: (map['voltage_v'] as num?)?.toDouble() ?? 0,
      totalPower: (map['total_power_w'] as num?)?.toDouble() ?? 0,
      leakage: (map['leakage_ma'] as num?)?.toDouble() ?? 0,
      ambientTemp: (map['ambient_temp_c'] as num?)?.toDouble() ?? 0,
      timestamp: (map['timestamp'] as num?)?.toInt() ?? 0,
      lastUpdate: DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'voltage_v': voltage,
      'total_power_w': totalPower,
      'leakage_ma': leakage,
      'ambient_temp_c': ambientTemp,
      'timestamp': timestamp,
    };
  }

  bool get isVoltageNormal => voltage >= 200 && voltage <= 250;
  bool get isLeakageSafe => leakage < 30;
  bool get isTempSafe => ambientTemp < 65;

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
