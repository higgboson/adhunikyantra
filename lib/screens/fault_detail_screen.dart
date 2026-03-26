import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../models/circuit_model.dart';
import '../models/fault_model.dart';
import '../providers/fault_provider.dart';
import '../core/constants.dart';

class FaultDetailScreen extends ConsumerStatefulWidget {
  final String faultId;
  
  const FaultDetailScreen({super.key, required this.faultId});

  @override
  ConsumerState<FaultDetailScreen> createState() => _FaultDetailScreenState();
}

class _FaultDetailScreenState extends ConsumerState<FaultDetailScreen> {
  bool _showChecklist = false;
  final List<bool> _checklistItems = [false, false, false];

  @override
  Widget build(BuildContext context) {
    final faultAsync = ref.watch(faultByIdProvider(widget.faultId));
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Fault Details',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: faultAsync.when(
        data: (fault) {
          if (fault == null) {
            return _buildNotFound();
          }
          return _buildFaultContent(fault);
        },
        loading: () => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        error: (error, _) => _buildError(error.toString()),
      ),
    );
  }

  Widget _buildFaultContent(Fault fault) {
    final isSevere = fault.isSevere;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Fault Header Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.danger.withValues(alpha: 0.3),
                  AppColors.danger.withValues(alpha: 0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: AppColors.danger.withValues(alpha: 0.5),
                width: 2,
              ),
            ),
            child: Column(
              children: [
                // Fault Icon
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.danger.withValues(alpha: 0.2),
                    border: Border.all(
                      color: AppColors.danger,
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    _getFaultIcon(fault.type),
                    size: 40,
                    color: AppColors.danger,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Fault Type
                Text(
                  fault.type.displayName,
                  style: AppTypography.orbitron(
                    size: 24,
                    weight: FontWeight.bold,
                    color: AppColors.danger,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                
                // Circuit Name
                Text(
                  'Circuit: ${fault.circuit}',
                  style: AppTypography.body.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Time
                Text(
                  fault.timeAgo,
                  style: AppTypography.caption,
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Measurements
          Text(
            'Measurements',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 16),
          
          _buildMeasurementRow('Measured Value', '${fault.measuredValue.toStringAsFixed(2)} ${_getUnit(fault.type)}'),
          _buildMeasurementRow('Threshold', '${fault.threshold.toStringAsFixed(2)} ${_getUnit(fault.type)}'),
          _buildMeasurementRow('Exceeded By', '+${fault.exceededBy.toStringAsFixed(2)} ${_getUnit(fault.type)} (${fault.exceededPercent.toStringAsFixed(1)}%)'),
          
          const SizedBox(height: 24),
          
          // Explanation
          Text(
            'What This Means',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 16),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Text(
              fault.type.description,
              style: AppTypography.body,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Severity Warning
          if (isSevere) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: AppColors.danger,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'This is a critical fault. Do not attempt to restore power without proper inspection.',
                      style: AppTypography.body.copyWith(
                        color: AppColors.danger,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
          
          // Checklist (if showing)
          if (_showChecklist) ...[
            Text(
              'Restoration Checklist',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            _buildChecklistItem(0, 'I have identified and fixed the cause'),
            _buildChecklistItem(1, 'I have inspected the wiring and connections'),
            _buildChecklistItem(2, 'I understand the risks of restoring power'),
            
            const SizedBox(height: 24),
          ],
          
          // Action Buttons
          if (!fault.resolved) ...[
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _canRestore() 
                    ? () => _restoreCircuit(fault)
                    : () => setState(() => _showChecklist = true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.background,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  _showChecklist ? 'Restore Circuit' : 'Confirm Safe to Restore',
                  style: AppTypography.dmSans(
                    size: 16,
                    weight: FontWeight.w600,
                    color: AppColors.background,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton(
                onPressed: () => _keepIsolated(fault),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.danger),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  'Keep Isolated',
                  style: AppTypography.dmSans(
                    size: 16,
                    weight: FontWeight.w600,
                    color: AppColors.danger,
                  ),
                ),
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.primary),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.primary,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'This fault has been resolved',
                      style: AppTypography.body.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildMeasurementRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          Text(
            value,
            style: AppTypography.shareTechMono(
              size: 14,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChecklistItem(int index, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          setState(() {
            _checklistItems[index] = !_checklistItems[index];
          });
        },
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.cardBackground,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _checklistItems[index] 
                  ? AppColors.primary 
                  : AppColors.border,
            ),
          ),
          child: Row(
            children: [
              Icon(
                _checklistItems[index] 
                    ? Icons.check_box 
                    : Icons.check_box_outline_blank,
                color: _checklistItems[index] 
                    ? AppColors.primary 
                    : AppColors.textSecondary,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  text,
                  style: AppTypography.body,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotFound() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.search_off,
            size: 64,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 16),
          Text(
            'Fault not found',
            style: AppTypography.heading3,
          ),
        ],
      ),
    );
  }

  Widget _buildError(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.danger,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading fault',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  bool _canRestore() {
    return _showChecklist && _checklistItems.every((item) => item);
  }

  IconData _getFaultIcon(FaultType type) {
    switch (type) {
      case FaultType.overload:
        return Icons.bolt;
      case FaultType.short:
        return Icons.flash_on;
      case FaultType.overvoltage:
        return Icons.trending_up;
      case FaultType.undervoltage:
        return Icons.trending_down;
      case FaultType.leakage:
        return Icons.water_drop;
      case FaultType.thermal:
        return Icons.local_fire_department;
      default:
        return Icons.error_outline;
    }
  }

  String _getUnit(FaultType type) {
    switch (type) {
      case FaultType.overload:
      case FaultType.short:
        return 'A';
      case FaultType.overvoltage:
      case FaultType.undervoltage:
        return 'V';
      case FaultType.leakage:
        return 'mA';
      case FaultType.thermal:
        return '°C';
      default:
        return '';
    }
  }

  void _restoreCircuit(Fault fault) {
    ref.read(faultActionsProvider.notifier).resolveFault(
      AppConstants.deviceId,
      fault.id,
      true,
    );
    context.pop();
  }

  void _keepIsolated(Fault fault) {
    // Mark as resolved but keep isolated
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text('Keep Isolated', style: AppTypography.heading3),
        content: Text(
          'The circuit will remain off. You can restore it later from the Circuit Control screen.',
          style: AppTypography.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: AppTypography.body),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(faultActionsProvider.notifier).resolveFault(
                AppConstants.deviceId,
                fault.id,
                true,
              );
              context.pop();
            },
            child: Text('Confirm', style: AppTypography.body.copyWith(color: AppColors.background)),
          ),
        ],
      ),
    );
  }
}
