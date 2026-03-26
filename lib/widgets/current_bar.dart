import 'package:flutter/material.dart';
import '../core/theme.dart';

class CurrentBar extends StatelessWidget {
  final double current;
  final double maxCurrent;

  const CurrentBar({
    super.key,
    required this.current,
    this.maxCurrent = 6.0,
  });

  @override
  Widget build(BuildContext context) {
    final percentage = (current / maxCurrent).clamp(0.0, 1.0);
    final color = _getBarColor(percentage);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Current Load',
              style: AppTypography.caption,
            ),
            Text(
              '${(percentage * 100).toInt()}%',
              style: AppTypography.caption.copyWith(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: percentage,
            backgroundColor: AppColors.border,
            valueColor: AlwaysStoppedAnimation<Color>(color),
            minHeight: 8,
          ),
        ),
        const SizedBox(height: 4),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '0 A',
              style: AppTypography.caption.copyWith(
                fontSize: 10,
              ),
            ),
            Text(
              '${maxCurrent.toStringAsFixed(0)} A',
              style: AppTypography.caption.copyWith(
                fontSize: 10,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Color _getBarColor(double percentage) {
    if (percentage > 0.9) return AppColors.danger;
    if (percentage > 0.7) return AppColors.warning;
    return AppColors.primary;
  }
}
