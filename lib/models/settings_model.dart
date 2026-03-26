class Settings {
  final double overloadLimitA;
  final double shortCircuitLimitA;
  final double overvoltageV;
  final double undervoltageV;
  final double leakageLimitMa;
  final double thermalLimitC;
  final double electricityRateRs;

  Settings({
    this.overloadLimitA = 6.0,
    this.shortCircuitLimitA = 18.0,
    this.overvoltageV = 260.0,
    this.undervoltageV = 180.0,
    this.leakageLimitMa = 30.0,
    this.thermalLimitC = 65.0,
    this.electricityRateRs = 8.0,
  });

  factory Settings.fromMap(Map<dynamic, dynamic> map) {
    return Settings(
      overloadLimitA: (map['overload_limit_a'] as num?)?.toDouble() ?? 6.0,
      shortCircuitLimitA: (map['short_circuit_limit_a'] as num?)?.toDouble() ?? 18.0,
      overvoltageV: (map['overvoltage_v'] as num?)?.toDouble() ?? 260.0,
      undervoltageV: (map['undervoltage_v'] as num?)?.toDouble() ?? 180.0,
      leakageLimitMa: (map['leakage_limit_ma'] as num?)?.toDouble() ?? 30.0,
      thermalLimitC: (map['thermal_limit_c'] as num?)?.toDouble() ?? 65.0,
      electricityRateRs: (map['electricity_rate_rs'] as num?)?.toDouble() ?? 8.0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'overload_limit_a': overloadLimitA,
      'short_circuit_limit_a': shortCircuitLimitA,
      'overvoltage_v': overvoltageV,
      'undervoltage_v': undervoltageV,
      'leakage_limit_ma': leakageLimitMa,
      'thermal_limit_c': thermalLimitC,
      'electricity_rate_rs': electricityRateRs,
    };
  }

  Settings copyWith({
    double? overloadLimitA,
    double? shortCircuitLimitA,
    double? overvoltageV,
    double? undervoltageV,
    double? leakageLimitMa,
    double? thermalLimitC,
    double? electricityRateRs,
  }) {
    return Settings(
      overloadLimitA: overloadLimitA ?? this.overloadLimitA,
      shortCircuitLimitA: shortCircuitLimitA ?? this.shortCircuitLimitA,
      overvoltageV: overvoltageV ?? this.overvoltageV,
      undervoltageV: undervoltageV ?? this.undervoltageV,
      leakageLimitMa: leakageLimitMa ?? this.leakageLimitMa,
      thermalLimitC: thermalLimitC ?? this.thermalLimitC,
      electricityRateRs: electricityRateRs ?? this.electricityRateRs,
    );
  }
}
