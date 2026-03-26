import 'circuit_model.dart';

class Fault {
  final String id;
  final FaultType type;
  final String circuit;
  final double measuredValue;
  final double threshold;
  final int timestamp;
  final bool resolved;
  final String? circuitName;

  Fault({
    required this.id,
    this.type = FaultType.none,
    this.circuit = '',
    this.measuredValue = 0,
    this.threshold = 0,
    this.timestamp = 0,
    this.resolved = false,
    this.circuitName,
  });

  factory Fault.fromMap(String id, Map<dynamic, dynamic> map) {
    return Fault(
      id: id,
      type: FaultTypeExtension.fromString(map['type'] as String?),
      circuit: map['circuit'] as String? ?? '',
      measuredValue: (map['measured_value'] as num?)?.toDouble() ?? 0,
      threshold: (map['threshold'] as num?)?.toDouble() ?? 0,
      timestamp: (map['timestamp'] as num?)?.toInt() ?? 0,
      resolved: map['resolved'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type.name,
      'circuit': circuit,
      'measured_value': measuredValue,
      'threshold': threshold,
      'timestamp': timestamp,
      'resolved': resolved,
    };
  }

  double get exceededBy => measuredValue - threshold;
  double get exceededPercent => threshold > 0 ? ((measuredValue - threshold) / threshold * 100) : 0;

  DateTime get dateTime => DateTime.fromMillisecondsSinceEpoch(timestamp * 1000);

  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(dateTime);
    
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m ago';
    return 'Just now';
  }

  bool get isSevere => type == FaultType.short || type == FaultType.thermal || type == FaultType.leakage;

  Fault copyWith({
    String? id,
    FaultType? type,
    String? circuit,
    double? measuredValue,
    double? threshold,
    int? timestamp,
    bool? resolved,
    String? circuitName,
  }) {
    return Fault(
      id: id ?? this.id,
      type: type ?? this.type,
      circuit: circuit ?? this.circuit,
      measuredValue: measuredValue ?? this.measuredValue,
      threshold: threshold ?? this.threshold,
      timestamp: timestamp ?? this.timestamp,
      resolved: resolved ?? this.resolved,
      circuitName: circuitName ?? this.circuitName,
    );
  }
}

enum AlertType {
  all,
  active,
  fault,
  energy,
  maintenance,
}

extension AlertTypeExtension on AlertType {
  String get displayName {
    switch (this) {
      case AlertType.all:
        return 'All';
      case AlertType.active:
        return 'Active';
      case AlertType.fault:
        return 'Faults';
      case AlertType.energy:
        return 'Energy';
      case AlertType.maintenance:
        return 'Maintenance';
    }
  }
}

class Alert {
  final String id;
  final AlertType type;
  final String title;
  final String message;
  final String? circuitId;
  final int timestamp;
  final bool isRead;
  final double? costImpact;

  Alert({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    this.circuitId,
    required this.timestamp,
    this.isRead = false,
    this.costImpact,
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
