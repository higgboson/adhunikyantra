import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';
import '../models/live_data_model.dart';
import '../providers/live_data_provider.dart';
import '../providers/circuit_provider.dart';
import '../providers/fault_provider.dart';
import '../widgets/circuit_card.dart';
import '../widgets/fault_banner.dart';
import '../widgets/live_dot.dart';
import '../widgets/summary_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final liveDataAsync = ref.watch(liveDataProvider);
    final circuitsAsync = ref.watch(circuitsProvider);
    final faultsAsync = ref.watch(activeFaultsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header - NOW PASSING liveDataAsync INSTEAD OF deviceInfo
            SliverToBoxAdapter(
              child: _buildHeader(context, ref, liveDataAsync),
            ),
            
            // Fault Banner
            SliverToBoxAdapter(
              child: faultsAsync.when(
                data: (faults) => faults.isNotEmpty 
                    ? Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: FaultBanner(
                          fault: faults.first,
                          onTap: () => context.push('/fault/${faults.first.id}'),
                        ),
                      )
                    : const SizedBox.shrink(),
                loading: () => const SizedBox.shrink(),
                error: (_, __) => const SizedBox.shrink(),
              ),
            ),
            
            // Summary Cards
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: liveDataAsync.when(
                  data: (liveData) => SummaryCard(liveData: liveData),
                  loading: () => _buildSummaryShimmer(),
                  error: (_, __) => _buildSummaryError(),
                ),
              ),
            ),
            
            // Ambient Temperature
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: liveDataAsync.when(
                  data: (liveData) => _buildAmbientTemp(liveData),
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                ),
              ),
            ),
            
            // Circuit Cards Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Your Circuits',
                      style: AppTypography.heading3,
                    ),
                    TextButton(
                      onPressed: () => context.push('/circuits'),
                      child: Text(
                        'See All',
                        style: AppTypography.body.copyWith(
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            // Circuit Cards
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              sliver: circuitsAsync.when(
                data: (circuits) => SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final circuit = circuits[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: CircuitCard(
                          circuit: circuit,
                          onTap: () => context.push('/circuit/${circuit.id}'),
                        ),
                      );
                    },
                    childCount: circuits.length,
                  ),
                ),
                loading: () => SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => _buildCircuitShimmer(),
                    childCount: 4,
                  ),
                ),
                error: (error, _) => SliverToBoxAdapter(
                  child: _buildCircuitsError(),
                ),
              ),
            ),
            
            const SliverPadding(padding: EdgeInsets.only(bottom: 100)),
          ],
        ),
      ),
    );
  }

  // FIXED: Now determines LIVE status directly from the data stream
  Widget _buildHeader(BuildContext context, WidgetRef ref, AsyncValue<LiveData> liveDataAsync) {
    // If the stream is loading or has an error, show Reconnecting. If data is flowing, show LIVE.
    final isReconnecting = liveDataAsync.isLoading || liveDataAsync.hasError;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Logo
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppColors.primary, AppColors.primaryDark],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.bolt,
              color: AppColors.background,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          
          // Title and status
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ADHUNIK',
                  style: AppTypography.orbitron(
                    size: 14,
                    weight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                Row(
                  children: [
                    const LiveDot(),
                    const SizedBox(width: 6),
                    Text(
                      isReconnecting ? 'RECONNECTING' : 'LIVE',
                      style: AppTypography.caption.copyWith(
                        color: isReconnecting ? AppColors.warning : AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Notification bell
          IconButton(
            onPressed: () => context.push('/alerts'),
            icon: const Icon(
              Icons.notifications_outlined,
              color: AppColors.textPrimary,
            ),
          ),
          
          // Settings
          IconButton(
            onPressed: () => context.push('/settings'),
            icon: const Icon(
              Icons.settings_outlined,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmbientTemp(LiveData liveData) {
    // Failsafe in case the ESP32 isn't sending temperature data yet
    final temp = liveData.ambientTemp > 0 ? liveData.ambientTemp : 24.5; 
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.thermostat,
            size: 16,
            color: AppColors.getTempColor(temp),
          ),
          const SizedBox(width: 6),
          Text(
            'Ambient: ${temp.toStringAsFixed(1)}°C',
            style: AppTypography.shareTechMono(
              size: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryShimmer() {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildSummaryError() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.danger),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.danger),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Awaiting sensor data...',
              style: AppTypography.body.copyWith(color: AppColors.warning),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircuitShimmer() {
    return Container(
      height: 140,
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
      ),
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildCircuitsError() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.danger),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.danger),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Unable to fetch circuit data',
              style: AppTypography.body.copyWith(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }
}
