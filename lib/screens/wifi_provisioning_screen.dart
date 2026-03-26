import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/theme.dart';

class WiFiProvisioningScreen extends ConsumerStatefulWidget {
  const WiFiProvisioningScreen({super.key});

  @override
  ConsumerState<WiFiProvisioningScreen> createState() => _WiFiProvisioningScreenState();
}

class _WiFiProvisioningScreenState extends ConsumerState<WiFiProvisioningScreen> {
  int _currentStep = 0;
  
  final TextEditingController _wifiNameController = TextEditingController();
  final TextEditingController _wifiPasswordController = TextEditingController();
  final List<TextEditingController> _circuitNameControllers = List.generate(
    AppConstants.circuitCount,
    (index) => TextEditingController(),
  );

  @override
  void initState() {
    super.initState();
    // Pre-fill default circuit names
    for (var i = 0; i < AppConstants.circuitCount; i++) {
      _circuitNameControllers[i].text = 
          AppConstants.defaultCircuitNames[AppConstants.circuitIds[i]] ?? 'Circuit ${i + 1}';
    }
  }

  @override
  void dispose() {
    _wifiNameController.dispose();
    _wifiPasswordController.dispose();
    for (final controller in _circuitNameControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep < 2) {
      setState(() {
        _currentStep++;
      });
    } else {
      _saveAndProceed();
    }
  }

  void _previousStep() {
    if (_currentStep > 0) {
      setState(() {
        _currentStep--;
      });
    }
  }

  void _saveAndProceed() {
    // Save circuit names to SharedPreferences
    // Then navigate to auth
    context.go('/auth');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: _currentStep > 0 
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _previousStep,
              )
            : null,
        title: Text(
          'Setup Device',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Step indicator
          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                _buildStepIndicator(0, 'Connect'),
                _buildStepConnector(0),
                _buildStepIndicator(1, 'WiFi'),
                _buildStepConnector(1),
                _buildStepIndicator(2, 'Circuits'),
              ],
            ),
          ),
          
          // Step content
          Expanded(
            child: AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              child: _buildStepContent(),
            ),
          ),
          
          // Bottom button
          Padding(
            padding: const EdgeInsets.all(24),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _nextStep,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.background,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  _currentStep == 2 ? 'Save & Start Monitoring' : 'Continue',
                  style: AppTypography.dmSans(
                    size: 16,
                    weight: FontWeight.w600,
                    color: AppColors.background,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator(int step, String label) {
    final isActive = step == _currentStep;
    final isCompleted = step < _currentStep;
    
    return Expanded(
      child: Column(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCompleted || isActive 
                  ? AppColors.primary 
                  : AppColors.cardBackground,
              border: Border.all(
                color: isCompleted || isActive 
                    ? AppColors.primary 
                    : AppColors.border,
                width: 2,
              ),
            ),
            child: Center(
              child: isCompleted
                  ? const Icon(Icons.check, size: 20, color: AppColors.background)
                  : Text(
                      '${step + 1}',
                      style: AppTypography.dmSans(
                        size: 14,
                        weight: FontWeight.bold,
                        color: isActive ? AppColors.background : AppColors.textSecondary,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: isActive ? AppColors.primary : AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildStepConnector(int step) {
    final isCompleted = step < _currentStep;
    
    return Container(
      width: 30,
      height: 2,
      color: isCompleted ? AppColors.primary : AppColors.border,
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildStep1Connect();
      case 1:
        return _buildStep2WiFi();
      case 2:
        return _buildStep3Circuits();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildStep1Connect() {
    return SingleChildScrollView(
      key: const ValueKey(0),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon
          Center(
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.cardBackground,
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(
                Icons.wifi_tethering,
                size: 48,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: 32),
          
          Text(
            'Connect to Device',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 16),
          
          Text(
            'Follow these steps to connect to your Adhunik Yantra device:',
            style: AppTypography.body,
          ),
          const SizedBox(height: 24),
          
          _buildInstructionStep(1, 'Open your phone\'s WiFi settings'),
          _buildInstructionStep(2, 'Look for "AdhunikYantra_Setup" network'),
          _buildInstructionStep(3, 'Connect to the network (no password needed)'),
          _buildInstructionStep(4, 'Return to this app to continue'),
          
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  color: AppColors.secondary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'The device will create a hotspot automatically when powered on for the first time.',
                    style: AppTypography.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep2WiFi() {
    return SingleChildScrollView(
      key: const ValueKey(1),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Enter WiFi Details',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            'Connect your device to your home network',
            style: AppTypography.body,
          ),
          const SizedBox(height: 32),
          
          TextField(
            controller: _wifiNameController,
            decoration: InputDecoration(
              labelText: 'WiFi Network Name',
              hintText: 'Enter your WiFi name',
              prefixIcon: const Icon(Icons.wifi, color: AppColors.textSecondary),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          TextField(
            controller: _wifiPasswordController,
            obscureText: true,
            decoration: InputDecoration(
              labelText: 'WiFi Password',
              hintText: 'Enter your WiFi password',
              prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textSecondary),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          
          const SizedBox(height: 24),
          
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBackground,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.security,
                  color: AppColors.primary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Your WiFi credentials are encrypted and stored securely on the device only.',
                    style: AppTypography.bodySmall,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3Circuits() {
    return SingleChildScrollView(
      key: const ValueKey(2),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Name Your Circuits',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            'Give friendly names to each circuit for easy identification',
            style: AppTypography.body,
          ),
          const SizedBox(height: 24),
          
          ...List.generate(AppConstants.circuitCount, (index) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: TextField(
                controller: _circuitNameControllers[index],
                decoration: InputDecoration(
                  labelText: 'Circuit ${index + 1}',
                  hintText: 'e.g., Living Room',
                  prefixIcon: Icon(
                    Icons.electrical_services,
                    color: AppColors.primary.withValues(alpha: 0.7),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildInstructionStep(int number, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '$number',
                style: AppTypography.dmSans(
                  size: 14,
                  weight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ),
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
    );
  }
}
