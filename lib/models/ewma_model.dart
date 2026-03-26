class EwmaConfig {
  final String circuitId;
  final double alpha;
  final double baselineW;
  final int minOnMinutes;
  final bool calibrating;
  final int calibrationHours;

  EwmaConfig({
    required this.circuitId,
    this.alpha = 0.1,
    this.baselineW = 0,
    this.minOnMinutes = 30,
    this.calibrating = false,
    this.calibrationHours = 48,
  });

  factory EwmaConfig.fromMap(String circuitId, Map<dynamic, dynamic> map) {
    return EwmaConfig(
      circuitId: circuitId,
      alpha: (map['alpha'] as num?)?.toDouble() ?? 0.1,
      baselineW: (map['baseline_w'] as num?)?.toDouble() ?? 0,
      minOnMinutes: (map['min_on_minutes'] as num?)?.toInt() ?? 30,
      calibrating: map['calibrating'] as bool? ?? false,
      calibrationHours: (map['calibration_hours'] as num?)?.toInt() ?? 48,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'alpha': alpha,
      'baseline_w': baselineW,
      'min_on_minutes': minOnMinutes,
      'calibrating': calibrating,
      'calibration_hours': calibrationHours,
    };
  }

  EwmaConfig copyWith({
    String? circuitId,
    double? alpha,
    double? baselineW,
    int? minOnMinutes,
    bool? calibrating,
    int? calibrationHours,
  }) {
    return EwmaConfig(
      circuitId: circuitId ?? this.circuitId,
      alpha: alpha ?? this.alpha,
      baselineW: baselineW ?? this.baselineW,
      minOnMinutes: minOnMinutes ?? this.minOnMinutes,
      calibrating: calibrating ?? this.calibrating,
      calibrationHours: calibrationHours ?? this.calibrationHours,
    );
  }
}

class EwmaInsight {
  final String circuitId;
  final String circuitName;
  final double baseline;
  final double dailyRuntime;
  final double dailyCost;
  final bool isAnomaly;
  final bool isLeftOn;
  final double? wasteAmount;

  EwmaInsight({
    required this.circuitId,
    required this.circuitName,
    this.baseline = 0,
    this.dailyRuntime = 0,
    this.dailyCost = 0,
    this.isAnomaly = false,
    this.isLeftOn = false,
    this.wasteAmount,
  });
}
