import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/circuit_model.dart';
import '../widgets/current_bar.dart';
import '../widgets/ewma_chip.dart';

class CircuitCard extends StatelessWidget {
  final Circuit circuit;
  final VoidCallback? onTap;

  const CircuitCard({
    super.key,
    required this.circuit,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: AppDecorations.cardGlow,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          circuit.name,
                          style: AppTypography.heading3.copyWith(fontSize: 16),
                        ),
                        const SizedBox(height: 4),
                        if (circuit.faultActive)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              circuit.faultType.displayName,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.danger,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  
                  // Toggle switch
                  Switch(
                    value: circuit.relayState,
                    onChanged: circuit.faultActive ? null : (value) {
                      // Show confirmation and toggle
                    },
                    activeThumbColor: AppColors.primary,
                    inactiveThumbColor: AppColors.textSecondary,
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              const Divider(color: AppColors.border),
              const SizedBox(height: 16),
              
              // Metrics
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetric(
                    'Current',
                    '${circuit.current.toStringAsFixed(2)} A',
                    AppColors.getCurrentColor(circuit.current),
                  ),
                  _buildMetric(
                    'Power',
                    '${circuit.power.toStringAsFixed(0)} W',
                    AppColors.primary,
                  ),
                  _buildMetric(
                    'Temp',
                    '${circuit.temp.toStringAsFixed(1)}°C',
                    AppColors.getTempColor(circuit.temp),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Current bar
              CurrentBar(
                current: circuit.current,
                maxCurrent: circuit.mcbRating,
              ),
              
              const SizedBox(height: 12),
              
              // EWMA Status
              Row(
                children: [
                  EwmaChip(status: circuit.ewmaStatus),
                  const Spacer(),
                  if (circuit.ewmaTrained)
                    Text(
                      'Baseline: ${circuit.ewmaBaseline.toStringAsFixed(0)}W',
                      style: AppTypography.caption.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetric(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.caption,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTypography.shareTechMono(
            size: 14,
            weight: FontWeight.w600,
            color: color,
          ),
        ),
      ],
    );
  }
}
