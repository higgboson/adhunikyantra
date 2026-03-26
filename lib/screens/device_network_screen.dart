import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../providers/device_provider.dart';

class DeviceNetworkScreen extends ConsumerWidget {
  const DeviceNetworkScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final deviceInfoAsync = ref.watch(deviceInfoProvider);

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
          'Device & Network',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: deviceInfoAsync.when(
        data: (deviceInfo) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Connection Status Card
              _buildConnectionStatus(deviceInfo.isOnline),
              const SizedBox(height: 16),
              
              // Network Info Card
              _buildNetworkInfo(deviceInfo),
              const SizedBox(height: 16),
              
              // Device Info Card
              _buildDeviceInfo(deviceInfo),
              const SizedBox(height: 16),
              
              // Actions
              _buildActions(context),
            ],
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        error: (error, _) => _buildError(error.toString()),
      ),
    );
  }

  Widget _buildConnectionStatus(bool isOnline) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isOnline ? AppColors.primary.withValues(alpha: 0.1) : AppColors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isOnline ? AppColors.primary.withValues(alpha: 0.3) : AppColors.warning.withValues(alpha: 0.3),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: isOnline ? AppColors.primary : AppColors.warning,
              shape: BoxShape.circle,
            ),
            child: Icon(
              isOnline ? Icons.wifi : Icons.wifi_off,
              color: AppColors.background,
              size: 28,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isOnline ? 'Device Online' : 'Device Offline',
                  style: AppTypography.heading3.copyWith(fontSize: 18),
                ),
                const SizedBox(height: 4),
                Text(
                  isOnline 
                      ? 'Connected and streaming data'
                      : 'Device not responding to ping',
                  style: AppTypography.bodySmall,
                ),
              ],
            ),
          ),
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: isOnline ? AppColors.primary : AppColors.warning,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNetworkInfo(dynamic deviceInfo) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Network Information',
            style: AppTypography.heading3.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 16),
          _buildInfoRow('IP Address', deviceInfo.ipAddress.isEmpty ? 'Unknown' : deviceInfo.ipAddress),
          _buildInfoRow('Last Seen', deviceInfo.lastSeenFormatted),
          _buildInfoRow('Firebase Latency', '< 100ms'),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () {
                    // Open local dashboard
                  },
                  icon: const Icon(Icons.open_in_browser),
                  label: const Text('Open Local Dashboard'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.secondary,
                    foregroundColor: AppColors.background,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    // Change WiFi
                  },
                  icon: const Icon(Icons.wifi),
                  label: const Text('Change WiFi Network'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceInfo(dynamic deviceInfo) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Device Information',
            style: AppTypography.heading3.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Firmware', deviceInfo.firmwareVersion.isEmpty ? 'Unknown' : deviceInfo.firmwareVersion),
          _buildInfoRow('Hardware ID', deviceInfo.hardwareId.isEmpty ? 'Unknown' : deviceInfo.hardwareId),
          _buildInfoRow('Uptime', deviceInfo.uptimeFormatted),
          _buildInfoRow('Storage Used', '${deviceInfo.spiffsUsedPct}%'),
          const SizedBox(height: 16),
          
          // Firmware update section
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.system_update,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Firmware Update',
                        style: AppTypography.dmSans(weight: FontWeight.w600),
                      ),
                      Text(
                        'Current: v${deviceInfo.firmwareVersion.isEmpty ? '1.0.0' : deviceInfo.firmwareVersion}',
                        style: AppTypography.caption,
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    // Check for updates
                  },
                  child: const Text('Check'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Actions',
          style: AppTypography.heading3.copyWith(fontSize: 18),
        ),
        const SizedBox(height: 16),
        _buildActionTile(
          icon: Icons.restart_alt,
          title: 'Restart Device',
          subtitle: 'Reboot the ESP32 remotely',
          onTap: () {
            // Restart device
          },
        ),
        _buildActionTile(
          icon: Icons.factory,
          title: 'Factory Reset',
          subtitle: 'Clear all settings and data',
          isDestructive: true,
          onTap: () {
            // Factory reset
          },
        ),
      ],
    );
  }

  Widget _buildInfoRow(String label, String value) {
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

  Widget _buildActionTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: AppDecorations.card,
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: isDestructive
                ? AppColors.danger.withValues(alpha: 0.2)
                : AppColors.primary.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: isDestructive ? AppColors.danger : AppColors.primary,
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: AppTypography.dmSans(
            weight: FontWeight.w600,
            color: isDestructive ? AppColors.danger : AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: AppTypography.bodySmall,
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: AppColors.textSecondary,
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
            size: 64,
            color: AppColors.danger,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading device info',
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
}
