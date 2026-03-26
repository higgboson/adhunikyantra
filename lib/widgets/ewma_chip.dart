import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/circuit_model.dart';

class EwmaChip extends StatelessWidget {
  final EwmaStatus status;

  const EwmaChip({
    super.key,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    final (color, icon) = _getStatusStyle(status);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: color.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            status.displayName,
            style: AppTypography.caption.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  (Color, IconData) _getStatusStyle(EwmaStatus status) {
    switch (status) {
      case EwmaStatus.learning:
        return (AppColors.warning, Icons.school);
      case EwmaStatus.normal:
        return (AppColors.primary, Icons.check_circle);
      case EwmaStatus.anomaly:
        return (AppColors.danger, Icons.warning);
      case EwmaStatus.leftOn:
        return (AppColors.secondary, Icons.access_time);
    }
  }
}
