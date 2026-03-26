class DeviceInfo {
  final String firmwareVersion;
  final String hardwareId;
  final int uptimeSeconds;
  final String ipAddress;
  final int lastSeen;
  final int spiffsUsedPct;
  final DateTime? lastUpdate;

  DeviceInfo({
    this.firmwareVersion = '',
    this.hardwareId = '',
    this.uptimeSeconds = 0,
    this.ipAddress = '',
    this.lastSeen = 0,
    this.spiffsUsedPct = 0,
    this.lastUpdate,
  });

  factory DeviceInfo.fromMap(Map<dynamic, dynamic> map) {
    return DeviceInfo(
      firmwareVersion: map['firmware_version'] as String? ?? '',
      hardwareId: map['hardware_id'] as String? ?? '',
      uptimeSeconds: (map['uptime_seconds'] as num?)?.toInt() ?? 0,
      ipAddress: map['ip_address'] as String? ?? '',
      lastSeen: (map['last_seen'] as num?)?.toInt() ?? 0,
      spiffsUsedPct: (map['spiffs_used_pct'] as num?)?.toInt() ?? 0,
      lastUpdate: DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'firmware_version': firmwareVersion,
      'hardware_id': hardwareId,
      'uptime_seconds': uptimeSeconds,
      'ip_address': ipAddress,
      'last_seen': lastSeen,
      'spiffs_used_pct': spiffsUsedPct,
    };
  }

  bool get isOnline {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    return (now - lastSeen) < 30;
  }

  String get uptimeFormatted {
    final days = uptimeSeconds ~/ 86400;
    final hours = (uptimeSeconds % 86400) ~/ 3600;
    final minutes = (uptimeSeconds % 3600) ~/ 60;
    
    if (days > 0) return '${days}d ${hours}h ${minutes}m';
    if (hours > 0) return '${hours}h ${minutes}m';
    return '${minutes}m';
  }

  String get lastSeenFormatted {
    final now = DateTime.now();
    final lastSeenDate = DateTime.fromMillisecondsSinceEpoch(lastSeen * 1000);
    final diff = now.difference(lastSeenDate);
    
    if (diff.inDays > 0) return '${diff.inDays} days ago';
    if (diff.inHours > 0) return '${diff.inHours} hours ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes} minutes ago';
    return 'Just now';
  }

  DeviceInfo copyWith({
    String? firmwareVersion,
    String? hardwareId,
    int? uptimeSeconds,
    String? ipAddress,
    int? lastSeen,
    int? spiffsUsedPct,
    DateTime? lastUpdate,
  }) {
    return DeviceInfo(
      firmwareVersion: firmwareVersion ?? this.firmwareVersion,
      hardwareId: hardwareId ?? this.hardwareId,
      uptimeSeconds: uptimeSeconds ?? this.uptimeSeconds,
      ipAddress: ipAddress ?? this.ipAddress,
      lastSeen: lastSeen ?? this.lastSeen,
      spiffsUsedPct: spiffsUsedPct ?? this.spiffsUsedPct,
      lastUpdate: lastUpdate ?? this.lastUpdate,
    );
  }
}

class HistoryData {
  final String date;
  final String hour;
  final double totalPower;
  final Map<String, double> circuitPower;

  HistoryData({
    required this.date,
    required this.hour,
    this.totalPower = 0,
    this.circuitPower = const {},
  });

  factory HistoryData.fromMap(String date, String hour, Map<dynamic, dynamic> map) {
    final circuitPower = <String, double>{};
    for (var i = 1; i <= 4; i++) {
      final key = 'circuit_${i}_w';
      circuitPower['circuit_$i'] = (map[key] as num?)?.toDouble() ?? 0;
    }
    
    return HistoryData(
      date: date,
      hour: hour,
      totalPower: (map['total_power_w'] as num?)?.toDouble() ?? 0,
      circuitPower: circuitPower,
    );
  }
}

class HistoryPoint {
  final DateTime timestamp;
  final double totalPower;
  final Map<String, double> circuitPower;

  HistoryPoint({
    required this.timestamp,
    this.totalPower = 0,
    this.circuitPower = const {},
  });
}
