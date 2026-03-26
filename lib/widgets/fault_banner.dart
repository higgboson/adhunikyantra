import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/circuit_model.dart';
import '../models/fault_model.dart';

class FaultBanner extends StatelessWidget {
  final Fault fault;
  final VoidCallback? onTap;

  const FaultBanner({
    super.key,
    required this.fault,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = fault.isSevere ? AppColors.danger : AppColors.warning;
    
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withValues(alpha: 0.3),
            color.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withValues(alpha: 0.5),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.3),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Pulsing icon
              _PulsingIcon(
                icon: _getFaultIcon(fault.type),
                color: color,
              ),
              const SizedBox(width: 16),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ACTIVE FAULT',
                      style: AppTypography.caption.copyWith(
                        color: color,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${fault.type.displayName} on ${fault.circuit}',
                      style: AppTypography.dmSans(
                        weight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Tap to view details and resolve',
                      style: AppTypography.caption,
                    ),
                  ],
                ),
              ),
              
              Icon(
                Icons.arrow_forward_ios,
                color: color,
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getFaultIcon(FaultType type) {
    switch (type) {
      case FaultType.short:
        return Icons.flash_on;
      case FaultType.thermal:
        return Icons.local_fire_department;
      case FaultType.overload:
        return Icons.bolt;
      case FaultType.leakage:
        return Icons.water_drop;
      default:
        return Icons.warning;
    }
  }
}

class _PulsingIcon extends StatefulWidget {
  final IconData icon;
  final Color color;

  const _PulsingIcon({
    required this.icon,
    required this.color,
  });

  @override
  State<_PulsingIcon> createState() => _PulsingIconState();
}

class _PulsingIconState extends State<_PulsingIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: widget.color.withValues(alpha: 0.2 * _animation.value),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: widget.color.withValues(alpha: 0.5 * _animation.value),
                blurRadius: 20 * _animation.value,
                spreadRadius: 2 * _animation.value,
              ),
            ],
          ),
          child: Icon(
            widget.icon,
            color: widget.color,
            size: 24,
          ),
        );
      },
    );
  }
}
