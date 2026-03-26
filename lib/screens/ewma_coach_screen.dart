import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../providers/circuit_provider.dart';
import '../providers/device_provider.dart';

class EwmaCoachScreen extends ConsumerStatefulWidget {
  const EwmaCoachScreen({super.key});

  @override
  ConsumerState<EwmaCoachScreen> createState() => _EwmaCoachScreenState();
}

class _EwmaCoachScreenState extends ConsumerState<EwmaCoachScreen> {
  String? _selectedCircuit;
  int _calibrationHours = 48;
  double _sensitivity = 5;
  int _minOnMinutes = 30;

  @override
  Widget build(BuildContext context) {
    final circuitsAsync = ref.watch(circuitsProvider);
    final ewmaConfigsAsync = ref.watch(ewmaConfigsProvider);

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
          'Energy Coach',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header info
            Container(
              padding: const EdgeInsets.all(20),
              decoration: AppDecorations.cardGlow,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.psychology,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'AI-Powered Learning',
                              style: AppTypography.heading3.copyWith(fontSize: 18),
                            ),
                            Text(
                              'EWMA anomaly detection',
                              style: AppTypography.bodySmall,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'The Energy Coach learns your normal usage patterns and alerts you to unusual behavior, like devices left on or potential malfunctions.',
                    style: AppTypography.body,
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Circuit Training Status
            Text(
              'Circuit Training Status',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            circuitsAsync.when(
              data: (circuits) {
                return ewmaConfigsAsync.when(
                  data: (configs) {
                    return Column(
                      children: circuits.map((circuit) {
                        final config = configs[circuit.id];
                        return _buildCircuitTrainingCard(circuit, config);
                      }).toList(),
                    );
                  },
                  loading: () => _buildLoadingCard(),
                  error: (_, __) => const SizedBox.shrink(),
                );
              },
              loading: () => _buildLoadingCard(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            
            const SizedBox(height: 24),
            
            // Start Calibration Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () => _showCalibrationSheet(),
                icon: const Icon(Icons.play_arrow),
                label: Text(
                  'Start Baseline Calibration',
                  style: AppTypography.dmSans(
                    size: 16,
                    weight: FontWeight.w600,
                    color: AppColors.background,
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // AI Insights
            Text(
              'AI Insights',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            _buildInsightCard(
              icon: Icons.electric_bolt,
              title: 'Highest Consumer',
              description: 'AC Unit is using 45% of total power. Consider using during off-peak hours.',
              color: AppColors.warning,
            ),
            
            const SizedBox(height: 12),
            
            _buildInsightCard(
              icon: Icons.access_time,
              title: 'Left On Pattern Detected',
              description: 'Living Room lights were left on 3 times this week. Potential waste: Rs 120/month.',
              color: AppColors.secondary,
            ),
            
            const SizedBox(height: 12),
            
            _buildInsightCard(
              icon: Icons.health_and_safety,
              title: 'Motor Health Declining',
              description: 'Kitchen refrigerator motor showing 5% efficiency drop. Schedule maintenance soon.',
              color: AppColors.primary,
            ),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildCircuitTrainingCard(dynamic circuit, dynamic config) {
    final isCalibrating = config?.calibrating ?? false;
    final isTrained = circuit.ewmaTrained;
    final trainingPct = circuit.ewmaTrainingPct;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  circuit.name,
                  style: AppTypography.dmSans(weight: FontWeight.w600),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isCalibrating
                      ? AppColors.warning.withValues(alpha: 0.2)
                      : isTrained
                          ? AppColors.primary.withValues(alpha: 0.2)
                          : AppColors.textSecondary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  isCalibrating
                      ? 'Learning...'
                      : isTrained
                          ? 'Trained'
                          : 'Not Trained',
                  style: AppTypography.caption.copyWith(
                    color: isCalibrating
                        ? AppColors.warning
                        : isTrained
                            ? AppColors.primary
                            : AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: trainingPct / 100,
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation<Color>(
                isCalibrating ? AppColors.warning : AppColors.primary,
              ),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${trainingPct.toInt()}% complete',
                style: AppTypography.caption,
              ),
              if (isTrained)
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
    );
  }

  Widget _buildInsightCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppDecorations.card,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.dmSans(weight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: AppTypography.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Container(
      height: 100,
      decoration: AppDecorations.card,
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      ),
    );
  }

  void _showCalibrationSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 24,
                right: 24,
                top: 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.border,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    Text(
                      'Start Calibration',
                      style: AppTypography.heading3,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Configure EWMA learning parameters',
                      style: AppTypography.bodySmall,
                    ),
                    const SizedBox(height: 24),
                    
                    // Circuit selector
                    Text('Select Circuit', style: AppTypography.body),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedCircuit,
                          isExpanded: true,
                          dropdownColor: AppColors.cardBackground,
                          hint: Text('Choose a circuit', style: AppTypography.bodySmall),
                          items: AppConstants.circuitIds.map((id) {
                            return DropdownMenuItem(
                              value: id,
                              child: Text(
                                AppConstants.defaultCircuitNames[id] ?? id,
                                style: AppTypography.body,
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setModalState(() {
                              _selectedCircuit = value;
                            });
                          },
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Duration picker
                    Text('Calibration Duration', style: AppTypography.body),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: [24, 48, 72, 168].map((hours) {
                        final isSelected = _calibrationHours == hours;
                        final label = hours < 48 ? '${hours}h' : 
                                     hours < 100 ? '48h (recommended)' : '1 week';
                        return ChoiceChip(
                          label: Text(label),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setModalState(() {
                                _calibrationHours = hours;
                              });
                            }
                          },
                          selectedColor: AppColors.primary,
                          backgroundColor: AppColors.background,
                          labelStyle: TextStyle(
                            color: isSelected ? AppColors.background : AppColors.textPrimary,
                          ),
                        );
                      }).toList(),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Sensitivity slider
                    Text('Sensitivity (1-10)', style: AppTypography.body),
                    const SizedBox(height: 8),
                    Slider(
                      value: _sensitivity,
                      min: 1,
                      max: 10,
                      divisions: 9,
                      activeColor: AppColors.primary,
                      label: _sensitivity.toInt().toString(),
                      onChanged: (value) {
                        setModalState(() {
                          _sensitivity = value;
                        });
                      },
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Min ON time
                    Text('Minimum ON Time (minutes)', style: AppTypography.body),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _minOnMinutes,
                          isExpanded: true,
                          dropdownColor: AppColors.cardBackground,
                          items: [5, 10, 15, 30, 45, 60].map((minutes) {
                            return DropdownMenuItem(
                              value: minutes,
                              child: Text(
                                '$minutes minutes',
                                style: AppTypography.body,
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            if (value != null) {
                              setModalState(() {
                                _minOnMinutes = value;
                              });
                            }
                          },
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _selectedCircuit != null
                            ? () {
                                Navigator.pop(context);
                                _startCalibration();
                              }
                            : null,
                        child: Text(
                          'Start Calibration',
                          style: AppTypography.dmSans(
                            size: 16,
                            weight: FontWeight.w600,
                            color: AppColors.background,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _startCalibration() {
    if (_selectedCircuit != null) {
      ref.read(ewmaActionsProvider.notifier).startCalibration(
        AppConstants.deviceId,
        _selectedCircuit!,
        _calibrationHours,
        _sensitivity,
        _minOnMinutes,
      );
    }
  }
}
