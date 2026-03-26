class NeutralData {
  final double liveCurrentA;
  final double neutralCurrentA;
  final double differenceMa;
  final bool faultActive;
  final DateTime? lastUpdate;

  NeutralData({
    this.liveCurrentA = 0,
    this.neutralCurrentA = 0,
    this.differenceMa = 0,
    this.faultActive = false,
    this.lastUpdate,
  });

  factory NeutralData.fromMap(Map<dynamic, dynamic> map) {
    return NeutralData(
      liveCurrentA: (map['live_current_a'] as num?)?.toDouble() ?? 0,
      neutralCurrentA: (map['neutral_current_a'] as num?)?.toDouble() ?? 0,
      differenceMa: (map['difference_ma'] as num?)?.toDouble() ?? 0,
      faultActive: map['fault_active'] as bool? ?? false,
      lastUpdate: DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'live_current_a': liveCurrentA,
      'neutral_current_a': neutralCurrentA,
      'difference_ma': differenceMa,
      'fault_active': faultActive,
    };
  }

  bool get isSafe => differenceMa < 30 && !faultActive;
  double get imbalancePercent => liveCurrentA > 0 
    ? ((liveCurrentA - neutralCurrentA).abs() / liveCurrentA * 100) 
    : 0;

  NeutralData copyWith({
    double? liveCurrentA,
    double? neutralCurrentA,
    double? differenceMa,
    bool? faultActive,
    DateTime? lastUpdate,
  }) {
    return NeutralData(
      liveCurrentA: liveCurrentA ?? this.liveCurrentA,
      neutralCurrentA: neutralCurrentA ?? this.neutralCurrentA,
      differenceMa: differenceMa ?? this.differenceMa,
      faultActive: faultActive ?? this.faultActive,
      lastUpdate: lastUpdate ?? this.lastUpdate,
    );
  }
}

class NeutralFaultLog {
  final String id;
  final double liveCurrent;
  final double neutralCurrent;
  final double difference;
  final int timestamp;
  final bool resolved;

  NeutralFaultLog({
    required this.id,
    this.liveCurrent = 0,
    this.neutralCurrent = 0,
    this.difference = 0,
    this.timestamp = 0,
    this.resolved = false,
  });

  DateTime get dateTime => DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);
  
  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }
}
