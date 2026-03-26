import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../core/constants.dart';
import '../models/circuit_model.dart';
import '../providers/circuit_provider.dart';
import '../providers/settings_provider.dart';

class CircuitControlScreen extends ConsumerStatefulWidget {
  const CircuitControlScreen({super.key});

  @override
  ConsumerState<CircuitControlScreen> createState() => _CircuitControlScreenState();
}

class _CircuitControlScreenState extends ConsumerState<CircuitControlScreen> {
  void _showToggleConfirmation(Circuit circuit, bool newState) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text(
          newState ? 'Turn ON ${circuit.name}?' : 'Turn OFF ${circuit.name}?',
          style: AppTypography.heading3,
        ),
        content: Text(
          newState
              ? 'This will restore power to the circuit. Make sure it is safe to do so.'
              : 'This will cut power to the circuit. Any connected devices will stop working.',
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
              _toggleCircuit(circuit, newState);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: newState ? AppColors.primary : AppColors.danger,
            ),
            child: Text(
              newState ? 'Turn ON' : 'Turn OFF',
              style: AppTypography.body.copyWith(color: AppColors.background),
            ),
          ),
        ],
      ),
    );
  }

  void _toggleCircuit(Circuit circuit, bool newState) {
    ref.read(circuitActionsProvider.notifier).toggleRelay(
      AppConstants.deviceId,
      circuit.id,
      newState,
    );
  }

  void _showMinOnTimePicker(Circuit circuit) {
    int selectedMinutes = 30;
    
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Minimum ON Time',
                    style: AppTypography.heading3,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Prevent accidental switching for motors and pumps',
                    style: AppTypography.bodySmall,
                  ),
                  const SizedBox(height: 24),
                  
                  // Picker simulation with ListWheelScrollView
                  Container(
                    height: 150,
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListWheelScrollView.useDelegate(
                      itemExtent: 40,
                      perspective: 0.005,
                      diameterRatio: 1.2,
                      onSelectedItemChanged: (index) {
                        setModalState(() {
                          selectedMinutes = (index + 1) * 5;
                        });
                      },
                      childDelegate: ListWheelChildBuilderDelegate(
                        builder: (context, index) {
                          final minutes = (index + 1) * 5;
                          final isSelected = minutes == selectedMinutes;
                          return Center(
                            child: Text(
                              '$minutes min',
                              style: AppTypography.shareTechMono(
                                size: isSelected ? 20 : 16,
                                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                              ),
                            ),
                          );
                        },
                        childCount: 24, // 5 to 120 minutes
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        // Update min on time in EWMA config
                      },
                      child: Text(
                        'Set ${selectedMinutes} Minutes',
                        style: AppTypography.dmSans(
                          size: 16,
                          weight: FontWeight.w600,
                          color: AppColors.background,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAllCircuitsDialog(bool turnOn) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text(
          turnOn ? 'Turn ALL Circuits ON?' : 'Turn ALL Circuits OFF?',
          style: AppTypography.heading3,
        ),
        content: Text(
          turnOn
              ? 'This will restore power to all circuits. Make sure it is safe to do so.'
              : 'This will cut power to ALL circuits. Any connected devices will stop working.',
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
              // Toggle all circuits
              final circuitsAsync = ref.read(circuitsProvider);
              circuitsAsync.whenData((circuits) {
                for (final circuit in circuits) {
                  ref.read(circuitActionsProvider.notifier).toggleRelay(
                    AppConstants.deviceId,
                    circuit.id,
                    turnOn,
                  );
                }
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: turnOn ? AppColors.primary : AppColors.danger,
            ),
            child: Text(
              turnOn ? 'Turn ALL ON' : 'Turn ALL OFF',
              style: AppTypography.body.copyWith(color: AppColors.background),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final circuitsAsync = ref.watch(circuitsProvider);
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Circuit Control',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Master controls
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _showAllCircuitsDialog(true),
                    icon: const Icon(Icons.power),
                    label: const Text('ALL ON'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.background,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _showAllCircuitsDialog(false),
                    icon: const Icon(Icons.power_off),
                    label: const Text('ALL OFF'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: AppColors.danger),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Circuit list
          Expanded(
            child: circuitsAsync.when(
              data: (circuits) {
                return settingsAsync.when(
                  data: (settings) => ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: circuits.length,
                    itemBuilder: (context, index) {
                      return _buildCircuitControlCard(circuits[index], settings.electricityRateRs);
                    },
                  ),
                  loading: () => const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                  error: (_, __) => const SizedBox.shrink(),
                );
              },
              loading: () => ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: 4,
                itemBuilder: (context, index) => _buildCircuitShimmer(),
              ),
              error: (error, _) => _buildError(error.toString()),
            ),
          ),
          
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildCircuitControlCard(Circuit circuit, double rate) {
    final isFault = circuit.faultActive;
    final costToday = circuit.getCostToday(rate);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: AppDecorations.cardGlow,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with name and toggle
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        circuit.name,
                        style: AppTypography.heading3.copyWith(fontSize: 18),
                      ),
                      if (isFault)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.danger.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'FAULT ISOLATED',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.danger,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                
                // Large toggle switch
                SizedBox(
                  width: 80,
                  height: 56,
                  child: Switch(
                    value: circuit.relayState,
                    onChanged: isFault
                        ? null
                        : (value) => _showToggleConfirmation(circuit, value),
                    activeThumbColor: AppColors.primary,
                    activeTrackColor: AppColors.primary.withValues(alpha: 0.3),
                    inactiveThumbColor: AppColors.textSecondary,
                    inactiveTrackColor: AppColors.border,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            const Divider(color: AppColors.border),
            const SizedBox(height: 16),
            
            // Live readings
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildReading('Current', '${circuit.current.toStringAsFixed(2)} A', 
                    AppColors.getCurrentColor(circuit.current)),
                _buildReading('Power', '${circuit.power.toStringAsFixed(0)} W', 
                    AppColors.primary),
                _buildReading('Temp', '${circuit.temp.toStringAsFixed(1)}°C', 
                    AppColors.getTempColor(circuit.temp)),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Additional info
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'MCB: ${circuit.mcbRating.toStringAsFixed(0)}A',
                  style: AppTypography.bodySmall,
                ),
                Text(
                  'Today: ${costToday.toStringAsFixed(1)} kWh • Rs ${(costToday * rate).toStringAsFixed(0)}',
                  style: AppTypography.bodySmall,
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Action chips
            Wrap(
              spacing: 8,
              children: [
                _buildActionChip(
                  Icons.timer_outlined,
                  'Min ON Time',
                  () => _showMinOnTimePicker(circuit),
                ),
                _buildActionChip(
                  Icons.history,
                  'History',
                  () => context.push('/history'),
                ),
                _buildActionChip(
                  Icons.edit,
                  'Edit Name',
                  () => _showEditNameDialog(circuit),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReading(String label, String value, Color color) {
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
            size: 16,
            color: color,
            weight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildActionChip(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: AppColors.textSecondary),
            const SizedBox(width: 6),
            Text(
              label,
              style: AppTypography.caption,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircuitShimmer() {
    return Container(
      height: 200,
      margin: const EdgeInsets.only(bottom: 16),
      decoration: AppDecorations.card,
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
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
            size: 48,
            color: AppColors.danger,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading circuits',
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

  void _showEditNameDialog(Circuit circuit) {
    final controller = TextEditingController(text: circuit.name);
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text('Edit Circuit Name', style: AppTypography.heading3),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            labelText: 'Circuit Name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: AppTypography.body),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(circuitActionsProvider.notifier).updateCircuitName(
                AppConstants.deviceId,
                circuit.id,
                controller.text,
              );
            },
            child: Text('Save', style: AppTypography.body.copyWith(color: AppColors.background)),
          ),
        ],
      ),
    );
  }
}
