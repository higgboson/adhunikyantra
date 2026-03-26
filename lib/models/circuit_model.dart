enum FaultType {
  none,
  overload,
  short,
  overvoltage,
  undervoltage,
  leakage,
  thermal,
}

extension FaultTypeExtension on FaultType {
  String get displayName {
    switch (this) {
      case FaultType.overload:
        return 'OVERLOAD';
      case FaultType.short:
        return 'SHORT CIRCUIT';
      case FaultType.overvoltage:
        return 'OVERVOLTAGE';
      case FaultType.undervoltage:
        return 'UNDERVOLTAGE';
      case FaultType.leakage:
        return 'EARTH LEAKAGE';
      case FaultType.thermal:
        return 'THERMAL WARNING';
      case FaultType.none:
        return 'NO FAULT';
    }
  }

  String get description {
    switch (this) {
      case FaultType.overload:
        return 'This circuit drew more current than its rated capacity. This usually happens when too many devices are running simultaneously.';
      case FaultType.short:
        return 'A sudden surge in current was detected, indicating a possible short circuit. Check wiring connections and devices for damage.';
      case FaultType.overvoltage:
        return 'The mains voltage exceeded 260V, which can damage sensitive electronics. This may indicate a power grid issue.';
      case FaultType.undervoltage:
        return 'The mains voltage dropped below 180V, which can cause appliances to malfunction or overheat.';
      case FaultType.leakage:
        return 'Earth leakage current exceeded safe limits (>30mA), posing an electric shock hazard. Check for faulty appliances or insulation damage.';
      case FaultType.thermal:
        return 'Wire temperature exceeded 65°C, creating a fire risk. Check for loose connections, overloaded circuits, or poor ventilation.';
      case FaultType.none:
        return 'No fault detected. Circuit is operating normally.';
    }
  }

  String get icon {
    switch (this) {
      case FaultType.overload:
        return 'bolt';
      case FaultType.short:
        return 'flash';
      case FaultType.overvoltage:
        return 'trending_up';
      case FaultType.undervoltage:
        return 'trending_down';
      case FaultType.leakage:
        return 'water_drop';
      case FaultType.thermal:
        return 'fire';
      case FaultType.none:
        return 'check_circle';
    }
  }

  static FaultType fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'overload':
        return FaultType.overload;
      case 'short':
        return FaultType.short;
      case 'overvoltage':
        return FaultType.overvoltage;
      case 'undervoltage':
        return FaultType.undervoltage;
      case 'leakage':
        return FaultType.leakage;
      case 'thermal':
        return FaultType.thermal;
      default:
        return FaultType.none;
    }
  }
}

enum EwmaStatus {
  learning,
  normal,
  anomaly,
  leftOn,
}

extension EwmaStatusExtension on EwmaStatus {
  String get displayName {
    switch (this) {
      case EwmaStatus.learning:
        return 'Learning';
      case EwmaStatus.normal:
        return 'Normal';
      case EwmaStatus.anomaly:
        return 'Anomaly';
      case EwmaStatus.leftOn:
        return 'Left On';
    }
  }
}

class Circuit {
  final String id;
  final String name;
  final double current;
  final double power;
  final double temp;
  final bool relayState;
  final bool faultActive;
  final FaultType faultType;
  final double ewmaBaseline;
  final bool ewmaTrained;
  final int ewmaTrainingPct;
  final double mcbRating;

  Circuit({
    required this.id,
    this.name = '',
    this.current = 0,
    this.power = 0,
    this.temp = 0,
    this.relayState = false,
    this.faultActive = false,
    this.faultType = FaultType.none,
    this.ewmaBaseline = 0,
    this.ewmaTrained = false,
    this.ewmaTrainingPct = 0,
    this.mcbRating = 6.0,
  });

  factory Circuit.fromMap(String id, Map<dynamic, dynamic> map) {
    return Circuit(
      id: id,
      name: map['name'] as String? ?? 'Circuit ${id.replaceAll('circuit_', '')}',
      current: (map['current_a'] as num?)?.toDouble() ?? 0,
      power: (map['power_w'] as num?)?.toDouble() ?? 0,
      temp: (map['temp_c'] as num?)?.toDouble() ?? 0,
      relayState: map['relay_state'] as bool? ?? false,
      faultActive: map['fault_active'] as bool? ?? false,
      faultType: FaultTypeExtension.fromString(map['fault_type'] as String?),
      ewmaBaseline: (map['ewma_baseline'] as num?)?.toDouble() ?? 0,
      ewmaTrained: map['ewma_trained'] as bool? ?? false,
      ewmaTrainingPct: (map['ewma_training_pct'] as num?)?.toInt() ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'current_a': current,
      'power_w': power,
      'temp_c': temp,
      'relay_state': relayState,
      'fault_active': faultActive,
      'fault_type': faultType.name,
      'ewma_baseline': ewmaBaseline,
      'ewma_trained': ewmaTrained,
      'ewma_training_pct': ewmaTrainingPct,
    };
  }

  EwmaStatus get ewmaStatus {
    if (!ewmaTrained) return EwmaStatus.learning;
    if (power > ewmaBaseline * 1.2) return EwmaStatus.anomaly;
    return EwmaStatus.normal;
  }

  bool get isCurrentSafe => current < 6.0;
  bool get isTempSafe => temp < 65.0;
  double get currentPercent => (current / mcbRating * 100).clamp(0, 100);

  double getCostToday(double rateRs) {
    return calcKwh(power, 24) * rateRs;
  }

  Circuit copyWith({
    String? id,
    String? name,
    double? current,
    double? power,
    double? temp,
    bool? relayState,
    bool? faultActive,
    FaultType? faultType,
    double? ewmaBaseline,
    bool? ewmaTrained,
    int? ewmaTrainingPct,
    double? mcbRating,
  }) {
    return Circuit(
      id: id ?? this.id,
      name: name ?? this.name,
      current: current ?? this.current,
      power: power ?? this.power,
      temp: temp ?? this.temp,
      relayState: relayState ?? this.relayState,
      faultActive: faultActive ?? this.faultActive,
      faultType: faultType ?? this.faultType,
      ewmaBaseline: ewmaBaseline ?? this.ewmaBaseline,
      ewmaTrained: ewmaTrained ?? this.ewmaTrained,
      ewmaTrainingPct: ewmaTrainingPct ?? this.ewmaTrainingPct,
      mcbRating: mcbRating ?? this.mcbRating,
    );
  }

  static double calcKwh(double watts, double hours) => watts * hours / 1000;
}
